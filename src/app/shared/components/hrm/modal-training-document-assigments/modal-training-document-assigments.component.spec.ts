import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTrainingDocumentAssigmentsComponent } from './modal-training-document-assigments.component';

describe('ModalTrainingDocumentAssigmentsComponent', () => {
  let component: ModalTrainingDocumentAssigmentsComponent;
  let fixture: ComponentFixture<ModalTrainingDocumentAssigmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTrainingDocumentAssigmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTrainingDocumentAssigmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
