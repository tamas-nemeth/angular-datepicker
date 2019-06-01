import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceNumberProperty } from '@angular/cdk/coercion';

import { addMonths, isDate, startOfDay, startOfMonth } from 'date-utils';

import { MonthStep } from './calendar-month-header/month-step.model';

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true
    }
  ]
})
export class CalendarComponent implements AfterContentInit, ControlValueAccessor, OnChanges {
  months!: Date[];
  value?: Date;
  touched = false;
  disabled = false;
  showMonthStepper = true;

  private onChange?: (updatedValue: Date) => void;
  private onTouched?: () => void;
  private monthStepperPosition?: Date;

  @Input() firstDayOfWeek: 'SUNDAY' | 'MONDAY' = 'SUNDAY';
  @Input() min?: Date;
  @Input() monthCaptionPattern?: string;

  // locale input is for demo purposes only - until the Ivy renderer arrives, there is no API for switching the locale at runtime
  private _locale?: string;

  @Input()
  get locale() {
    return this._locale || this.localeId;
  }

  set locale(locale: string) {
    this._locale = locale;
  }

  private _firstMonth?: Date;

  @Input()
  set firstMonth(firstMonth: Date | undefined) {
    this._firstMonth = firstMonth;
    this.monthStepperPosition = this._firstMonth;
  }

  get firstMonth(): Date | undefined {
    return this._firstMonth;
  }

  private _numberOfMonths = 1;

  @Input()
  set numberOfMonths(numberOfMonths: any) {
    this._numberOfMonths = coerceNumberProperty(numberOfMonths);
    this.showMonthStepper = this._numberOfMonths === 1;
  }

  get numberOfMonths() {
    return this._numberOfMonths;
  }

  @Output() change = new EventEmitter<Date>();

  constructor(public changeDetectorRef: ChangeDetectorRef, @Inject(LOCALE_ID) private localeId: string) {}

  ngAfterContentInit() {
    // first lifecycle hook after attached FormControl calls writeValue() with the value passed to its constructor
    this.months = this.getMonths();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.numberOfMonths && !changes.numberOfMonths.firstChange) || (changes.firstMonth && !changes.firstMonth.firstChange)) {
      this.months = this.getMonths();
    }
  }

  trackByMilliseconds(_: number, month: Date) {
    return month.getTime();
  }

  onMonthStep(step: MonthStep) {
    this.monthStepperPosition = addMonths(this.monthStepperPosition || new Date(), step);
    this.months = this.getMonths();
  }

  onSelect(date: Date) {
    if (!this.disabled) {
      this.value = date;
      this.monthStepperPosition = date;
      this.change.emit(date);
      if (this.onChange) {
        this.onChange(date);
      }
      if (this.onTouched) {
        this.onTouched();
      }
    }
  }

  writeValue(value: Date) {
    // TODO: what if calendar or the given date is disabled?
    this.value = isDate(value) ? startOfDay(value) : undefined;
    this.changeDetectorRef.markForCheck();

    if (this.showMonthStepper && this.value) {
      this.monthStepperPosition = this.value;
      this.months = this.getMonths();
    }
  }

  registerOnChange(onChangeCallback: (updatedValue: Date) => void) {
    this.onChange = onChangeCallback;
  }

  registerOnTouched(onTouchedCallback: () => void) {
    this.onTouched = () => {
      this.touched = true;
      onTouchedCallback();
    };
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  private getMonths() {
    const firstMonth = (this.showMonthStepper ? this.monthStepperPosition : this.firstMonth) || new Date();
    const startOfFirstMonth = startOfMonth(firstMonth);
    return Array.from({length: this.numberOfMonths}, (_, index) => addMonths(startOfFirstMonth, index));
  }
}
