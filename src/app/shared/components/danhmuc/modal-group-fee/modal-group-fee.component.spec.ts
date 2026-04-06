import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGroupFeeComponent } from './modal-group-fee.component';

describe('ModalGroupFeeComponent', () => {
  let component: ModalGroupFeeComponent;
  let fixture: ComponentFixture<ModalGroupFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalGroupFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGroupFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
