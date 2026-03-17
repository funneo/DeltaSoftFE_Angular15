import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDebitNotesComponent } from './modal-debit-notes.component';

describe('ModalDebitNotesComponent', () => {
  let component: ModalDebitNotesComponent;
  let fixture: ComponentFixture<ModalDebitNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDebitNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDebitNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
