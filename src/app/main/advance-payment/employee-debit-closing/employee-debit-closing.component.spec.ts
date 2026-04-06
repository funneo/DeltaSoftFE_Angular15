import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDebitClosingComponent } from './employee-debit-closing.component';

describe('EmployeeDebitClosingComponent', () => {
  let component: EmployeeDebitClosingComponent;
  let fixture: ComponentFixture<EmployeeDebitClosingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDebitClosingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDebitClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
