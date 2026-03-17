import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmDenyClosingFclComponent } from './modal-confirm-deny-closing-fcl.component';

describe('ModalConfirmDenyClosingFclComponent', () => {
  let component: ModalConfirmDenyClosingFclComponent;
  let fixture: ComponentFixture<ModalConfirmDenyClosingFclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfirmDenyClosingFclComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmDenyClosingFclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
