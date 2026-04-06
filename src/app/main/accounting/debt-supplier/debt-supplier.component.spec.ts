import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtSupplierComponent } from './debt-supplier.component';

describe('DebtSupplierComponent', () => {
  let component: DebtSupplierComponent;
  let fixture: ComponentFixture<DebtSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtSupplierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
