import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

import { getFallbackLocaleMonthAndYearFormat, isValidDate, monthAndYearFormatOptions, toLocaleStringSupportsLocales } from 'date-utils';

@Pipe({
  name: 'monthAndYear'
})
export class MonthAndYearPipe implements PipeTransform {
  private readonly toLocaleStringSupportsLocales: boolean;

  constructor(@Inject(LOCALE_ID) private localeId: string) {
    this.toLocaleStringSupportsLocales = toLocaleStringSupportsLocales();
  }

  transform(value: any, locale = this.localeId, format?: string) {
    if (!isValidDate(value)) { return null; }

    return this.toLocaleStringSupportsLocales && !format
      ? value.toLocaleString(locale, monthAndYearFormatOptions)
      : formatDate(value, format || getFallbackLocaleMonthAndYearFormat(locale), locale);
  }
}
