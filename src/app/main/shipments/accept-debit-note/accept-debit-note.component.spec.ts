import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptDebitNoteComponent } from './accept-debit-note.component';

describe('AcceptDebitNoteComponent', () => {
  let component: AcceptDebitNoteComponent;
  let fixture: ComponentFixture<AcceptDebitNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptDebitNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptDebitNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
