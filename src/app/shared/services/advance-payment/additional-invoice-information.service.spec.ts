import { TestBed } from '@angular/core/testing';

import { AdditionalInvoiceInformationService } from './additional-invoice-information.service';

describe('AdditionalInvoiceInformationService', () => {
  let service: AdditionalInvoiceInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdditionalInvoiceInformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
