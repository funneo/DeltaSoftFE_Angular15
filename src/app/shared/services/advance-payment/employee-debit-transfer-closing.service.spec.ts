import { TestBed } from '@angular/core/testing';

import { EmployeeDebitTransferClosingService } from './employee-debit-transfer-closing.service';

describe('EmployeeDebitTransferClosingService', () => {
  let service: EmployeeDebitTransferClosingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeDebitTransferClosingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
