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

import {
  areDatesInSameMonth,
  DayOfWeek,
  isDateAfter,
  isSameDate,
  numberOfDaysInMonth,
  NumericDayOfWeek,
  setDate,
  startOfDay
} from 'date-utils';

@Component({
  selector: 'lib-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonthComponent implements OnChanges, AfterViewInit {
  daysOfMonth!: Date[];
  firstDayOfMonth!: string;

  private readonly defaultMonthCaptionPattern = 'MMMM y';
  private readonly daySelector = '.calendar-month__day';

  @Input() locale?: string;
  @Input() selectedDate?: Date;
  @Input() min?: Date;
  @Input() displayMonthStepper = true;

  private _month!: Date;

  @Input()
  set month(month: Date) {
    if (!this._month || !areDatesInSameMonth(this._month, month)) {
      this._month = month;
      this.daysOfMonth = Array.from({length: numberOfDaysInMonth(this._month)}, (_, index) => setDate(this._month, index + 1));
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

  @Output() pick = new EventEmitter<Date>();
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
    return this.selectedDate && isSameDate(dayOfMonth, this.selectedDate);
  }

  isDisabled(dayOfMonth: Date) {
    return this.min && isDateAfter(this.min, dayOfMonth);
  }

  onMonthClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target && target.matches(this.daySelector)) {
      this.onDateClick(target);
    }
  }

  stepMonth(step: -1 | 1) {
    this.monthStep.emit(step);
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
      this.pick.emit(date);
    }
  }
}
