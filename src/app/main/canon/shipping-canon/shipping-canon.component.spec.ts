import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingCanonComponent } from './shipping-canon.component';

describe('ShippingCanonComponent', () => {
  let component: ShippingCanonComponent;
  let fixture: ComponentFixture<ShippingCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
