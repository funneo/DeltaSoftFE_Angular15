import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundReserveComponent } from './fund-reserve.component';

describe('FundReserveComponent', () => {
  let component: FundReserveComponent;
  let fixture: ComponentFixture<FundReserveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundReserveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundReserveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
