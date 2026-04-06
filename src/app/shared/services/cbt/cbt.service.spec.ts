import { TestBed } from '@angular/core/testing';

import { CbtService } from './cbt.service';

describe('CbtService', () => {
  let service: CbtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CbtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
