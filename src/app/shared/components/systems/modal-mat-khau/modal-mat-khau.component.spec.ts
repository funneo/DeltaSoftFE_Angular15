import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMatKhauComponent } from './modal-mat-khau.component';

describe('ModalMatKhauComponent', () => {
  let component: ModalMatKhauComponent;
  let fixture: ComponentFixture<ModalMatKhauComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalMatKhauComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMatKhauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
