import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPermissionPaymentComponent } from './modal-permission-payment.component';

describe('ModalPermissionPaymentComponent', () => {
  let component: ModalPermissionPaymentComponent;
  let fixture: ComponentFixture<ModalPermissionPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPermissionPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPermissionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
