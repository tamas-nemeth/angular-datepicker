import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { getLocaleFirstDayOfWeek, WeekDay } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceNumberProperty } from '@angular/cdk/coercion';

import { addMonths, addDays, isDate, startOfDay, startOfMonth, areDatesInSameMonth } from 'date-utils';

import { MonthStep } from './calendar-month-header/month-step.model';
import { DayStep } from './calendar-month-header/day-step.model';


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
export class CalendarComponent implements AfterContentInit, ControlValueAccessor, OnChanges, OnInit {
  months!: readonly Date[];
  touched = false;
  disabled = false;
  showMonthStepper = true;
  activeDate = startOfDay(new Date());

  private onChange?: (updatedValue: Date) => void;
  private onTouched?: () => void;
  private monthStepperPosition?: Date;

  @Input() value?: Date;
  @Input() min?: Date;
  @Input() monthAndYearFormat?: string;

  // locale input is for demo purposes only - until there is an API for switching the locale at runtime
  private _locale?: string;

  @Input()
  get locale() {
    return this._locale;
  }

  set locale(locale: string | undefined) {
    this._locale = locale || this.localeId;
  }

  private _firstDayOfWeek?: keyof typeof WeekDay;

  @Input()
  get firstDayOfWeek() {
    return this._firstDayOfWeek || this.getDefaultFirstDayOfWeek();
  }

  set firstDayOfWeek(firstDayOfWeek: keyof typeof WeekDay) {
    this._firstDayOfWeek = firstDayOfWeek;
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

  @Output() valueChange = new EventEmitter<Date>();

  trackByMilliseconds = (_: number, month: Date) => {
    // avoid destroying month and month-header components in one-month view (with month steppers)
    // otherwise month stepper buttons would lose focus after press
    // also avoid destroying them when changing firstMonth in multi-month view
    return this.numberOfMonths === 1 || month.getTime();
  }

  constructor(public changeDetectorRef: ChangeDetectorRef,
              @Inject(LOCALE_ID) private localeId: string,
              private elementRef: ElementRef) {}

  ngOnInit() {
    if (!this.locale) {
      this.locale = this.localeId;
    }
  }

  ngAfterContentInit() {
    // first lifecycle hook after attached FormControl calls writeValue() with the value passed to its constructor
    this.months = this.getMonths();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.numberOfMonths && !changes.numberOfMonths.firstChange) || (changes.firstMonth && !changes.firstMonth.firstChange)) {
      this.months = this.getMonths();
    }
  }

  onDayStep(daySteps: DayStep) {
    this.activeDate = addDays(this.activeDate, daySteps);

    if (!areDatesInSameMonth(this.activeDate, this.monthStepperPosition || new Date())) {
      this.monthStepperPosition = startOfMonth(this.activeDate);
      if (this.numberOfMonths === 1) {
        this.months = this.getMonths();
      }
    }

    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('[tabindex="0"]').focus();
    });
  }

  onMonthStep(step: MonthStep) {
    this.monthStepperPosition = addMonths(this.monthStepperPosition || new Date(), step);
    this.activeDate = addMonths(this.activeDate, step);
    this.months = this.getMonths();
  }

  onSelect(date: Date) {
    if (!this.disabled) {
      this.value = date;
      this.monthStepperPosition = date;
      this.valueChange.emit(date);
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

  private getDefaultFirstDayOfWeek() {
    return WeekDay[getLocaleFirstDayOfWeek(this.locale!)] as keyof typeof WeekDay;
  }
}
