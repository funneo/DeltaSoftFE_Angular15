import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalListPaymentAcceptComponent } from './modal-list-payment-accept.component';

describe('ModalListPaymentAcceptComponent', () => {
  let component: ModalListPaymentAcceptComponent;
  let fixture: ComponentFixture<ModalListPaymentAcceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalListPaymentAcceptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalListPaymentAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
