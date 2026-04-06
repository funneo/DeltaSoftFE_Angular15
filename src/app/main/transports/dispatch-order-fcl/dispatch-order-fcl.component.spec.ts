import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchOrderFclComponent } from './dispatch-order-fcl.component';

describe('DispatchOrderFclComponent', () => {
  let component: DispatchOrderFclComponent;
  let fixture: ComponentFixture<DispatchOrderFclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispatchOrderFclComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchOrderFclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
