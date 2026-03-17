import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPriceCanonComponent } from './modal-price-canon.component';

describe('ModalPriceCanonComponent', () => {
  let component: ModalPriceCanonComponent;
  let fixture: ComponentFixture<ModalPriceCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPriceCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPriceCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
