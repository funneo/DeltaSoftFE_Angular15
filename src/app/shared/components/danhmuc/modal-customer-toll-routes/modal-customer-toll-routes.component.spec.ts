import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCustomerTollRoutesComponent } from './modal-customer-toll-routes.component';

describe('ModalCustomerTollRoutesComponent', () => {
  let component: ModalCustomerTollRoutesComponent;
  let fixture: ComponentFixture<ModalCustomerTollRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCustomerTollRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCustomerTollRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
