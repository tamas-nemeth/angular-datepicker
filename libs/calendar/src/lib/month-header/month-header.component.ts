import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { MonthStepDelta } from './month-step-delta.model';

@Component({
  selector: 'lib-month-header',
  templateUrl: './month-header.component.html',
  styleUrls: ['./month-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthHeaderComponent {
  @Input() showMonthStepper = true;
  @Input() month = new Date();
  @Input() monthAndYearFormat?: string;
  @Input() locale?: string;

  @Output() monthStep = new EventEmitter<MonthStepDelta>();

  stepMonth(step: MonthStepDelta) {
    this.monthStep.emit(step);
  }

  // TODO: get the next month label from CLDR
}
