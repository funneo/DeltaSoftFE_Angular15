import { TestBed } from '@angular/core/testing';

import { PaymentCbtService } from './payment-cbt.service';

describe('PaymentCbtService', () => {
  let service: PaymentCbtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentCbtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
