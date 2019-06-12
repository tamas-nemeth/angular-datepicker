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
  private readonly localeDateFormatDayPart = /\s?d+\.?/;
  private defaultMonthCaptionPattern!: string;

  @Input() showMonthStepper = true;
  @Input() month = new Date();

  private _locale!: string;

  @Input()
  get locale() {
    return this._locale;
  }

  set locale(locale: string | undefined) {
    this._locale = locale || this.localeId;
    this.defaultMonthCaptionPattern = this.getDefaultMonthCaptionPattern();
  }

  private _monthCaptionPattern?: string;

  @Input()
  set monthCaptionPattern(monthCaptionPattern: string | undefined) {
    this._monthCaptionPattern = monthCaptionPattern;
  }

  get monthCaptionPattern() {
    return this._monthCaptionPattern || this.defaultMonthCaptionPattern;
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

  private getDefaultMonthCaptionPattern() {
    return getLocaleDateFormat(this.locale!, FormatWidth.Long).replace(this.localeDateFormatDayPart, '');
  }
}
