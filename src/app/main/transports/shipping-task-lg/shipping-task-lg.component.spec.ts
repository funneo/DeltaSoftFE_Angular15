import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingTaskLgComponent } from './shipping-task-lg.component';

describe('ShippingTaskLgComponent', () => {
  let component: ShippingTaskLgComponent;
  let fixture: ComponentFixture<ShippingTaskLgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingTaskLgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingTaskLgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
