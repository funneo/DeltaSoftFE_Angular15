import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDispatchOrderCbtComponent } from './modal-dispatch-order-cbt.component';

describe('ModalDispatchOrderCbtComponent', () => {
  let component: ModalDispatchOrderCbtComponent;
  let fixture: ComponentFixture<ModalDispatchOrderCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDispatchOrderCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDispatchOrderCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
