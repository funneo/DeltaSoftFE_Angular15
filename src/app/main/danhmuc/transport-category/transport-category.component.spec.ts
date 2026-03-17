import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportCategoryComponent } from './transport-category.component';

describe('TransportCategoryComponent', () => {
  let component: TransportCategoryComponent;
  let fixture: ComponentFixture<TransportCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
