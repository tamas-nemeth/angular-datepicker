import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { FormatWidth, getLocaleDateFormat } from '@angular/common';

import { MonthStep } from './month-step.model';

@Component({
  selector: 'lib-calendar-month-header',
  templateUrl: './calendar-month-header.component.html',
  styleUrls: ['./calendar-month-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonthHeaderComponent implements OnInit {
  private readonly localeDateFormatDayPart = /\s?d+(\.|,)?/;
  private readonly dateTimeFormatOptions = {
    year: 'numeric',
    month: 'long'
  };
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
    this.defaultMonthAndYearFormat = this.getDefaultMonthAndYearFormat();
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

  private getDefaultMonthAndYearFormat() {
    if (Intl.DateTimeFormat.prototype.formatToParts) {
      const dateFormatter = new Intl.DateTimeFormat(this.locale, this.dateTimeFormatOptions);
      return dateFormatter.formatToParts().map(({type, value}) => {
        switch(type) {
          case 'year': return 'y';
		  case 'month': return 'MMMM';
		  case 'literal': return `'${value}'`;
		  default: return '';
		}
	  }).reduce((dateFormat, dateFormatPart) => dateFormat + dateFormatPart);
	} else {
      return getLocaleDateFormat(this.locale!, FormatWidth.Long).replace(this.localeDateFormatDayPart, '').trim();
	}
  }
}
