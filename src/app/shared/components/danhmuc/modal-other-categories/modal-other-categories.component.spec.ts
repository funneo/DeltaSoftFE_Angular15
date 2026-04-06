import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOtherCategoriesComponent } from './modal-other-categories.component';

describe('ModalOtherCategoriesComponent', () => {
  let component: ModalOtherCategoriesComponent;
  let fixture: ComponentFixture<ModalOtherCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalOtherCategoriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOtherCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
