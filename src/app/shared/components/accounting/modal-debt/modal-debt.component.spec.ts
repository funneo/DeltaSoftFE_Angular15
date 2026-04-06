import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDebtComponent } from './modal-debt.component';

describe('ModalDebtComponent', () => {
  let component: ModalDebtComponent;
  let fixture: ComponentFixture<ModalDebtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDebtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDebtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
