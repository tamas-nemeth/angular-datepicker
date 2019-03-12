import { NumericDayOfWeek } from './day-of-week';

export function setDayOfWeek(date: Date, dayOfWeek: NumericDayOfWeek) {
  return addDays(date, dayOfWeek - date.getDay());
}

export function addDays(date: Date, days: number) {
  return setDate(date, date.getDate() + days);
}

export function setDate(date: Date, dayOfMonth: number) {
  const dateCopy = new Date(date);
  dateCopy.setDate(dayOfMonth);
  return dateCopy;
}

export function addMonths(date: Date, months: number) {
  return setMonth(date, date.getMonth() + months);
}

export function setMonth(date: Date, month: number) {
  const dateCopy = new Date(date);
  dateCopy.setMonth(month);
  return dateCopy;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function numberOfDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function isSameDate(date1: Date, date2: Date) {
  return date1.getTime() === date2.getTime();
}

export function areDatesInSameMonth(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

export function isDateAfter(date1: Date, date2: Date) {
  return date1.getTime() > date2.getTime();
}

export function isDate(value?: any): value is Date {
  return value instanceof Date && typeof value.getTime === 'function' && !isNaN(value.getTime());
}

export function toISODateString(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
}
