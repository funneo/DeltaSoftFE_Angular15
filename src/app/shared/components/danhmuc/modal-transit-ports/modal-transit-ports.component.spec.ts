import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransitPortsComponent } from './modal-transit-ports.component';

describe('ModalTransitPortsComponent', () => {
  let component: ModalTransitPortsComponent;
  let fixture: ComponentFixture<ModalTransitPortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTransitPortsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransitPortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
