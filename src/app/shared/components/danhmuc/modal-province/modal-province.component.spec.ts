import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProvinceComponent } from './modal-province.component';

describe('ModalProvinceComponent', () => {
  let component: ModalProvinceComponent;
  let fixture: ComponentFixture<ModalProvinceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalProvinceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalProvinceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
