import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSupplierVehicleComponent } from './modal-supplier-vehicle.component';

describe('ModalSupplierVehicleComponent', () => {
  let component: ModalSupplierVehicleComponent;
  let fixture: ComponentFixture<ModalSupplierVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSupplierVehicleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSupplierVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
