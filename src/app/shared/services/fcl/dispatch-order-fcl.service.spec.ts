import { TestBed } from '@angular/core/testing';

import { DispatchOrderFclService } from './dispatch-order-fcl.service';

describe('DispatchOrderFclService', () => {
  let service: DispatchOrderFclService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DispatchOrderFclService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
