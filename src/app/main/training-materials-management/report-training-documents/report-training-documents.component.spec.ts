import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTrainingDocumentsComponent } from './report-training-documents.component';

describe('ReportTrainingDocumentsComponent', () => {
  let component: ReportTrainingDocumentsComponent;
  let fixture: ComponentFixture<ReportTrainingDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportTrainingDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTrainingDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
