import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

import { ModalComponent } from './modal.component';
import { ModalToggleDirective } from './modal-toggle.directive';

@NgModule({
  declarations: [ModalComponent, ModalToggleDirective],
  imports: [
    OverlayModule
  ],
  exports: [ModalComponent, ModalToggleDirective]
})
export class ModalModule { }
