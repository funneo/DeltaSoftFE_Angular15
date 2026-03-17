import { TestBed } from '@angular/core/testing';

import { TransitPortsService } from './transit-ports.service';

describe('TransitPortsService', () => {
  let service: TransitPortsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransitPortsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
