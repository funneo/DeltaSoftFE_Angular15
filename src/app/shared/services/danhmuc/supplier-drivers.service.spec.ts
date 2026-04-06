import { TestBed } from '@angular/core/testing';

import { SupplierDriversService } from './supplier-drivers.service';

describe('SupplierDriversService', () => {
  let service: SupplierDriversService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierDriversService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
