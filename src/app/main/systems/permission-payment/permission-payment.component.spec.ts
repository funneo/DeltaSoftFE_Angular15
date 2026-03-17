import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionPaymentComponent } from './permission-payment.component';

describe('PermissionPaymentComponent', () => {
  let component: PermissionPaymentComponent;
  let fixture: ComponentFixture<PermissionPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
