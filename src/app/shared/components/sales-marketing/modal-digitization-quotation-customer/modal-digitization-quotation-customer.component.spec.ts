import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDigitizationQuotationCustomerComponent } from './modal-digitization-quotation-customer.component';

describe('ModalDigitizationQuotationCustomerComponent', () => {
  let component: ModalDigitizationQuotationCustomerComponent;
  let fixture: ComponentFixture<ModalDigitizationQuotationCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDigitizationQuotationCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDigitizationQuotationCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
