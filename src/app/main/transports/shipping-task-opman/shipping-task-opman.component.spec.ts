import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingTaskOpmanComponent } from './shipping-task-opman.component';

describe('ShippingTaskOpmanComponent', () => {
  let component: ShippingTaskOpmanComponent;
  let fixture: ComponentFixture<ShippingTaskOpmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingTaskOpmanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingTaskOpmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
