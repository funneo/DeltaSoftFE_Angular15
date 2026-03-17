import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShippingCanonComponent } from './modal-shipping-canon.component';

describe('ModalShippingCanonComponent', () => {
  let component: ModalShippingCanonComponent;
  let fixture: ComponentFixture<ModalShippingCanonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShippingCanonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShippingCanonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
