import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPerformFclComponent } from './modal-perform-fcl.component';

describe('ModalPerformFclComponent', () => {
  let component: ModalPerformFclComponent;
  let fixture: ComponentFixture<ModalPerformFclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPerformFclComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPerformFclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
