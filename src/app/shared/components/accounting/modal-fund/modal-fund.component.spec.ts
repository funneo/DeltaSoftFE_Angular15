import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFundComponent } from './modal-fund.component';

describe('ModalFundComponent', () => {
  let component: ModalFundComponent;
  let fixture: ComponentFixture<ModalFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalFundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
