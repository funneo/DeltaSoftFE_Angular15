import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPortsComponent } from './modal-ports.component';

describe('ModalPortsComponent', () => {
  let component: ModalPortsComponent;
  let fixture: ComponentFixture<ModalPortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPortsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
