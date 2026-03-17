import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDistrictComponent } from './modal-district.component';

describe('ModalDistrictComponent', () => {
  let component: ModalDistrictComponent;
  let fixture: ComponentFixture<ModalDistrictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDistrictComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDistrictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
