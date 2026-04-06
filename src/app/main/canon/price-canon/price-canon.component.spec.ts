import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCanonComponent } from './price-canon.component';

describe('PriceCanonComponent', () => {
  let component: PriceCanonComponent;
  let fixture: ComponentFixture<PriceCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
