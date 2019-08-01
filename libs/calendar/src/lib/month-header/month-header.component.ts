import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { addMonths, startOfMonth } from 'date-utils';

import { MonthStepDelta } from './month-step-delta.model';

@Component({
  selector: 'lib-month-header',
  templateUrl: './month-header.component.html',
  styleUrls: ['./month-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthHeaderComponent {
  @Input() month = startOfMonth(new Date());
  @Input() activeMonth = startOfMonth(new Date());
  @Input() showMonthStepper = true;
  @Input() monthAndYearFormat?: string;
  @Input() locale?: string;

  @Output() activeMonthChange = new EventEmitter<Date>();

  stepMonth(delta: MonthStepDelta) {
    const activeMonth = addMonths(this.activeMonth || new Date(), delta);
    this.activeMonthChange.emit(activeMonth);
  }
  // TODO: get the next month label from CLDR
}
