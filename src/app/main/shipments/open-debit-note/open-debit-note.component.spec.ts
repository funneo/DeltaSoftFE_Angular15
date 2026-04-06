import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDebitNoteComponent } from './open-debit-note.component';

describe('OpenDebitNoteComponent', () => {
  let component: OpenDebitNoteComponent;
  let fixture: ComponentFixture<OpenDebitNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenDebitNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDebitNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
