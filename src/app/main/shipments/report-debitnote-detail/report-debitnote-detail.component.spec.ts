import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDebitnoteDetailComponent } from './report-debitnote-detail.component';

describe('ReportDebitnoteDetailComponent', () => {
  let component: ReportDebitnoteDetailComponent;
  let fixture: ComponentFixture<ReportDebitnoteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDebitnoteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDebitnoteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
