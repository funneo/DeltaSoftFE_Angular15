import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdateAccountingDateComponent } from './modal-update-accounting-date.component';

describe('ModalUpdateAccountingDateComponent', () => {
  let component: ModalUpdateAccountingDateComponent;
  let fixture: ComponentFixture<ModalUpdateAccountingDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUpdateAccountingDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUpdateAccountingDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
