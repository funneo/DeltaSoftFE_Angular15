import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPaymentDetailComponent } from './report-payment-detail.component';

describe('ReportPaymentDetailComponent', () => {
  let component: ReportPaymentDetailComponent;
  let fixture: ComponentFixture<ReportPaymentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportPaymentDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
