import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCsRatingComponent } from './modal-cs-rating.component';

describe('ModalCsRatingComponent', () => {
  let component: ModalCsRatingComponent;
  let fixture: ComponentFixture<ModalCsRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCsRatingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCsRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
