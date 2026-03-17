import { TestBed } from '@angular/core/testing';

import { RequestNewEmployeeService } from './request-new-employee.service';

describe('RequestNewEmployeeService', () => {
  let service: RequestNewEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestNewEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
