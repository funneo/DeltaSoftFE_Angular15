import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentComponent } from './modal-shipment.component';

describe('ModalShipmentComponent', () => {
  let component: ModalShipmentComponent;
  let fixture: ComponentFixture<ModalShipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShipmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
