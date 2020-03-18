import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

import { CalendarComponent } from './calendar.component';
import { MonthComponent } from './month/month.component';
import { DaysOfWeekComponent } from './days-of-week/days-of-week.component';
import { MonthHeaderComponent } from './month-header/month-header.component';
import { MonthAndYearPipe } from './month-and-year/month-and-year.pipe';

@NgModule({
  declarations: [
    CalendarComponent,
    MonthComponent,
    DaysOfWeekComponent,
    MonthHeaderComponent,
    MonthAndYearPipe,
  ],
  imports: [
    CommonModule,
    A11yModule,
  ],
  exports: [CalendarComponent]
})
export class CalendarModule { }
