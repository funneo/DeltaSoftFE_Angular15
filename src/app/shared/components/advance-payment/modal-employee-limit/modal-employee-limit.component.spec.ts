import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEmployeeLimitComponent } from './modal-employee-limit.component';

describe('ModalEmployeeLimitComponent', () => {
  let component: ModalEmployeeLimitComponent;
  let fixture: ComponentFixture<ModalEmployeeLimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEmployeeLimitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEmployeeLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
