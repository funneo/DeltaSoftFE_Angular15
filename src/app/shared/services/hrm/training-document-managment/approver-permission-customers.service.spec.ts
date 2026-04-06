import { TestBed } from '@angular/core/testing';

import { ApproverPermissionCustomersService } from './approver-permission-customers.service';

describe('ApproverPermissionCustomersService', () => {
  let service: ApproverPermissionCustomersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproverPermissionCustomersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
