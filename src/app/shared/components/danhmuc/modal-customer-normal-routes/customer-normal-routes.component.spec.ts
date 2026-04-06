import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCustomerNormalRoutesComponent } from './customer-normal-routes.component';

describe('CustomerNormalRoutesComponent', () => {
  let component: ModalCustomerNormalRoutesComponent;
  let fixture: ComponentFixture<ModalCustomerNormalRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCustomerNormalRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCustomerNormalRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
