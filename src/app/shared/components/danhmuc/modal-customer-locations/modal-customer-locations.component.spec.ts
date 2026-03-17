import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCustomerLocationsComponent } from './modal-customer-locations.component';

describe('ModalCustomerLocationsComponent', () => {
  let component: ModalCustomerLocationsComponent;
  let fixture: ComponentFixture<ModalCustomerLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCustomerLocationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCustomerLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
