import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDispatchOrderFclV2Component } from './modal-dispatch-order-fcl-v2.component';

describe('ModalDispatchOrderFclV2Component', () => {
  let component: ModalDispatchOrderFclV2Component;
  let fixture: ComponentFixture<ModalDispatchOrderFclV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalDispatchOrderFclV2Component]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDispatchOrderFclV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
