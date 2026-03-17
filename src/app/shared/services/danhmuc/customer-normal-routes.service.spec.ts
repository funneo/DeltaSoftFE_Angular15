import { TestBed } from '@angular/core/testing';

import { CustomerNormalRoutesService } from './customer-normal-routes.service';

describe('CustomerNormalRoutesService', () => {
  let service: CustomerNormalRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerNormalRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
