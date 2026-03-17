import { TestBed } from '@angular/core/testing';

import { GoLateBackEarlyService } from './go-late-back-early.service';

describe('GoLateBackEarlyService', () => {
  let service: GoLateBackEarlyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoLateBackEarlyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
