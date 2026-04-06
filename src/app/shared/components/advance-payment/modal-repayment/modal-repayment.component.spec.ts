import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRepaymentComponent } from './modal-repayment.component';

describe('ModalRepaymentComponent', () => {
  let component: ModalRepaymentComponent;
  let fixture: ComponentFixture<ModalRepaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRepaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
