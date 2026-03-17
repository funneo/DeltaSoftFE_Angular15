import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTrainingDocumentComponent } from './modal-training-document.component';

describe('ModalTrainingDocumentComponent', () => {
  let component: ModalTrainingDocumentComponent;
  let fixture: ComponentFixture<ModalTrainingDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTrainingDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTrainingDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
