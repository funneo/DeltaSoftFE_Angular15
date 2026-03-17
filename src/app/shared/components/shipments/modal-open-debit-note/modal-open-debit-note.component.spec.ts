import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOpenDebitNoteComponent } from './modal-open-debit-note.component';

describe('ModalOpenDebitNoteComponent', () => {
  let component: ModalOpenDebitNoteComponent;
  let fixture: ComponentFixture<ModalOpenDebitNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalOpenDebitNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOpenDebitNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
