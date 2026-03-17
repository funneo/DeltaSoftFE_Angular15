import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFuelSummaryComponent } from './modal-fuel-summary.component';

describe('ModalFuelSummaryComponent', () => {
  let component: ModalFuelSummaryComponent;
  let fixture: ComponentFixture<ModalFuelSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalFuelSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFuelSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
