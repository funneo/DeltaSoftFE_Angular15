import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService, NotificationService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { GeminiAiService, InvoiceExtractionResult } from '@app/shared/services/gemini-ai.service';
import { PendingInvoiceService, PendingInvoiceCreateItem } from '@app/shared/services/pending-invoice.service';
import { FeeCodeService } from '@app/shared/services/fee-code.service';
import { FeeCode } from '@app/shared/models';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ModalPickJobComponent, PickJobResult } from '../modal-pick-job/modal-pick-job.component';

@Component({
  selector: 'modal-doc-hoa-don',
  templateUrl: './modal-doc-hoa-don.component.html',
  styleUrls: ['./modal-doc-hoa-don.component.css']
})
export class ModalDocHoaDonComponent implements OnInit {
  @ViewChild('modalDocHoaDon', { static: false }) modal: ModalDirective;
  @ViewChild(ModalPickJobComponent, { static: false }) modalPickJob: ModalPickJobComponent;
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

  // ===== Phân loại nhóm phí cấp 1 (FeeCode Lvl1) — bắt chọn TRƯỚC khi upload =====
  // (Cấp 2 đã ẩn khỏi modal này — chỉ giữ Cấp 1; SubFee gửi BE = null.)
  feeCodeLvl1List: FeeCode[] = [];
  selectedGroupFeeCode: string = null;          // = FeeCodes.FeeCode của bản Lvl1
  showReview = false;                           // checkbox "Hiển thị thông tin hóa đơn trước khi lưu"
  // Khi nhóm = Chi phí hàng bán (02): chọn loại chi phí (quyết định có bắt buộc gán Lô/CV không).
  salesSubType: 'reinvoice' | 'other' | null = null;

  // ===== Gán cả lô hóa đơn cho Lô hàng (Job) HOẶC Công việc (PCCV/Workflow) =====
  assignType: 'job' | 'workflow' = 'job';       // mặc định gán theo Lô hàng
  selectedJobId: string = null;                 // JobId (read-only, từ picker)
  selectedShipmentId: number = null;            // ShipmentId tương ứng
  selectedWorkflowId: number = null;            // WorkflowId (chỉ khi gán theo Công việc)
  selectedWorkflowDisplay: string = null;       // refCode/tên công việc hiển thị

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
    this.showReview = false;
    this.assignType = 'job';
    this.salesSubType = null;
    this.clearAssignTarget();
    this.loadFeeCodeLvl1();
    this.modal.show();
  }

  /** Đổi nhóm phí cấp 1 → reset loại chi phí hàng bán nếu nhóm mới không phải hàng bán. */
  onChangeGroupFee() {
    if (!this.isSalesGroup) this.salesSubType = null;
  }

  /** Load FeeCode cấp 1 (Lĩnh vực) đã duyệt (status=2), sắp xếp theo thứ tự Phụ lục. */
  loadFeeCodeLvl1() {
    if (this.feeCodeLvl1List?.length) return;   // cache trong vòng đời component
    this.feeCodeService.getAll(null, 1, 2).subscribe(res => {
      this.feeCodeLvl1List = this.sortLvl1Priority(res?.data || []);
    });
  }

  /** Sắp xếp theo thứ tự Phụ lục: trả hộ → hàng bán → quản lý chung → đầu tư → khác (sort ổn định). */
  private sortLvl1Priority(list: FeeCode[]): FeeCode[] {
    const rank = (f: FeeCode): number => {
      const n = (f?.feeName || '').toLowerCase();
      if (n.includes('trả hộ')) return 0;
      if (n.includes('hàng bán')) return 1;
      if (n.includes('quản lý')) return 2;
      if (n.includes('đầu tư')) return 3;
      if (n.includes('khác')) return 4;
      return 5;
    };
    return [...list].sort((a, b) => rank(a) - rank(b));
  }

  // ===== Gán Lô hàng / Công việc =====
  onChangeAssignType() { this.clearAssignTarget(); }

  private clearAssignTarget() {
    this.selectedJobId = null;
    this.selectedShipmentId = null;
    this.selectedWorkflowId = null;
    this.selectedWorkflowDisplay = null;
  }

  /** Mở picker theo loại đang chọn (job = Lô hàng, workflow = Công việc). */
  openPicker() {
    if (this.hasResult || this.loading) return;   // đã đọc xong thì khóa, không cho đổi
    this.modalPickJob?.show(this.assignType);
  }

  /** Nhận kết quả chọn từ modal-pick-job. */
  onPickItem(e: PickJobResult) {
    if (!e) return;
    this.selectedJobId = e.jobId;
    this.selectedShipmentId = e.shipmentId;
    if (this.assignType === 'workflow') {
      this.selectedWorkflowId = e.workflowId ?? null;
      this.selectedWorkflowDisplay = e.refDisplay;
    } else {
      this.selectedWorkflowId = null;
      this.selectedWorkflowDisplay = null;
    }
  }

  private get selectedGroupFeeName(): string {
    const f = this.feeCodeLvl1List?.find(x => x.feeCode === this.selectedGroupFeeCode);
    return f?.feeName || null;
  }

  // ===== Phân loại nhóm → điều kiện bắt buộc gán Lô/Công việc =====
  private get groupNameLower(): string { return (this.selectedGroupFeeName || '').toLowerCase(); }
  get isReimbursementGroup(): boolean { return this.groupNameLower.includes('trả hộ'); }   // nhóm Chi phí trả hộ
  get isSalesGroup(): boolean { return this.groupNameLower.includes('hàng bán'); }          // nhóm Chi phí hàng bán (02)

  /** Bắt buộc gán Lô/CV: nhóm trả hộ, HOẶC nhóm hàng bán + "trả hộ xuất lại hóa đơn cho khách". */
  get isAssignRequired(): boolean {
    return this.isReimbursementGroup || (this.isSalesGroup && this.salesSubType === 'reinvoice');
  }

  /** Nhãn loại chi phí hàng bán đang chọn (snapshot lưu vào subFeeName để truy vết). */
  get salesSubTypeLabel(): string {
    if (this.salesSubType === 'reinvoice') return 'Chi phí trả hộ xuất lại hóa đơn cho khách';
    if (this.salesSubType === 'other') return 'Tất cả các hóa đơn chi phí hàng bán khác';
    return null;
  }

  /** Gợi ý khi chưa đủ điều kiện upload. */
  get uploadHint(): string {
    if (!this.selectedGroupFeeCode) return 'Hãy chọn Nhóm phí cấp 1 trước';
    if (this.isSalesGroup && !this.salesSubType) return 'Hãy chọn loại chi phí hàng bán';
    if (this.isAssignRequired && !this.selectedJobId) return 'Nhóm này bắt buộc chọn Lô hàng hoặc Công việc';
    return '';
  }

  // Điều kiện cho upload: chọn nhóm; nếu hàng bán phải chọn loại; nếu bắt buộc thì phải có Lô/CV.
  get canUpload(): boolean {
    if (!this.selectedGroupFeeCode) return false;
    if (this.isSalesGroup && !this.salesSubType) return false;
    if (this.isAssignRequired && !this.selectedJobId) return false;
    return true;
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
    if (this.isSalesGroup && !this.salesSubType) {
      this.notificationService.printErrorMessage('Vui lòng chọn loại chi phí hàng bán trước khi tải hóa đơn.');
      return;
    }
    if (this.isAssignRequired && !this.selectedJobId) {
      this.notificationService.printErrorMessage('Nhóm này bắt buộc chọn Lô hàng hoặc Công việc trước khi tải hóa đơn.');
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
      subFeeCode: null,                 // Cấp 2 đã ẩn khỏi modal này
      subFeeName: this.salesSubTypeLabel, // chỉ snapshot loại chi phí hàng bán (nếu có) để truy vết
      jobId: this.selectedJobId,
      shipmentId: this.selectedShipmentId,
      workflowId: this.selectedWorkflowId,
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
