import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRevenueComponent } from './report-revenue.component';

describe('ReportRevenueComponent', () => {
  let component: ReportRevenueComponent;
  let fixture: ComponentFixture<ReportRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportRevenueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
