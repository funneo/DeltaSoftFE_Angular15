import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDebtInvoiceComponent } from './payment-debt-invoice.component';

describe('PaymentDebtInvoiceComponent', () => {
  let component: PaymentDebtInvoiceComponent;
  let fixture: ComponentFixture<PaymentDebtInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentDebtInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDebtInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
