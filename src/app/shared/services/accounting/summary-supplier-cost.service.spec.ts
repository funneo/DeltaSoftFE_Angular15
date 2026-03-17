import { TestBed } from '@angular/core/testing';

import { SummarySupplierCostService } from './summary-supplier-cost.service';

describe('SummarySupplierCostService', () => {
  let service: SummarySupplierCostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SummarySupplierCostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
