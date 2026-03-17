import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRebetsComponent } from './modal-rebets.component';

describe('ModalRebetsComponent', () => {
  let component: ModalRebetsComponent;
  let fixture: ComponentFixture<ModalRebetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRebetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRebetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
