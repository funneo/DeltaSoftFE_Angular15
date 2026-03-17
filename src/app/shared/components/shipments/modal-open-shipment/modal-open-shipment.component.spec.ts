import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOpenShipmentComponent } from './modal-open-shipment.component';

describe('ModalOpenShipmentComponent', () => {
  let component: ModalOpenShipmentComponent;
  let fixture: ComponentFixture<ModalOpenShipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalOpenShipmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOpenShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
