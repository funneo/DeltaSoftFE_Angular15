import { TestBed } from '@angular/core/testing';

import { CustomerLocationsService } from './customer-locations.service';

describe('CustomerLocationsService', () => {
  let service: CustomerLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
