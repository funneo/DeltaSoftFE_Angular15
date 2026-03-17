import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRevenueFeeComponent } from './modal-revenue-fee.component';

describe('ModalRevenueFeeComponent', () => {
  let component: ModalRevenueFeeComponent;
  let fixture: ComponentFixture<ModalRevenueFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRevenueFeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRevenueFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
