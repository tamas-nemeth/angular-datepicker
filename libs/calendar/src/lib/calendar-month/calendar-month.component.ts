import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { areDatesInSameMonth, DayOfWeek, getDaysOfMonth, isDateAfter, isSameDate, NumericDayOfWeek, startOfDay } from 'date-utils';

@Component({
  selector: 'lib-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonthComponent implements AfterViewInit, OnChanges {
  daysOfMonth!: Date[];
  firstDayOfMonth!: string;

  private readonly defaultMonthCaptionPattern = 'MMMM y';
  private readonly dateSelector = '.calendar-month__date';

  @Input() selectedDate?: Date;
  @Input() min?: Date;
  @Input() showMonthStepper = true;
  @Input() locale?: string;

  private _month!: Date;

  @Input()
  set month(month: Date) {
    if (!this._month || !areDatesInSameMonth(this._month, month)) {
      this._month = month;
      this.daysOfMonth = getDaysOfMonth(this._month);
      this.firstDayOfMonth = DayOfWeek[this.daysOfMonth[0].getDay() as NumericDayOfWeek].toLowerCase();
    }
  }

  get month() {
    return this._month;
  }

  private _monthCaptionPattern?: string;

  @Input()
  set monthCaptionPattern(monthCaptionPattern: string | undefined) {
    this._monthCaptionPattern = monthCaptionPattern;
  }

  get monthCaptionPattern() {
    return this._monthCaptionPattern || this.defaultMonthCaptionPattern;
  }

  @Output() select = new EventEmitter<Date>();
  @Output() monthStep = new EventEmitter<-1 | 1>();

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.changeDetectorRef.detach();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.entries(changes).some(([input, change]) => input !== 'month' && !change.firstChange)) {
      this.changeDetectorRef.detectChanges();
    }
  }

  isSelected(dayOfMonth: Date) {
    return !!this.selectedDate && isSameDate(dayOfMonth, this.selectedDate);
  }

  isDisabled(dayOfMonth: Date) {
    return !!this.min && isDateAfter(this.min, dayOfMonth);
  }

  stepMonth(step: number) {
    this.monthStep.emit(step as -1 | 1);
  }

  onMonthClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target && target.matches(this.dateSelector)) {
      this.onDateClick(target);
    }
  }

  private onDateClick(dateElement: HTMLElement) {
    const datetimeAttribute = dateElement.getAttribute('datetime');

    if (datetimeAttribute) {
      const clickedDate = startOfDay(new Date(datetimeAttribute));
      this.selectDate(clickedDate);
    }
  }

  private selectDate(date: Date) {
    if (!this.isSelected(date) && !this.isDisabled(date)) {
      this.select.emit(date);
    }
  }
}
