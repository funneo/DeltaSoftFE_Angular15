import { TestBed } from '@angular/core/testing';

import { DispatchOrderAttachfilesService } from './dispatch-order-attachfiles.service';

describe('DispatchOrderAttachfilesService', () => {
  let service: DispatchOrderAttachfilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DispatchOrderAttachfilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
