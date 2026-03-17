import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSelectEmployeeDebitComponent } from './modal-select-employee-debit.component';

describe('ModalSelectEmployeeDebitComponent', () => {
  let component: ModalSelectEmployeeDebitComponent;
  let fixture: ComponentFixture<ModalSelectEmployeeDebitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSelectEmployeeDebitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSelectEmployeeDebitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
