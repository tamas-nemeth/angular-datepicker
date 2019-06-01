import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { FormatWidth, getLocaleDateFormat } from '@angular/common';

import { areDatesInSameMonth } from 'date-utils';

import { MonthStep } from './month-step.model';

@Component({
  selector: 'lib-calendar-month-header',
  templateUrl: './calendar-month-header.component.html',
  styleUrls: ['./calendar-month-header.component.scss']
})
export class CalendarMonthHeaderComponent implements OnInit {
  private readonly localeDateFormatDayPart = /\sd\.?/;
  private defaultMonthCaptionPattern!: string;

  @Input() showMonthStepper = true;

  private _month!: Date;

  @Input()
  get month() {
    return this._month;
  }
  set month(month: Date) {
    if (!this._month || !areDatesInSameMonth(this._month, month)) {
      this._month = month;
    }
  }

  private _locale?: string;

  @Input()
  set locale(locale: string) {
    this._locale = locale;
    this.defaultMonthCaptionPattern = this.getDefaultMonthCaptionPattern();
  }
  get locale() {
    return this._locale || this.localeId;
  }

  private _monthCaptionPattern?: string;

  @Input()
  set monthCaptionPattern(monthCaptionPattern: string) {
    this._monthCaptionPattern = monthCaptionPattern;
  }

  get monthCaptionPattern() {
    return this._monthCaptionPattern || this.defaultMonthCaptionPattern;
  }

  @Output() monthStep = new EventEmitter<MonthStep>();

  constructor(@Inject(LOCALE_ID) private localeId: string) {}

  ngOnInit() {
    this.defaultMonthCaptionPattern = this.getDefaultMonthCaptionPattern();
  }

  stepMonth(step: MonthStep) {
    this.monthStep.emit(step);
  }

  private getDefaultMonthCaptionPattern() {
    return getLocaleDateFormat(this.locale, FormatWidth.Long).replace(this.localeDateFormatDayPart, '');
  }
}
