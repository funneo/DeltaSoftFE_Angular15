import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDebitTransferClosingComponent } from './employee-debit-transfer-closing.component';

describe('EmployeeDebitTransferClosingComponent', () => {
  let component: EmployeeDebitTransferClosingComponent;
  let fixture: ComponentFixture<EmployeeDebitTransferClosingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDebitTransferClosingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDebitTransferClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
