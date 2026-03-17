import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLimitComponent } from './employee-limit.component';

describe('EmployeeLimitComponent', () => {
  let component: EmployeeLimitComponent;
  let fixture: ComponentFixture<EmployeeLimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLimitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
