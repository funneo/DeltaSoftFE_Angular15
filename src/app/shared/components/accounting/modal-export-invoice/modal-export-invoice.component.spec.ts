import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalExportInvoiceComponent } from './modal-export-invoice.component';

describe('ModalExportInvoiceComponent', () => {
  let component: ModalExportInvoiceComponent;
  let fixture: ComponentFixture<ModalExportInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalExportInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalExportInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
