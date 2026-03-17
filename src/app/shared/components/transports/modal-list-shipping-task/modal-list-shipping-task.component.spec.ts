import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalListShippingTaskComponent } from './modal-list-shipping-task.component';

describe('ModalListShippingTaskComponent', () => {
  let component: ModalListShippingTaskComponent;
  let fixture: ComponentFixture<ModalListShippingTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalListShippingTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalListShippingTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
