import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchOrderCbtComponent } from './dispatch-order-cbt.component';

describe('DispatchOrderCbtComponent', () => {
  let component: DispatchOrderCbtComponent;
  let fixture: ComponentFixture<DispatchOrderCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispatchOrderCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchOrderCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
