import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSummarySupplierCostComponent } from './modal-summary-supplier-cost.component';

describe('ModalSummarySupplierCostComponent', () => {
  let component: ModalSummarySupplierCostComponent;
  let fixture: ComponentFixture<ModalSummarySupplierCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSummarySupplierCostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSummarySupplierCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
