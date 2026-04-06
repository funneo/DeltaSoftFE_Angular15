import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewSublistComponent } from './modal-view-sublist.component';

describe('ModalViewSublistComponent', () => {
  let component: ModalViewSublistComponent;
  let fixture: ComponentFixture<ModalViewSublistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalViewSublistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewSublistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
