import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDebitCreditDetailComponent } from './employee-debit-credit-detail.component';

describe('EmployeeDebitCreditDetailComponent', () => {
  let component: EmployeeDebitCreditDetailComponent;
  let fixture: ComponentFixture<EmployeeDebitCreditDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDebitCreditDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDebitCreditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
