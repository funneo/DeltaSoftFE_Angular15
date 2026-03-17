import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRevenueCbtComponent } from './report-revenue-cbt.component';

describe('ReportRevenueCbtComponent', () => {
  let component: ReportRevenueCbtComponent;
  let fixture: ComponentFixture<ReportRevenueCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportRevenueCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRevenueCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
