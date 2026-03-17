import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSublistCategoryComponent } from './modal-sublist-category.component';

describe('ModalSublistCategoryComponent', () => {
  let component: ModalSublistCategoryComponent;
  let fixture: ComponentFixture<ModalSublistCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSublistCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSublistCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
