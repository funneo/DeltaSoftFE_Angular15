import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDispatchOrderFclComponent } from './modal-dispatch-order-fcl.component';

describe('ModalDispatchOrderFclComponent', () => {
  let component: ModalDispatchOrderFclComponent;
  let fixture: ComponentFixture<ModalDispatchOrderFclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDispatchOrderFclComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDispatchOrderFclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
