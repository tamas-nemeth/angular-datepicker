import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarComponent } from './calendar.component';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';

@NgModule({
  declarations: [
    CalendarComponent,
    CalendarMonthComponent,
    CalendarWeekComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [CalendarComponent]
})
export class CalendarModule { }
