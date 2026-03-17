import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPaymentDetailedComponent } from './modal-payment-detailed.component';

describe('ModalPaymentDetailedComponent', () => {
  let component: ModalPaymentDetailedComponent;
  let fixture: ComponentFixture<ModalPaymentDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPaymentDetailedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPaymentDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
