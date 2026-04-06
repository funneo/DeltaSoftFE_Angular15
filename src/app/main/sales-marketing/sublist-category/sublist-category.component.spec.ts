import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SublistCategoryComponent } from './sublist-category.component';

describe('SublistCategoryComponent', () => {
  let component: SublistCategoryComponent;
  let fixture: ComponentFixture<SublistCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SublistCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SublistCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
