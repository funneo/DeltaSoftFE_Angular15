import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImportExcelComponent } from './modal-import-excel.component';

describe('ModalImportExcelComponent', () => {
  let component: ModalImportExcelComponent;
  let fixture: ComponentFixture<ModalImportExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalImportExcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalImportExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
