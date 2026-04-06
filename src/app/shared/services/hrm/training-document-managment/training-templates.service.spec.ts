import { TestBed } from '@angular/core/testing';

import { TrainingTemplatesService } from './training-templates.service';

describe('TrainingTemplatesService', () => {
  let service: TrainingTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
