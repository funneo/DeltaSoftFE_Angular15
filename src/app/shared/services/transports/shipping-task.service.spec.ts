import { TestBed } from '@angular/core/testing';

import { ShippingTaskService } from './shipping-task.service';

describe('ShippingTaskService', () => {
  let service: ShippingTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippingTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
