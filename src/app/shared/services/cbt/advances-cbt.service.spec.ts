import { TestBed } from '@angular/core/testing';

import { AdvancesCbtService } from './advances-cbt.service';

describe('AdvancesCbtService', () => {
  let service: AdvancesCbtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancesCbtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
