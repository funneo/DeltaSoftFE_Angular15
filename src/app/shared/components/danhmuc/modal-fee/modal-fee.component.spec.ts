import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFeeComponent } from './modal-fee.component';

describe('ModalFeeComponent', () => {
  let component: ModalFeeComponent;
  let fixture: ComponentFixture<ModalFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
