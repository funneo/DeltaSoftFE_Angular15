import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPaymentFeeComponent } from './modal-payment-fee.component';

describe('ModalPaymentFeeComponent', () => {
  let component: ModalPaymentFeeComponent;
  let fixture: ComponentFixture<ModalPaymentFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPaymentFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPaymentFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
