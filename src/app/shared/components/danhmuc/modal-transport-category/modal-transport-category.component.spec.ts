import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportCategoryComponent } from './modal-transport-category.component';

describe('ModalTransportCategoryComponent', () => {
  let component: ModalTransportCategoryComponent;
  let fixture: ComponentFixture<ModalTransportCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTransportCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
