import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';

import { MonthStep } from './month-step.model';
import { getLocaleMonthAndYearFormat } from 'date-utils';

@Component({
  selector: 'lib-calendar-month-header',
  templateUrl: './calendar-month-header.component.html',
  styleUrls: ['./calendar-month-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonthHeaderComponent implements OnInit {
  private defaultMonthAndYearFormat!: string;

  @Input() showMonthStepper = true;
  @Input() month = new Date();

  private _locale!: string;

  @Input()
  get locale() {
    return this._locale;
  }

  set locale(locale: string | undefined) {
    this._locale = locale || this.localeId;
    this.defaultMonthAndYearFormat = getLocaleMonthAndYearFormat(this._locale);
  }

  private _monthAndYearFormat?: string;

  @Input()
  set monthAndYearFormat(monthAndYearFormat: string | undefined) {
    this._monthAndYearFormat = monthAndYearFormat;
  }

  get monthAndYearFormat() {
    return this._monthAndYearFormat || this.defaultMonthAndYearFormat;
  }

  @Output() monthStep = new EventEmitter<MonthStep>();

  constructor(@Inject(LOCALE_ID) private localeId: string) {}

  ngOnInit() {
    if (!this.locale) {
      this.locale = this.localeId;
    }
  }

  stepMonth(step: MonthStep) {
    this.monthStep.emit(step);
  }
}
