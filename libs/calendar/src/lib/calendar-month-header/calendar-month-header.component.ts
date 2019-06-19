import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { MonthStep } from './month-step.model';

@Component({
  selector: 'lib-calendar-month-header',
  templateUrl: './calendar-month-header.component.html',
  styleUrls: ['./calendar-month-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonthHeaderComponent {
  @Input() showMonthStepper = true;
  @Input() month = new Date();
  @Input() monthAndYearFormat?: string;
  @Input() locale?: string;

  @Output() monthStep = new EventEmitter<MonthStep>();

  stepMonth(step: MonthStep) {
    this.monthStep.emit(step);
  }

  // TODO: get the next month label from CLDR
}
