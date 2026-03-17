import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPaymentCbtComponent } from './modal-payment-cbt.component';

describe('ModalPaymentCbtComponent', () => {
  let component: ModalPaymentCbtComponent;
  let fixture: ComponentFixture<ModalPaymentCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPaymentCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPaymentCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
