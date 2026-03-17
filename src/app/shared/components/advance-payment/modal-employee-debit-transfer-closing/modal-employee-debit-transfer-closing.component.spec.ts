import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEmployeeDebitTransferClosingComponent } from './modal-employee-debit-transfer-closing.component';

describe('ModalEmployeeDebitTransferClosingComponent', () => {
  let component: ModalEmployeeDebitTransferClosingComponent;
  let fixture: ComponentFixture<ModalEmployeeDebitTransferClosingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEmployeeDebitTransferClosingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEmployeeDebitTransferClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
