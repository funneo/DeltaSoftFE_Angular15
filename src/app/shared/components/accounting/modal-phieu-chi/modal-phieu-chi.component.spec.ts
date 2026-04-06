import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPhieuChiComponent } from './modal-phieu-chi.component';

describe('ModalPhieuChiComponent', () => {
  let component: ModalPhieuChiComponent;
  let fixture: ComponentFixture<ModalPhieuChiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPhieuChiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPhieuChiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
