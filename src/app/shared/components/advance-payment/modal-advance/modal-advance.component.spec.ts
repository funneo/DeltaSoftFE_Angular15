import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdvanceComponent } from './modal-advance.component';

describe('ModalAdvanceComponent', () => {
  let component: ModalAdvanceComponent;
  let fixture: ComponentFixture<ModalAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAdvanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
