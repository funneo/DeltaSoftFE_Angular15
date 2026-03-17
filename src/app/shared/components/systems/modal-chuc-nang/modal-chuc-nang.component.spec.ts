import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalChucNangComponent } from './modal-chuc-nang.component';

describe('ModalChucNangComponent', () => {
  let component: ModalChucNangComponent;
  let fixture: ComponentFixture<ModalChucNangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalChucNangComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalChucNangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
