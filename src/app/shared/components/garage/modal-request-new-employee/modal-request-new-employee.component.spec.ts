import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRequestNewEmployeeComponent } from './modal-request-new-employee.component';

describe('ModalRequestNewEmployeeComponent', () => {
  let component: ModalRequestNewEmployeeComponent;
  let fixture: ComponentFixture<ModalRequestNewEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRequestNewEmployeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRequestNewEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
