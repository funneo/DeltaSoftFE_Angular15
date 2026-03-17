import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDebitCreditComponent } from './employee-debit-credit.component';

describe('EmployeeDebitCreditComponent', () => {
  let component: EmployeeDebitCreditComponent;
  let fixture: ComponentFixture<EmployeeDebitCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDebitCreditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDebitCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
