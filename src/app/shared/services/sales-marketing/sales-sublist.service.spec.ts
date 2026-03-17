import { TestBed } from '@angular/core/testing';

import { SalesSublistService } from './sales-sublist.service';

describe('SalesSublistService', () => {
  let service: SalesSublistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesSublistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
