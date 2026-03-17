import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdditionalInvoiceInformationComponent } from './modal-additional-invoice-information.component';

describe('ModalAdditionalInvoiceInformationComponent', () => {
  let component: ModalAdditionalInvoiceInformationComponent;
  let fixture: ComponentFixture<ModalAdditionalInvoiceInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAdditionalInvoiceInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAdditionalInvoiceInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
