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

import { addMonths, isDate, setDate, startOfDay } from 'date-utils';

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

  private onChange?: (updatedValue: Date) => void;
  private onTouched?: () => void;

  @Input() firstDayOfWeek: 'SUNDAY' | 'MONDAY' = 'SUNDAY';
  @Input() locale?: string;
  @Input() min?: Date;
  @Input() monthCaptionPattern?: string;

  private _firstMonth?: Date;

  @Input()
  set firstMonth(firstMonth: Date | undefined) {
    this._firstMonth = firstMonth;
  }

  get firstMonth(): Date | undefined {
    return this._firstMonth;
  }

  private _numberOfMonths = 1;

  @Input()
  set numberOfMonths(numberOfMonths: any) {
    this._numberOfMonths = coerceNumberProperty(numberOfMonths);
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
    const firstMonth = this.firstMonth || (this.numberOfMonths === 1 && this.selectedDate ? this.selectedDate : new Date());
    const startOfFirstMonth = setDate(startOfDay(firstMonth), 1);
    return Array.from({length: this.numberOfMonths}, (_, index) => addMonths(startOfFirstMonth, index));
  }

  trackByMilliseconds(_: number, month: Date) {
    return +month;
  }

  onPick(date: Date) {
    if (!this.disabled) {
      this.selectedDate = date;
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
