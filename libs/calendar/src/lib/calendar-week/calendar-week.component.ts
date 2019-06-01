import { ChangeDetectionStrategy, Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { FormStyle, getLocaleDayNames, TranslationWidth } from '@angular/common';

@Component({
  selector: 'lib-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarWeekComponent implements OnInit {
  daysOfWeek!: string[];
  narrowDaysOfWeek!: string[];

  private _locale?: string;

  @Input()
  get locale() {
    return this._locale || this.localeId;
  }
  set locale(locale: string) {
    this._locale = locale;
    this.daysOfWeek = this.getDaysOfWeek();
    this.narrowDaysOfWeek = this.getNarrowDaysOfWeek();
  }

  constructor(@Inject(LOCALE_ID) private localeId: string) {}

  ngOnInit(): void {
    this.daysOfWeek = this.getDaysOfWeek();
    this.narrowDaysOfWeek = this.getNarrowDaysOfWeek();
  }

  private getDaysOfWeek() {
    return getLocaleDayNames(this.locale, FormStyle.Format, TranslationWidth.Wide);
  }

  private getNarrowDaysOfWeek() {
    return getLocaleDayNames(this.locale!, FormStyle.Format, TranslationWidth.Narrow);
  }
}
