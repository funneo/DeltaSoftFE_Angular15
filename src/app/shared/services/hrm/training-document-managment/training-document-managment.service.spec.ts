import { TestBed } from '@angular/core/testing';

import { TrainingDocumentManagmentService } from './training-document-managment.service';

describe('TrainingDocumentManagmentService', () => {
  let service: TrainingDocumentManagmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingDocumentManagmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
