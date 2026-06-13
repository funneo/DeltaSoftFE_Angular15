import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { MessageContstants } from '@app/shared/constants';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import {
  PendingInvoice,
  PendingInvoiceFilter,
  PendingInvoiceService
} from '@app/shared/services/pending-invoice.service';
import { ModalDocHoaDonComponent } from '@app/shared/components/advance-payment/modal-doc-hoa-don/modal-doc-hoa-don.component';

interface PendingInvoiceGroup {
  code: string;            // groupFeeCode ('' = chưa phân loại)
  name: string;            // groupFeeName để hiển thị
  items: PendingInvoice[];
  expanded: boolean;
}

@Component({
  selector: 'app-pending-invoice',
  templateUrl: './pending-invoice.component.html',
  styleUrls: ['./pending-invoice.component.css']
})
export class PendingInvoiceComponent implements OnInit {
  allRows: PendingInvoice[] = [];      // toàn bộ hóa đơn theo khoảng ngày (load-all)
  groups: PendingInvoiceGroup[] = [];  // đã group theo GroupFeeCode cho tab hiện tại
  activeTab: 1 | 2 = 1;                // 1 = Chờ TT, 2 = Bị từ chối (trùng)
  keyword = '';
  busy: Subscription;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  _branchId: number;
  reExtractingId: number | null = null;
  viewModal = false;

  private expandedCodes = new Set<string>();   // giữ trạng thái mở/đóng khi reload

  @ViewChild(ModalDocHoaDonComponent, { static: false }) modalDocHoaDon: ModalDocHoaDonComponent;

  constructor(
    private service: PendingInvoiceService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private authService: AuthService,
  ) {
    const user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user?.branchId);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().subtract(30, 'd').startOf('day').toString());
    this.ngayKetThuc = new Date(moment().endOf('day').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
  }

  selectedDate(event: any) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  timKiem(): void {
    this.loadData();
  }

  setTab(tab: 1 | 2): void {
    this.activeTab = tab;
    this.buildGroups();
  }

  loadData(): void {
    // Load-all theo khoảng ngày (status null) → tách 2 tab + group client-side.
    const filter: PendingInvoiceFilter = {
      branchId: this._branchId,
      status: null,
      fromDate: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      toDate: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      keyword: this.keyword,
      pageIndex: 1,
      pageSize: 99999,
    };
    this.busy = this.service.getPaging(filter, this._branchId).subscribe((res: any) => {
      if (res.code == '200' || res.code == '201') {
        this.allRows = Array.isArray(res.data) ? res.data : [];
        this.buildGroups();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  /** Hóa đơn thuộc tab Chờ TT: status=0, không trùng, chưa dùng cho Payment. */
  private isPending(r: PendingInvoice): boolean {
    return r.status === 0 && !r.isDuplicate && !r.usedByPaymentId;
  }
  /** Hóa đơn thuộc tab Bị từ chối: trùng, chưa dùng, chưa xóa. */
  private isRejected(r: PendingInvoice): boolean {
    return !!r.isDuplicate && !r.usedByPaymentId && r.status !== -1;
  }

  get tab1Count(): number { return this.allRows.filter(r => this.isPending(r)).length; }
  get tab2Count(): number { return this.allRows.filter(r => this.isRejected(r)).length; }

  /** Group hóa đơn của tab hiện tại theo GroupFeeCode. */
  buildGroups(): void {
    const rows = this.allRows.filter(r => this.activeTab === 1 ? this.isPending(r) : this.isRejected(r));
    const map = new Map<string, PendingInvoiceGroup>();
    for (const r of rows) {
      const code = (r.groupFeeCode || '').trim();
      let g = map.get(code);
      if (!g) {
        g = {
          code,
          name: r.groupFeeName || (code ? code : 'Chưa phân loại'),
          items: [],
          expanded: this.expandedCodes.size === 0 ? true : this.expandedCodes.has(code),
        };
        map.set(code, g);
      }
      g.items.push(r);
    }
    // Sort: nhóm có code trước (theo code), 'Chưa phân loại' xuống cuối.
    this.groups = Array.from(map.values()).sort((a, b) => {
      if (!a.code) return 1;
      if (!b.code) return -1;
      return a.code.localeCompare(b.code);
    });
  }

  toggleGroup(g: PendingInvoiceGroup): void {
    g.expanded = !g.expanded;
    if (g.expanded) this.expandedCodes.add(g.code);
    else this.expandedCodes.delete(g.code);
  }

  openModalDoc() {
    this.viewModal = true;
    setTimeout(() => this.modalDocHoaDon?.show(), 50);
  }

  onModalDocClose() {
    this.viewModal = false;
  }

  onModalDocSaved() {
    // Sau khi modal lưu xong → reload list.
    this.viewModal = false;
    this.loadData();
  }

  reExtract(item: PendingInvoice) {
    this.notificationService.printConfirmationDialog(
      `Đọc lại Gemini cho hóa đơn "${item.fileName ?? item.invoiceNo}"? Dữ liệu hiện tại sẽ bị ghi đè.`,
      () => {
        this.reExtractingId = item.id;
        this.service.reExtract(item.id).subscribe(
          (res: any) => {
            this.reExtractingId = null;
            if (res.code == '200' || res.code == '201') {
              this.notificationService.printSuccessMessage('Đã đọc lại xong.');
              this.loadData();
            } else {
              this.notificationService.printErrorMessage('Đọc lại lỗi: ' + (res.message ?? ''));
            }
          },
          (err) => {
            this.reExtractingId = null;
            this.notificationService.printErrorMessage('Đọc lại lỗi: ' + (err?.message ?? err));
          }
        );
      }
    );
  }

  deleteConfirm(item: PendingInvoice) {
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(item.id)
    );
  }

  delete(id: number) {
    this.service.delete(id).subscribe(
      (res: any) => {
        if (res.code == '200' || res.code == '201') this.loadData();
        else this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
      },
      (err) => this.notificationService.printErrorMessage('Xóa lỗi: ' + (err?.message ?? err))
    );
  }

  /** Parse JSON lineItems để show count. */
  countLineItems(json: string | undefined | null): number {
    if (!json) return 0;
    try { const arr = JSON.parse(json); return Array.isArray(arr) ? arr.length : 0; } catch { return 0; }
  }

  /** Parse duplicatesJson → list refNo Payment trùng, tooltip-friendly. */
  parseDuplicates(json: string | undefined | null): { paymentRefNo: string; paymentRefDate?: string }[] {
    if (!json) return [];
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  dupTooltip(item: PendingInvoice): string {
    const list = this.parseDuplicates(item.duplicatesJson);
    if (list.length === 0) return '';
    return 'Trùng với Payment: ' + list.map(d => d.paymentRefNo + (d.paymentRefDate ? ' (' + d.paymentRefDate + ')' : '')).join(', ');
  }

  /** Build URL local cho thẻ <a> tải file gốc. PathFileLocal có dạng "~/UploadFiles/Invoice/2026/06/abc.pdf". */
  buildFileUrl(path: string): string {
    if (!path) return '';
    return path.replace(/^~\//, '/');
  }
}
