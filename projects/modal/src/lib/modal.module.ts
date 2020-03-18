import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';

import { ModalComponent } from './modal.component';
import { ModalToggleDirective } from './modal-toggle.directive';

@NgModule({
  declarations: [ModalComponent, ModalToggleDirective],
  imports: [
    OverlayModule,
    A11yModule
  ],
  exports: [ModalComponent, ModalToggleDirective]
})
export class ModalModule { }
