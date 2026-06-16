import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService, NotificationService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { GeminiAiService, InvoiceExtractionResult } from '@app/shared/services/gemini-ai.service';
import { PendingInvoiceService, PendingInvoiceCreateItem } from '@app/shared/services/pending-invoice.service';
import { FeeCodeService } from '@app/shared/services/fee-code.service';
import { FeeCode } from '@app/shared/models';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-doc-hoa-don',
  templateUrl: './modal-doc-hoa-don.component.html',
  styleUrls: ['./modal-doc-hoa-don.component.css']
})
export class ModalDocHoaDonComponent implements OnInit {
  @ViewChild('modalDocHoaDon', { static: false }) modal: ModalDirective;
  @Output() CloseModal = new EventEmitter<any>();
  @Output() SaveSuccess = new EventEmitter<any>();

  loading = false;
  retrying = false;
  saving = false;
  results: InvoiceExtractionResult[] = [];
  checkedSet: Set<number> = new Set();      // index các row được tích
  selectedIndex = 0;
  fileName = '';
  uploadId: string = null;
  previewUrl: string = null;
  isImage = false;

  // ===== Phân loại 2 cấp (FeeCode Lvl1 → Lvl2) — bắt chọn TRƯỚC khi upload =====
  feeCodeLvl1List: FeeCode[] = [];
  selectedGroupFeeCode: string = null;          // = FeeCodes.FeeCode của bản Lvl1
  feeCodeLvl2List: FeeCode[] = [];              // phân nhóm cấp 2 (lọc theo Lvl1 + chỉ "được quét invoice")
  selectedSubFeeCode: string = null;            // = FeeCodes.FeeCode của bản Lvl2
  showReview = false;                           // checkbox "Hiển thị thông tin hóa đơn trước khi lưu"

  private allowedSingle = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  constructor(
    private geminiService: GeminiAiService,
    private pendingInvoiceService: PendingInvoiceService,
    private notificationService: NotificationService,
    private exportService: ExportService,
    private authService: AuthService,
    private feeCodeService: FeeCodeService
  ) { }

  ngOnInit(): void { }

  show() {
    this.reset();
    this.selectedGroupFeeCode = null;
    this.selectedSubFeeCode = null;
    this.feeCodeLvl2List = [];
    this.showReview = false;
    this.loadFeeCodeLvl1();
    this.modal.show();
  }

  /** Load FeeCode cấp 1 (Lĩnh vực) đã duyệt (status=2). */
  loadFeeCodeLvl1() {
    if (this.feeCodeLvl1List?.length) return;   // cache trong vòng đời component
    this.feeCodeService.getAll(null, 1, 2).subscribe(res => {
      this.feeCodeLvl1List = res?.data || [];
    });
  }

  /** Đổi Lvl1 → reset Lvl2 + load phân nhóm cấp 2 (chỉ mã được quét invoice). */
  onChangeGroupFeeLvl1() {
    this.selectedSubFeeCode = null;
    this.feeCodeLvl2List = [];
    const parent = this.feeCodeLvl1List?.find(x => x.feeCode === this.selectedGroupFeeCode);
    if (!parent?.id) return;
    this.feeCodeService.getAll(parent.id, 2, 2, true).subscribe(res => {
      this.feeCodeLvl2List = res?.data || [];
    });
  }

  // Bắt chọn ĐỦ 2 cấp trước khi cho upload.
  get canUpload(): boolean { return !!this.selectedGroupFeeCode && !!this.selectedSubFeeCode; }

  private get selectedGroupFeeName(): string {
    const f = this.feeCodeLvl1List?.find(x => x.feeCode === this.selectedGroupFeeCode);
    return f?.feeName || null;
  }

  private get selectedSubFeeName(): string {
    const f = this.feeCodeLvl2List?.find(x => x.feeCode === this.selectedSubFeeCode);
    return f?.feeName || null;
  }

  close() {
    if (this.uploadId) {
      this.geminiService.discardUpload(this.uploadId).subscribe({ next: () => {}, error: () => {} });
    }
    this.modal.hide();
    this.CloseModal.emit();
  }

  reset() {
    if (this.uploadId) {
      this.geminiService.discardUpload(this.uploadId).subscribe({ next: () => {}, error: () => {} });
    }
    this.results = [];
    this.checkedSet = new Set();
    this.selectedIndex = 0;
    this.loading = false;
    this.retrying = false;
    this.saving = false;
    this.fileName = '';
    this.uploadId = null;
    this.previewUrl = null;
    this.isImage = false;
  }

  // ===== Trạng thái hiển thị =====
  get hasResult(): boolean { return this.results.length > 0; }
  get isMulti(): boolean { return this.results.length > 1; }
  get selected(): InvoiceExtractionResult { return this.results[this.selectedIndex] ?? null; }
  get okCount(): number { return this.results.filter(r => !r.error).length; }
  get errorCount(): number { return this.results.filter(r => !!r.error).length; }
  get duplicateCount(): number { return this.results.filter(r => r.isDuplicate).length; }
  get checkedCount(): number { return this.checkedSet.size; }
  get canSave(): boolean { return this.checkedCount > 0 && !this.saving && !this.retrying; }
  get canRetrySelected(): boolean { return this.checkedCount > 0 && !!this.uploadId && !this.retrying && !this.saving; }

  get totalPromptTokens(): number { return this.results.reduce((s, r) => s + (r.promptTokens ?? 0), 0); }
  get totalCompletionTokens(): number { return this.results.reduce((s, r) => s + (r.completionTokens ?? 0), 0); }
  get totalTokens(): number { return this.results.reduce((s, r) => s + (r.totalTokens ?? 0), 0); }
  get hasTokenUsage(): boolean { return this.totalTokens > 0; }

  selectInvoice(i: number) { this.selectedIndex = i; }
  isChecked(i: number): boolean { return this.checkedSet.has(i); }
  toggleCheck(i: number, ev?: Event) {
    if (ev) { ev.stopPropagation(); }
    if (this.checkedSet.has(i)) this.checkedSet.delete(i);
    else this.checkedSet.add(i);
  }

  selectAll() {
    this.checkedSet = new Set(this.results.map((_, i) => i));
  }
  clearAll() { this.checkedSet = new Set(); }
  selectErrorsOnly() {
    this.checkedSet = new Set(this.results.map((r, i) => r.error ? i : -1).filter(i => i >= 0));
  }
  selectNonErrorOnly() {
    this.checkedSet = new Set(this.results.map((r, i) => !r.error ? i : -1).filter(i => i >= 0));
  }

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
    if (!this.selectedGroupFeeCode) {
      this.notificationService.printErrorMessage('Vui lòng chọn Nhóm phí cấp 1 (Lĩnh vực) trước khi tải hóa đơn.');
      return;
    }
    const name = (file.name || '').toLowerCase();
    const isArchive = name.endsWith('.zip') || name.endsWith('.rar');
    const isSingleOk = this.allowedSingle.includes(file.type);
    if (!isArchive && !isSingleOk) {
      this.notificationService.printErrorMessage('Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WEBP), PDF hoặc file nén ZIP/RAR');
      return;
    }
    this.fileName = file.name;
    this.results = [];
    this.checkedSet = new Set();
    this.selectedIndex = 0;
    this.loading = true;

    this.isImage = !isArchive && file.type.startsWith('image/');
    if (this.isImage) {
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target.result as string; };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    this.geminiService.extractInvoices(file).subscribe(
      (res) => {
        this.uploadId = res?.uploadId ?? null;
        this.results = res?.results ?? [];
        this.selectedIndex = 0;
        // Default check: OK rows checked, error unchecked.
        this.selectNonErrorOnly();
        this.loading = false;
        // Không bật "xem trước khi lưu" → tự lưu hết dòng OK ngay (auto-insert).
        // Còn dòng lỗi: saveSelected lưu OK, modal giữ lại để user đọc lại.
        if (!this.showReview && this.checkedCount > 0) {
          this.saveSelected();
        }
      },
      (err) => {
        this.loading = false;
        this.notificationService.printErrorMessage('Lỗi khi phân tích hóa đơn: ' + (err?.message ?? err));
      }
    );
  }

  /** Đọc lại Gemini cho TempFileName của các row đang checked. */
  retrySelected() {
    if (!this.uploadId) {
      this.notificationService.printErrorMessage('Phiên upload đã đóng — vui lòng chọn lại file.');
      return;
    }
    const tempNames = Array.from(this.checkedSet)
      .map(i => this.results[i]?.tempFileName)
      .filter(x => !!x);
    const uniq = Array.from(new Set(tempNames));
    if (uniq.length === 0) {
      this.notificationService.printErrorMessage('Chưa chọn dòng nào để đọc lại.');
      return;
    }

    this.retrying = true;
    this.geminiService.retryInvoices(this.uploadId, uniq).subscribe(
      (newResults) => {
        this.retrying = false;
        const keepIdx = this.results
          .map((r, i) => uniq.includes(r.tempFileName) ? -1 : i)
          .filter(i => i >= 0);
        const kept = keepIdx.map(i => this.results[i]);
        this.results = [...kept, ...(newResults || [])];
        // Re-check: dòng cũ giữ check theo cũ + dòng mới mặc định check nếu không lỗi.
        const newChecked = new Set<number>();
        keepIdx.forEach((origIdx, newIdx) => { if (this.checkedSet.has(origIdx)) newChecked.add(newIdx); });
        (newResults || []).forEach((r, j) => { if (!r.error) newChecked.add(kept.length + j); });
        this.checkedSet = newChecked;
        if (this.selectedIndex >= this.results.length) this.selectedIndex = 0;
      },
      (err) => {
        this.retrying = false;
        const status = err?.status ?? err?.error?.status;
        if (status === 410) {
          this.uploadId = null;
          this.notificationService.printErrorMessage('Phiên upload hết hạn — vui lòng chọn lại file.');
        } else {
          this.notificationService.printErrorMessage('Lỗi khi đọc lại hóa đơn: ' + (err?.message ?? err));
        }
      }
    );
  }

  /** Lưu N hóa đơn checked vào Tbl_PendingInvoice + move file sang vùng chính. */
  saveSelected() {
    if (!this.uploadId) {
      this.notificationService.printErrorMessage('Phiên upload đã đóng — vui lòng chọn lại file.');
      return;
    }
    const items: PendingInvoiceCreateItem[] = Array.from(this.checkedSet)
      .map(i => this.results[i])
      .filter(r => r && !r.error && r.tempFileName)
      .map(r => PendingInvoiceService.fromExtractionResult(r));
    if (items.length === 0) {
      this.notificationService.printErrorMessage('Không có dòng hợp lệ để lưu.');
      return;
    }
    const branchId = Number.parseInt(this.authService.getLoggedInUser()?.branchId);

    this.saving = true;
    this.pendingInvoiceService.createBatch({
      uploadId: this.uploadId,
      groupFeeCode: this.selectedGroupFeeCode,
      groupFeeName: this.selectedGroupFeeName,
      subFeeCode: this.selectedSubFeeCode,
      subFeeName: this.selectedSubFeeName,
      items
    }, branchId).subscribe(
      (res: any) => {
        this.saving = false;
        if (res?.code == '200' || res?.code == '201') {
          const saved = res.data?.savedCount ?? items.length;
          const errs = res.data?.errors ?? [];
          this.notificationService.printSuccessMessage(`Đã lưu ${saved} hóa đơn vào danh sách chờ TT.`);
          this.uploadId = null;  // BE đã xóa folder temp sau khi lưu
          this.SaveSuccess.emit(res.data);
          if (errs.length === 0) this.close();
          else this.notificationService.printErrorMessage(`Lưu xong ${saved}/${items.length}. ${errs.length} dòng lỗi — xem console.`);
        } else if (res?.code == '410') {
          this.uploadId = null;
          this.notificationService.printErrorMessage(res.message ?? 'Phiên upload hết hạn.');
        } else {
          this.notificationService.printErrorMessage('Lưu hóa đơn thất bại: ' + (res?.message ?? ''));
        }
      },
      (err) => {
        this.saving = false;
        this.notificationService.printErrorMessage('Lưu hóa đơn lỗi: ' + (err?.message ?? err));
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
      'Trùng': r.isDuplicate ? (r.duplicates?.map(d => d.paymentRefNo).join(', ') ?? 'Có') : '',
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
