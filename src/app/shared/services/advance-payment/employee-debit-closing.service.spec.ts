import { TestBed } from '@angular/core/testing';

import { EmployeeDebitClosingService } from './employee-debit-closing.service';

describe('EmployeeDebitClosingService', () => {
  let service: EmployeeDebitClosingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeDebitClosingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
