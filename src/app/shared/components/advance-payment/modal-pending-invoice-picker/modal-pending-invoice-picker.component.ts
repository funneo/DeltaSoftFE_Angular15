import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageContstants } from '@app/shared/constants';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import {
  PendingInvoicePickerFilter,
  PendingInvoicePickerItem,
  PendingInvoiceService
} from '@app/shared/services/pending-invoice.service';

@Component({
  selector: 'modal-pending-invoice-picker',
  templateUrl: './modal-pending-invoice-picker.component.html',
  styleUrls: ['./modal-pending-invoice-picker.component.css']
})
export class ModalPendingInvoicePickerComponent implements OnInit {
  list: PendingInvoicePickerItem[] = [];
  filtered: PendingInvoicePickerItem[] = [];
  busy: Subscription;
  branchId?: number;
  keyword = '';
  groupFeeCode: string = null;     // parent (PaymentDetail) set trước khi show() — lọc theo nhóm phí cấp 1
  ngayBatDau: Date;
  ngayKetThuc: Date;
  dateOptions: any;

  // local filter cột
  fVendor = '';
  fTax = '';
  fInvoiceNo = '';
  fInvoiceDate = '';

  @Output() SaveSuccess = new EventEmitter<PendingInvoicePickerItem[]>();
  @Output() CloseModal = new EventEmitter<any>();
  @ViewChild('modalPicker', { static: false }) modalPicker: ModalDirective;

  constructor(
    private service: PendingInvoiceService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private authService: AuthService,
  ) {
    const user = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(user?.branchId);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().subtract(60, 'd').startOf('day').toString());
    this.ngayKetThuc = new Date(moment().endOf('day').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  }

  show() {
    this.loadData();
    this.modalPicker?.show();
  }

  selectedDate(event: any) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadData() {
    const filter: PendingInvoicePickerFilter = {
      branchId: this.branchId,
      keyword: this.keyword,
      fromDate: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      toDate: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      groupFeeCode: this.groupFeeCode,
    };
    this.busy = this.service.getForPicker(filter, this.branchId).subscribe(
      (res: any) => {
        if (res.code == '200' || res.code == '201') {
          this.list = (res.data ?? []).map((x: PendingInvoicePickerItem) => ({ ...x, checked: false }));
          this.applyColumnFilter();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      },
      err => this.notificationService.printErrorMessage('Lỗi tải dữ liệu: ' + (err?.message ?? err))
    );
  }

  applyColumnFilter() {
    this.filtered = this.list.filter(x =>
      (!this.fVendor      || (x.vendorName ?? '').toLowerCase().includes(this.fVendor.toLowerCase())) &&
      (!this.fTax         || (x.taxNumber ?? '').toLowerCase().includes(this.fTax.toLowerCase())) &&
      (!this.fInvoiceNo   || (x.invoiceNo ?? '').toLowerCase().includes(this.fInvoiceNo.toLowerCase())) &&
      (!this.fInvoiceDate || (x.invoiceDate ?? '').toLowerCase().includes(this.fInvoiceDate.toLowerCase()))
    );
  }

  timKiem() { this.loadData(); }

  toggleAll(checked: boolean) {
    this.filtered.forEach(x => x.checked = checked);
  }

  /**
   * Single source of truth: chỉ row handler toggle.
   * - Checkbox: [checked] one-way + (click) preventDefault → KHÔNG tự toggle, chờ row click.
   * - Link <a> mở file: target check skip → mở tab mới mà không toggle.
   * - Cell khác (kể cả ô chứa checkbox): row click → toggle 1 lần.
   */
  onRowClick(event: MouseEvent, item: PendingInvoicePickerItem) {
    const target = event.target as HTMLElement;
    if (target.closest('a')) return;   // click vào link file: không toggle
    item.checked = !item.checked;
  }

  get selectedCount(): number { return this.filtered.filter(x => x.checked).length; }

  parseDuplicates(json: string | undefined): { paymentRefNo: string; paymentRefDate?: string }[] {
    if (!json) return [];
    try { const arr = JSON.parse(json); return Array.isArray(arr) ? arr : []; } catch { return []; }
  }
  dupTooltip(item: PendingInvoicePickerItem): string {
    const arr = this.parseDuplicates(item.duplicatesJson);
    if (arr.length === 0) return '';
    return 'Trùng với Payment: ' + arr.map(d => d.paymentRefNo + (d.paymentRefDate ? ' (' + d.paymentRefDate + ')' : '')).join(', ');
  }

  buildFileUrl(path: string): string {
    if (!path) return '';
    return path.replace(/^~\//, '/');
  }

  accept() {
    const selected = this.list.filter(x => x.checked);
    if (selected.length === 0) {
      this.notificationService.printAlert('THÔNG BÁO', 'Chưa chọn hóa đơn nào!');
      return;
    }
    this.modalPicker?.hide();
    this.SaveSuccess.emit(selected);
  }

  cancel() { this.modalPicker?.hide(); }

  OnHidden() { this.CloseModal.emit(); }
}
