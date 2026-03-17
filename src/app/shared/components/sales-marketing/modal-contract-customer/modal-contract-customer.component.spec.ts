import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContractCustomerComponent } from './modal-contract-customer.component';

describe('ModalContractCustomerComponent', () => {
  let component: ModalContractCustomerComponent;
  let fixture: ComponentFixture<ModalContractCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalContractCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalContractCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
