import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportStatementComponent } from './report-statement.component';

describe('ReportStatementComponent', () => {
  let component: ReportStatementComponent;
  let fixture: ComponentFixture<ReportStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportStatementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
