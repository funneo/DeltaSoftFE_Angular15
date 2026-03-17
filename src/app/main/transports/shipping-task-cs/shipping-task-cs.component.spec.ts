import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingTaskCsComponent } from './shipping-task-cs.component';

describe('ShippingTaskCsComponent', () => {
  let component: ShippingTaskCsComponent;
  let fixture: ComponentFixture<ShippingTaskCsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingTaskCsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingTaskCsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
