import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalInvoiceInformationComponent } from './additional-invoice-information.component';

describe('AdditionalInvoiceInformationComponent', () => {
  let component: AdditionalInvoiceInformationComponent;
  let fixture: ComponentFixture<AdditionalInvoiceInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalInvoiceInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalInvoiceInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
