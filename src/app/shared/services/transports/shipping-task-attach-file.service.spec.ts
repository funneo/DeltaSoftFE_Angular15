import { TestBed } from '@angular/core/testing';

import { ShippingTaskAttachFileService } from './shipping-task-attach-file.service';

describe('ShippingTaskAttachFileService', () => {
  let service: ShippingTaskAttachFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippingTaskAttachFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
