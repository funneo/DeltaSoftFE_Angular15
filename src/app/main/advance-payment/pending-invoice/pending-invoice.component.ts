import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import {
  PendingInvoice,
  PendingInvoiceFilter,
  PendingInvoiceService
} from '@app/shared/services/pending-invoice.service';
import { ModalDocHoaDonComponent } from '@app/shared/components/advance-payment/modal-doc-hoa-don/modal-doc-hoa-don.component';

@Component({
  selector: 'app-pending-invoice',
  templateUrl: './pending-invoice.component.html',
  styleUrls: ['./pending-invoice.component.css']
})
export class PendingInvoiceComponent implements OnInit {
  list: PendingInvoice[] = [];
  totalRows = 0;
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  keyword = '';
  status: number | null = null;        // null = all
  busy: Subscription;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  _branchId: number;
  reExtractingId: number | null = null;
  viewModal = false;

  statusList = [
    { id: null, text: 'Tất cả' },
    { id: 0, text: 'Chờ TT' },
    { id: 1, text: 'Đã chọn cho Payment' },
  ];

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
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  loadData(): void {
    const filter: PendingInvoiceFilter = {
      branchId: this._branchId,
      status: this.status,
      fromDate: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      toDate: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      keyword: this.keyword,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };
    this.busy = this.service.getPaging(filter, this._branchId).subscribe((res: any) => {
      if (res.code == '200' || res.code == '201') {
        this.list = res.data ?? [];
        this.totalRows = this.list?.[0]?.totalRows ?? 0;
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
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
