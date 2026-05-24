import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NotificationService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { GeminiAiService, InvoiceExtractionResult } from '@app/shared/services/gemini-ai.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-doc-hoa-don',
  templateUrl: './modal-doc-hoa-don.component.html',
  styleUrls: ['./modal-doc-hoa-don.component.css']
})
export class ModalDocHoaDonComponent implements OnInit {
  @ViewChild('modalDocHoaDon', { static: false }) modal: ModalDirective;
  @Output() CloseModal = new EventEmitter<any>();

  loading = false;
  results: InvoiceExtractionResult[] = [];
  selectedIndex = 0;
  fileName = '';
  previewUrl: string = null;
  isImage = false;

  private allowedSingle = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  constructor(
    private geminiService: GeminiAiService,
    private notificationService: NotificationService,
    private exportService: ExportService
  ) { }

  ngOnInit(): void { }

  show() {
    this.reset();
    this.modal.show();
  }

  close() {
    this.modal.hide();
    this.CloseModal.emit();
  }

  reset() {
    this.results = [];
    this.selectedIndex = 0;
    this.loading = false;
    this.fileName = '';
    this.previewUrl = null;
    this.isImage = false;
  }

  // ===== Trạng thái hiển thị =====
  get hasResult(): boolean { return this.results.length > 0; }
  get isMulti(): boolean { return this.results.length > 1; }
  get selected(): InvoiceExtractionResult { return this.results[this.selectedIndex] ?? null; }
  get okCount(): number { return this.results.filter(r => !r.error).length; }
  get errorCount(): number { return this.results.filter(r => !!r.error).length; }

  selectInvoice(i: number) { this.selectedIndex = i; }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = '';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private processFile(file: File) {
    const name = (file.name || '').toLowerCase();
    const isArchive = name.endsWith('.zip') || name.endsWith('.rar');
    const isSingleOk = this.allowedSingle.includes(file.type);
    if (!isArchive && !isSingleOk) {
      this.notificationService.printErrorMessage('Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WEBP), PDF hoặc file nén ZIP/RAR');
      return;
    }
    this.fileName = file.name;
    this.results = [];
    this.selectedIndex = 0;
    this.loading = true;

    // Preview chỉ áp dụng cho 1 ảnh đơn (không phải file nén)
    this.isImage = !isArchive && file.type.startsWith('image/');
    if (this.isImage) {
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target.result as string; };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    this.geminiService.extractInvoices(file).subscribe(
      (res: InvoiceExtractionResult[]) => {
        this.results = res || [];
        this.selectedIndex = 0;
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.notificationService.printErrorMessage('Lỗi khi phân tích hóa đơn: ' + (err?.message ?? err));
      }
    );
  }

  get totalLineItems(): number {
    return this.selected?.lineItems?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0;
  }

  openWebLink() {
    if (this.selected?.webLink) {
      window.open(this.selected.webLink, '_blank');
    }
  }

  // ===== Xuất Excel danh sách hóa đơn (2 sheet: HoaDon + ChiTietHang) =====
  exportExcel() {
    if (!this.hasResult) {
      this.notificationService.printErrorMessage('Không có dữ liệu để xuất!');
      return;
    }

    const invoiceRows = this.results.map((r, idx) => ({
      'STT': idx + 1,
      'File': r.fileName || '',
      'Nhà cung cấp': r.vendorName || '',
      'MST NCC': r.vendorTaxId || '',
      'Số HĐ': r.invoiceId || '',
      'Ký hiệu': r.invoiceSymbol || '',
      'Ngày': r.invoiceDate || '',
      'Khách hàng': r.customerName || '',
      'Tiền trước thuế': r.netAmount ?? null,
      'Thuế': r.taxAmount ?? null,
      'Tổng tiền': r.totalAmount ?? null,
      'Tiền tệ': r.currency || '',
      'Web tra cứu': r.webLink || '',
      'Mã tra cứu': r.webCode || '',
      'Trạng thái': r.error ? r.error : 'OK'
    }));

    const detailRows: any[] = [];
    this.results.forEach((r, idx) => {
      (r.lineItems || []).forEach((it, j) => {
        detailRows.push({
          'STT HĐ': idx + 1,
          'Số HĐ': r.invoiceId || '',
          'File': r.fileName || '',
          'STT dòng': j + 1,
          'Mô tả': it.description || '',
          'SL': it.quantity ?? null,
          'ĐVT': it.unit || '',
          'Đơn giá': it.unitPrice ?? null,
          'Thành tiền': it.amount ?? null
        });
      });
    });

    const fileName = 'hoa-don-' + new Date().toISOString().slice(0, 10);
    this.exportService.exportMultiSheet(
      [
        { name: 'HoaDon', data: invoiceRows },
        { name: 'ChiTietHang', data: detailRows }
      ],
      fileName
    );
  }
}
