import { TestBed } from '@angular/core/testing';

import { SupplierVehiclesService } from './supplier-vehicles.service';

describe('SupplierVehiclesService', () => {
  let service: SupplierVehiclesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierVehiclesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
