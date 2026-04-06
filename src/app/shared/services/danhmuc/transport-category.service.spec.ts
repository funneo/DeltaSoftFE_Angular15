import { TestBed } from '@angular/core/testing';

import { TransportCategoryService } from './transport-category.service';

describe('TransportCategoryService', () => {
  let service: TransportCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransportCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
