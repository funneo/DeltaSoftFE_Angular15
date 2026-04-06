import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingTaskOpmanComponent } from './modal-shipping-task-opman.component';

describe('ModalShippingTaskOpmanComponent', () => {
  let component: ModalShippingTaskOpmanComponent;
  let fixture: ComponentFixture<ModalShippingTaskOpmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingTaskOpmanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingTaskOpmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
