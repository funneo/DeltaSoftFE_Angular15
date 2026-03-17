import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingTaskAttachFileComponent } from './modal-shipping-task-attach-file.component';

describe('ModalShippingTaskAttachFileComponent', () => {
  let component: ModalShippingTaskAttachFileComponent;
  let fixture: ComponentFixture<ModalShippingTaskAttachFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingTaskAttachFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingTaskAttachFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
