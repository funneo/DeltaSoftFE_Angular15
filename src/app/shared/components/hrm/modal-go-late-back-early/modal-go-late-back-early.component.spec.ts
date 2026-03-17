import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGoLateBackEarlyComponent } from './modal-go-late-back-early.component';

describe('ModalGoLateBackEarlyComponent', () => {
  let component: ModalGoLateBackEarlyComponent;
  let fixture: ComponentFixture<ModalGoLateBackEarlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalGoLateBackEarlyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGoLateBackEarlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
