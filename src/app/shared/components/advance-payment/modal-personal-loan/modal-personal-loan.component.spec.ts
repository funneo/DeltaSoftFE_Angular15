import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPersonalLoanComponent } from './modal-personal-loan.component';

describe('ModalPersonalLoanComponent', () => {
  let component: ModalPersonalLoanComponent;
  let fixture: ComponentFixture<ModalPersonalLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPersonalLoanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPersonalLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
