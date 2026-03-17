import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPotentialCustomerComponent } from './modal-potential-customer.component';

describe('ModalPotentialCustomerComponent', () => {
  let component: ModalPotentialCustomerComponent;
  let fixture: ComponentFixture<ModalPotentialCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPotentialCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPotentialCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
