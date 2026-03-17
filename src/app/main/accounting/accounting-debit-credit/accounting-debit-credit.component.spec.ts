import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingDebitCreditComponent } from './accounting-debit-credit.component';

describe('AccountingDebitCreditComponent', () => {
  let component: AccountingDebitCreditComponent;
  let fixture: ComponentFixture<AccountingDebitCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountingDebitCreditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingDebitCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
