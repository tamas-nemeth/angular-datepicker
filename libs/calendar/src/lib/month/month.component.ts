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
import { WeekDay } from '@angular/common';
import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@angular/cdk/keycodes';

import { areDatesInSameMonth, getDaysOfMonth, isDateAfter, isSameDate, startOfDay } from 'date-utils';
import { DayStepDelta } from './day-step-delta.model';

export const keyCodesToDaySteps = new Map<number, DayStepDelta>([
  [RIGHT_ARROW, 1],
  [LEFT_ARROW, -1],
  [DOWN_ARROW, 7],
  [UP_ARROW, -7]
]);

@Component({
  selector: 'lib-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthComponent implements AfterViewInit, OnChanges {
  daysOfMonth!: readonly Date[];
  firstDayOfMonth!: string;
  currentDate = startOfDay(new Date());

  private readonly dateSelector = '.month__date';

  @Input() selectedDate?: Date;
  @Input() min?: Date;
  @Input() locale?: string;
  @Input() activeDate?: Date;

  private _month!: Date;

  @Input()
  get month() {
    return this._month;
  }
  set month(month: Date) {
    if (!this._month || !areDatesInSameMonth(this._month, month)) {
      this._month = month;
      this.daysOfMonth = getDaysOfMonth(this._month);
      this.firstDayOfMonth = WeekDay[this.daysOfMonth[0].getDay()].toLowerCase();
    }
  }

  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() dayStep = new EventEmitter<DayStepDelta>();

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

  isActive(dayOfMonth: Date) {
    return !!this.activeDate && isSameDate(dayOfMonth, this.activeDate);
  }

  isCurrent(dayOfMonth: Date) {
    return !!this.currentDate && isSameDate(dayOfMonth, this.currentDate);
  }

  onKeydown(event: KeyboardEvent) {
    const dayStepDelta = keyCodesToDaySteps.get(event.keyCode);

    if (dayStepDelta) {
      event.preventDefault();
      this.dayStep.emit(dayStepDelta);
    }
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
      const clickedDate = new Date(datetimeAttribute + 'T00:00');
      this.selectDate(clickedDate);
    }
  }

  private selectDate(date: Date) {
    if (!this.isSelected(date) && !this.isDisabled(date)) {
      this.selectedDateChange.emit(date);
    }
  }
}
