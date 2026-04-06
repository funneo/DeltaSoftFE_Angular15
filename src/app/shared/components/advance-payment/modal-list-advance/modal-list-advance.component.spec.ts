import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalListAdvanceComponent } from './modal-list-advance.component';

describe('ModalListAdvanceComponent', () => {
  let component: ModalListAdvanceComponent;
  let fixture: ComponentFixture<ModalListAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalListAdvanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalListAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
