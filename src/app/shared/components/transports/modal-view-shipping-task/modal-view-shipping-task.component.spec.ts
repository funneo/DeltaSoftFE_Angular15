import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewShippingTaskComponent } from './modal-view-shipping-task.component';

describe('ModalViewShippingTaskComponent', () => {
  let component: ModalViewShippingTaskComponent;
  let fixture: ComponentFixture<ModalViewShippingTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalViewShippingTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewShippingTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
