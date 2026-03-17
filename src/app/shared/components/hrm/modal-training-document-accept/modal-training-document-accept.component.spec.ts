import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTrainingDocumentAcceptComponent } from './modal-training-document-accept.component';

describe('ModalTrainingDocumentAcceptComponent', () => {
  let component: ModalTrainingDocumentAcceptComponent;
  let fixture: ComponentFixture<ModalTrainingDocumentAcceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTrainingDocumentAcceptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTrainingDocumentAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
