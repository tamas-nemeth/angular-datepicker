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

import { addMonths, areDatesInSameMonth, isValidDate, setDate, startOfDay, startOfMonth } from 'date-utils';
import { CustomControl } from '../../../modal/src/lib/custom-control';

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true
    },
    {
      provide: CustomControl,
      useExisting: CalendarComponent
    }
  ]
})
export class CalendarComponent extends CustomControl<Date> implements AfterContentInit, ControlValueAccessor, OnChanges, OnInit {
  months!: readonly Date[];
  touched = false;
  disabled = false;
  showMonthStepper = true;
  activeDate = startOfDay(new Date());
  activeMonth?: Date;

  private onChange?: (updatedValue: Date) => void;
  private onTouched?: () => void;

  @Input() value?: Date;
  @Input() min?: Date | null;
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

  private _firstMonth?: Date | null;

  @Input()
  set firstMonth(firstMonth: Date | undefined | null) {
    this._firstMonth = firstMonth;
    this.activeMonth = this._firstMonth || undefined;
  }

  get firstMonth(): Date | undefined | null {
    return this._firstMonth;
  }

  private _numberOfMonths = 1;

  @Input()
  set numberOfMonths(numberOfMonths: any) {
    this._numberOfMonths = coerceNumberProperty(numberOfMonths);
    this.showMonthStepper = this._numberOfMonths <= 2;
  }

  get numberOfMonths() {
    return this._numberOfMonths;
  }

  @Output() valueChange = new EventEmitter<Date>();

  trackByMilliseconds = (_: number, month: Date) => {
    // avoid destroying month and month-header components in one-month view (with month steppers)
    // otherwise month stepper buttons would lose focus after press
    // also avoid destroying them when changing firstMonth in multi-month view
    return this.showMonthStepper || month.getTime();
  }

  constructor(public changeDetectorRef: ChangeDetectorRef,
              @Inject(LOCALE_ID) private localeId: string,
              private elementRef: ElementRef) {
    super();
  }

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

  onActiveDateChange(activeDate: Date) {
    this.activeDate = activeDate;

    if (!areDatesInSameMonth(this.activeDate, this.activeMonth || new Date())) {
      this.activeMonth = startOfMonth(this.activeDate);
      if (this.showMonthStepper) {
        this.months = this.getMonths();
      }
    }

    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('[tabindex="0"]').focus();
    });
  }

  onActiveMonthChange(activeMonth: Date) {
    this.activeMonth = activeMonth;
    this.activeDate = setDate(this.activeMonth, this.activeDate.getDate());
    this.months = this.getMonths();
  }

  onSelect(date: Date) {
    if (!this.disabled) {
      this.value = date;
      this.activeMonth = date;
      this.activeDate = date;
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
    this.value = isValidDate(value) ? startOfDay(value) : undefined;
    this.changeDetectorRef.markForCheck();

    if (this.showMonthStepper && this.value) {
      this.activeMonth = this.value;
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
    const firstMonth = (this.showMonthStepper ? this.activeMonth : this.firstMonth) || new Date();
    const startOfFirstMonth = startOfMonth(firstMonth);
    return Array.from({length: this.numberOfMonths}, (_, index) => addMonths(startOfFirstMonth, index));
  }

  private getDefaultFirstDayOfWeek() {
    return WeekDay[getLocaleFirstDayOfWeek(this.locale!)] as keyof typeof WeekDay;
  }
}
