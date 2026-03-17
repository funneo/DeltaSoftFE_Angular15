import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarySupplierCostComponent } from './summary-supplier-cost.component';

describe('SummarySupplierCostComponent', () => {
  let component: SummarySupplierCostComponent;
  let fixture: ComponentFixture<SummarySupplierCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummarySupplierCostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarySupplierCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
