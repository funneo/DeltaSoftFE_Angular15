import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDebitNoteCanonComponent } from './modal-debit-note-canon.component';

describe('ModalDebitNoteCanonComponent', () => {
  let component: ModalDebitNoteCanonComponent;
  let fixture: ComponentFixture<ModalDebitNoteCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDebitNoteCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDebitNoteCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
