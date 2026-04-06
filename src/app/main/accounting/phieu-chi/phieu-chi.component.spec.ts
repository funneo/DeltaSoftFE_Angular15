import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhieuChiComponent } from './phieu-chi.component';

describe('PhieuChiComponent', () => {
  let component: PhieuChiComponent;
  let fixture: ComponentFixture<PhieuChiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhieuChiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhieuChiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
