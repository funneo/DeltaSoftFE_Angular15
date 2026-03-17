import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSupplierDriverComponent } from './modal-supplier-driver.component';

describe('ModalSupplierDriverComponent', () => {
  let component: ModalSupplierDriverComponent;
  let fixture: ComponentFixture<ModalSupplierDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSupplierDriverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSupplierDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
