import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingTaskChangeInfoComponent } from './modal-shipping-task-change-info.component';

describe('ModalShippingTaskChangeInfoComponent', () => {
  let component: ModalShippingTaskChangeInfoComponent;
  let fixture: ComponentFixture<ModalShippingTaskChangeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingTaskChangeInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingTaskChangeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
