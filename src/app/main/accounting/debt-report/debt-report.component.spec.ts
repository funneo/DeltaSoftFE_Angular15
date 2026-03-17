import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtReportComponent } from './debt-report.component';

describe('DebtReportComponent', () => {
  let component: DebtReportComponent;
  let fixture: ComponentFixture<DebtReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
