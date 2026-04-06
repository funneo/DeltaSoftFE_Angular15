import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEmployeeDebitClosingComponent } from './modal-employee-debit-closing.component';

describe('ModalEmployeeDebitClosingComponent', () => {
  let component: ModalEmployeeDebitClosingComponent;
  let fixture: ComponentFixture<ModalEmployeeDebitClosingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEmployeeDebitClosingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEmployeeDebitClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
