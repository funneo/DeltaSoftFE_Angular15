import { TestBed } from '@angular/core/testing';

import { CustomerRoutesService } from './customer-routes.service';

describe('CustomerRoutesService', () => {
  let service: CustomerRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
