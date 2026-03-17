import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingTaskCsComponent } from './modal-shipping-task-cs.component';

describe('ModalShippingTaskCsComponent', () => {
  let component: ModalShippingTaskCsComponent;
  let fixture: ComponentFixture<ModalShippingTaskCsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingTaskCsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingTaskCsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
