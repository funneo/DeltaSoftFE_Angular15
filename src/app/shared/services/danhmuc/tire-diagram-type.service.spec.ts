import { TestBed } from '@angular/core/testing';

import { TireDiagramTypeService } from './tire-diagram-type.service';

describe('TireDiagramTypeService', () => {
  let service: TireDiagramTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TireDiagramTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
