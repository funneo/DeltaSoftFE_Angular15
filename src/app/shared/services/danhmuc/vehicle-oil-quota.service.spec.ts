import { TestBed } from '@angular/core/testing';

import { VehicleOilQuotaService } from './vehicle-oil-quota.service';

describe('VehicleOilQuotaService', () => {
  let service: VehicleOilQuotaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleOilQuotaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
