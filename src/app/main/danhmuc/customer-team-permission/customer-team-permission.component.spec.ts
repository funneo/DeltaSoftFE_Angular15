import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTeamPermissionComponent } from './customer-team-permission.component';

describe('CustomerTeamPermissionComponent', () => {
  let component: CustomerTeamPermissionComponent;
  let fixture: ComponentFixture<CustomerTeamPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerTeamPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTeamPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
