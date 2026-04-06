import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDebitNoteZeroComponent } from './modal-debit-note-zero.component';

describe('ModalDebitNoteZeroComponent', () => {
  let component: ModalDebitNoteZeroComponent;
  let fixture: ComponentFixture<ModalDebitNoteZeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDebitNoteZeroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDebitNoteZeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
