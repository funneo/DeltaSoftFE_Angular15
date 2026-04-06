import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPermissionTrainingDocumentComponent } from './modal-permission-training-document.component';

describe('ModalPermissionTrainingDocumentComponent', () => {
  let component: ModalPermissionTrainingDocumentComponent;
  let fixture: ComponentFixture<ModalPermissionTrainingDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPermissionTrainingDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPermissionTrainingDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
