import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdvanceCbtComponent } from './modal-advance-cbt.component';

describe('ModalAdvanceCbtComponent', () => {
  let component: ModalAdvanceCbtComponent;
  let fixture: ComponentFixture<ModalAdvanceCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAdvanceCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAdvanceCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
