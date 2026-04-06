import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestNewEmployeeComponent } from './request-new-employee.component';

describe('RequestNewEmployeeComponent', () => {
  let component: RequestNewEmployeeComponent;
  let fixture: ComponentFixture<RequestNewEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestNewEmployeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestNewEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
