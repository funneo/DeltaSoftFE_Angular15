import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverFuelApprovalCbtComponent } from './driver-fuel-approval-cbt.component';

describe('DriverFuelApprovalCbtComponent', () => {
  let component: DriverFuelApprovalCbtComponent;
  let fixture: ComponentFixture<DriverFuelApprovalCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverFuelApprovalCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverFuelApprovalCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
