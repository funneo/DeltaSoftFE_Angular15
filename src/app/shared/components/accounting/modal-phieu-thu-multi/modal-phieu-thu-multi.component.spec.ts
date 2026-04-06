import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPhieuThuMultiComponent } from './modal-phieu-thu-multi.component';

describe('ModalPhieuThuMultiComponent', () => {
  let component: ModalPhieuThuMultiComponent;
  let fixture: ComponentFixture<ModalPhieuThuMultiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPhieuThuMultiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPhieuThuMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
