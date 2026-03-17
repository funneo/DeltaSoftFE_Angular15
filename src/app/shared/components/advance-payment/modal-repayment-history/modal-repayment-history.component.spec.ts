import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRepaymentHistoryComponent } from './modal-repayment-history.component';

describe('ModalRepaymentHistoryComponent', () => {
  let component: ModalRepaymentHistoryComponent;
  let fixture: ComponentFixture<ModalRepaymentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRepaymentHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRepaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
