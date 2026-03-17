import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdvanceTransferComponent } from './modal-advance-transfer.component';

describe('ModalAdvanceTransferComponent', () => {
  let component: ModalAdvanceTransferComponent;
  let fixture: ComponentFixture<ModalAdvanceTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAdvanceTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAdvanceTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
