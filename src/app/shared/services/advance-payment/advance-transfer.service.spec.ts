import { TestBed } from '@angular/core/testing';

import { AdvanceTransferService } from './advance-transfer.service';

describe('AdvanceTransferService', () => {
  let service: AdvanceTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvanceTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
