import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportShipmentNotDebitComponent } from './report-shipment-not-debit.component';

describe('ReportShipmentNotDebitComponent', () => {
  let component: ReportShipmentNotDebitComponent;
  let fixture: ComponentFixture<ReportShipmentNotDebitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportShipmentNotDebitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportShipmentNotDebitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
