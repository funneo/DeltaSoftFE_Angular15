import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhieuThuComponent } from './phieu-thu.component';

describe('PhieuThuComponent', () => {
  let component: PhieuThuComponent;
  let fixture: ComponentFixture<PhieuThuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhieuThuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhieuThuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
