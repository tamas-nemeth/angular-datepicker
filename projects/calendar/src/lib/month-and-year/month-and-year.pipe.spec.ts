import { formatDate, registerLocaleData } from '@angular/common';
import HungarianLocale from '@angular/common/locales/hu';
import BritishLocale from '@angular/common/locales/en-GB';

import { Month } from 'date-utils';

import { MonthAndYearPipe } from './month-and-year.pipe';

describe('MonthAndYearPipe', () => {
  const defaultLocaleId = 'en-US';
  const localeMonthCaptionPatterns = {
    'en-US': 'MMMM y',
    'en-GB': 'MMMM y',
    hu: 'y. MMMM',
  } as const;

  let pipe: MonthAndYearPipe;

  beforeAll(() => {
    registerLocaleData(HungarianLocale);
    registerLocaleData(BritishLocale);
  });

  beforeEach(() => {
    pipe = new MonthAndYearPipe(defaultLocaleId);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format month with default locale format', () => {
    const month = new Date(2019, Month.June);

    expect(pipe.transform(month)).toBe(formatMonth(month, defaultLocaleId));
  });

  it('should format month with provided locale format', () => {
    const month = new Date(2019, Month.June);
    const locale = 'hu';

    expect(pipe.transform(month, locale)).toBe(formatMonth(month, locale));
  });

  it('should format month with provided date format', () => {
    const month = new Date(2019, Month.June);
    const locale = 'hu';
    const format = 'y. MMM';

    expect(pipe.transform(month, locale, format)).toBe(formatDate(month, format, locale));
  });

  it('should format month with provided date format with default locale', () => {
    const month = new Date(2019, Month.June);
    const locale = undefined;
    const format = 'y. MMM';

    expect(pipe.transform(month, locale, format)).toBe(formatDate(month, format, defaultLocaleId));
  });

  it('should return null if value is not a Date', () => {
    const month = {};

    expect(pipe.transform(month)).toBe(null);
  });

  function formatMonth(date: Date, locale: keyof typeof localeMonthCaptionPatterns) {
    return formatDate(date, localeMonthCaptionPatterns[locale], locale);
  }
});
