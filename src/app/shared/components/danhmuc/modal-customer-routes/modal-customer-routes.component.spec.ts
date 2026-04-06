import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCustomerRoutesComponent } from './modal-customer-routes.component';

describe('ModalCustomerRoutesComponent', () => {
  let component: ModalCustomerRoutesComponent;
  let fixture: ComponentFixture<ModalCustomerRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCustomerRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCustomerRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
