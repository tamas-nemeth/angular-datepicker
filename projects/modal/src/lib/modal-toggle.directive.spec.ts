import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';

import { ModalToggleDirective } from './modal-toggle.directive';
import { ModalComponent } from './modal.component';

@Component({
  template: `
    <button type="button" libModalToggle [modal]="modal"></button>
    <lib-modal #modal></lib-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class ModalToggleHostComponent {
  @ViewChild(ModalToggleDirective) modalToggleDirective!: ModalToggleDirective;
}

describe('ModalToggleDirective', () => {
  let hostComponent: ModalToggleHostComponent;
  let fixture: ComponentFixture<ModalToggleHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OverlayModule,
        A11yModule
      ],
      declarations: [
        ModalToggleDirective,
        ModalComponent,
        ModalToggleHostComponent
      ]
    })
      .compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(ModalToggleHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should create an instance', () => {
    fixture.detectChanges();
    expect(hostComponent).toBeTruthy();
  });
});
