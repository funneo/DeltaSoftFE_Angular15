import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCbtComponent } from './payment-cbt.component';

describe('PaymentCbtComponent', () => {
  let component: PaymentCbtComponent;
  let fixture: ComponentFixture<PaymentCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
