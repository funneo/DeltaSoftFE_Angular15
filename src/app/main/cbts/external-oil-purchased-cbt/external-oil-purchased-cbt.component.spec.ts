import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalOilPurchasedCbtComponent } from './external-oil-purchased-cbt.component';

describe('ExternalOilPurchasedCbtComponent', () => {
  let component: ExternalOilPurchasedCbtComponent;
  let fixture: ComponentFixture<ExternalOilPurchasedCbtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalOilPurchasedCbtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalOilPurchasedCbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
