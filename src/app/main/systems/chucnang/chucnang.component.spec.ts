import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChucnangComponent } from './chucnang.component';

describe('ChucnangComponent', () => {
  let component: ChucnangComponent;
  let fixture: ComponentFixture<ChucnangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChucnangComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChucnangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
