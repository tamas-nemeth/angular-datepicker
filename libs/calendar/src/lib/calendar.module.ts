import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarComponent } from './calendar.component';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { CalendarMonthHeaderComponent } from './calendar-month-header/calendar-month-header.component';

@NgModule({
  declarations: [
    CalendarComponent,
    CalendarMonthComponent,
    CalendarWeekComponent,
    CalendarMonthHeaderComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [CalendarComponent]
})
export class CalendarModule { }
