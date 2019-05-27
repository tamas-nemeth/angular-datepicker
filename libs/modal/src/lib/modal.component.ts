import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';

@Component({
  selector: 'lib-modal',
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() isOverlayOpen = false;

  private _overlayOrigin?: CdkOverlayOrigin;

  set overlayOrigin(overlayOrigin: CdkOverlayOrigin | undefined) {
    this._overlayOrigin = overlayOrigin;
    this.changeDetectorRef.markForCheck();
  }
  get overlayOrigin() {
    return this._overlayOrigin;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  toggleOverlay() {
    this.isOverlayOpen = !this.isOverlayOpen;
    this.changeDetectorRef.markForCheck();
  }
}
