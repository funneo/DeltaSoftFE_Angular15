import { TestBed } from '@angular/core/testing';

import { CustomerTollRoutesService } from './customer-toll-routes.service';

describe('CustomerTollRoutesService', () => {
  let service: CustomerTollRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerTollRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
