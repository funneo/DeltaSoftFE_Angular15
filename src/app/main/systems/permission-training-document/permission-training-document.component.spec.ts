import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionTrainingDocumentComponent } from './permission-training-document.component';

describe('PermissionTrainingDocumentComponent', () => {
  let component: PermissionTrainingDocumentComponent;
  let fixture: ComponentFixture<PermissionTrainingDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionTrainingDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionTrainingDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
