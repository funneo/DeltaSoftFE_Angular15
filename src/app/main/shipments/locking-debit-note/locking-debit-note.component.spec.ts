import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockingDebitNoteComponent } from './locking-debit-note.component';

describe('LockingDebitNoteComponent', () => {
  let component: LockingDebitNoteComponent;
  let fixture: ComponentFixture<LockingDebitNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockingDebitNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockingDebitNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
