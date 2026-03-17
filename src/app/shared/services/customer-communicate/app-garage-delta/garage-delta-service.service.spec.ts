import { TestBed } from '@angular/core/testing';

import { GarageDeltaServiceService } from './garage-delta-service.service';

describe('GarageDeltaServiceService', () => {
  let service: GarageDeltaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GarageDeltaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
