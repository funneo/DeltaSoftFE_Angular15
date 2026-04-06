import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingDebitCreditDetailComponent } from './accounting-debit-credit-detail.component';

describe('AccountingDebitCreditDetailComponent', () => {
  let component: AccountingDebitCreditDetailComponent;
  let fixture: ComponentFixture<AccountingDebitCreditDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountingDebitCreditDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingDebitCreditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
