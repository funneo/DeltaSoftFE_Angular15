import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdvanceGroupComponent } from './modal-advance-group.component';

describe('ModalAdvanceGroupComponent', () => {
  let component: ModalAdvanceGroupComponent;
  let fixture: ComponentFixture<ModalAdvanceGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAdvanceGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAdvanceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
