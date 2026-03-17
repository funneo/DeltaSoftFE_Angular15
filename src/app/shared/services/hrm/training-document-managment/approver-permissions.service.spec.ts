import { TestBed } from '@angular/core/testing';

import { ApproverPermissionsService } from './approver-permissions.service';

describe('ApproverPermissionsService', () => {
  let service: ApproverPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproverPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
