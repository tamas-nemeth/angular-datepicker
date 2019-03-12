import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceNumberProperty } from '@angular/cdk/coercion';

import { addMonths, isDate, startOfDay, startOfMonth } from 'date-utils';

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
  selectedDate?: Date;
  touched = false;
  disabled = false;
  displayMonthStepper = true;

  private onChange?: (updatedValue: Date) => void;
  private onTouched?: () => void;
  private monthStepperPosition?: Date;

  @Input() firstDayOfWeek: 'SUNDAY' | 'MONDAY' = 'SUNDAY';
  @Input() locale?: string;
  @Input() min?: Date;
  @Input() monthCaptionPattern?: string;

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
    this.displayMonthStepper = this._numberOfMonths === 1;
  }

  get numberOfMonths() {
    return this._numberOfMonths;
  }

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  ngAfterContentInit() {
    // first lifecycle hook after attached FormControl calls writeValue() with the value passed to its constructor
    this.months = this.getMonths();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.numberOfMonths && !changes.numberOfMonths.firstChange) || (changes.firstMonth && !changes.firstMonth.firstChange)) {
      this.months = this.getMonths();
    }
  }

  private getMonths() {
    const firstMonth = (this.numberOfMonths === 1 ? this.monthStepperPosition : this.firstMonth) || new Date();
    const startOfFirstMonth = startOfMonth(firstMonth);
    return Array.from({length: this.numberOfMonths}, (_, index) => addMonths(startOfFirstMonth, index));
  }

  trackByMilliseconds(_: number, month: Date) {
    return month.getTime();
  }

  onMonthStep(step: -1 | 1) {
    this.monthStepperPosition = addMonths(this.monthStepperPosition || new Date(), step);
    this.months = this.getMonths();
  }

  onPick(date: Date) {
    if (!this.disabled) {
      this.selectedDate = date;
      this.monthStepperPosition = date;
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
    this.selectedDate = isDate(value) ? startOfDay(value) : undefined;
    this.changeDetectorRef.markForCheck();

    if (this.numberOfMonths === 1 && this.selectedDate) {
      this.monthStepperPosition = this.selectedDate;
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

  setDisabledState?(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }
}
