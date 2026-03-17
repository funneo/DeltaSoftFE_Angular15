import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPhieuThuComponent } from './modal-phieu-thu.component';

describe('ModalPhieuThuComponent', () => {
  let component: ModalPhieuThuComponent;
  let fixture: ComponentFixture<ModalPhieuThuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPhieuThuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPhieuThuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
