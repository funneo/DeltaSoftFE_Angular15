import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalGaragePaymentRequestComponent } from '@app/shared/components/accounting/modal-garage-payment-request/modal-garage-payment-request.component';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Profile, ResponseValue } from '@app/shared/models';
import { GaragePaymentRequest, GaragePaymentRequestGroup } from '@app/shared/models/accounting/garage-payment-request.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { GaragePaymentRequestService } from '@app/shared/services/accounting/garage-payment-request.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

// F051 — Thu chi yêu cầu Xưởng: Xưởng (Innvie) đẩy yêu cầu thu/chi qua API -> thủ quỹ tích 1..n yêu cầu
// CÙNG chiều + CÙNG chi nhánh -> viết 1 phiếu chi/thu (modal phiếu sẵn có, typeAccount=8).
// Load-all (pageSize=0) vì cần gom nhóm theo tên đối tượng + lọc cột phía client; số dòng chờ viết phiếu nhỏ.
@Component({
  selector: 'app-garage-payment-request',
  templateUrl: './garage-payment-request.component.html',
  styleUrls: ['./garage-payment-request.component.css']
})
export class GaragePaymentRequestComponent implements OnInit {
  keyword = '';
  list: GaragePaymentRequest[] = [];
  listGroup: GaragePaymentRequestGroup[] = [];
  totalRows = 0;
  totalAmount = 0;
  listBranch: Branch[] = [];
  branchId?: number;
  userLoged?: Profile;
  adminPermission = false;
  busy: Subscription;

  direction = 1; // 1 Chi | 0 Thu
  status = 0;    // 0 Chờ viết phiếu | 1 Đã viết phiếu | 2 Xưởng đã hủy | -1 Tất cả
  listStatus = [
    { id: 0, text: 'Chờ viết phiếu' },
    { id: 1, text: 'Đã viết phiếu' },
    { id: 2, text: 'Xưởng đã hủy' },
    { id: -1, text: 'Tất cả' }
  ];
  filterColumns: { [key: string]: string } = {};

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  viewModal = false;
  viewPhieuChi = false;
  viewPhieuThu = false;
  @ViewChild(ModalGaragePaymentRequestComponent, { static: false }) modalView: ModalGaragePaymentRequestComponent;
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent;
  @ViewChild(ModalPhieuThuComponent, { static: false }) modalPhieuThu: ModalPhieuThuComponent;

  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,
    private service: GaragePaymentRequestService, private authService: AuthService, private branchService: BranchService,
    public datepipe: DatePipe) { }

  ngOnInit(): void {
    this.userLoged = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.isAdmin;
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changeDirection(direction: number) {
    if (this.direction === direction) return;
    this.direction = direction;
    this.loadData();
  }

  changedBranch(event: Branch) {
    this.branchId = event?.id;
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  timKiem(): void {
    this.loadData();
  }

  loadData(): void {
    let params = new HttpParams()
      .set('pageIndex', '1')
      .set('pageSize', '0')
      .set('branchId', this.branchId?.toString() ?? '')
      .set('direction', this.direction.toString())
      .set('status', this.status >= 0 ? this.status.toString() : '')
      .set('keyword', this.keyword);
    // Hàng "Chờ viết phiếu" lấy hết, không lọc ngày (yêu cầu cũ chưa chi/thu vẫn phải hiện).
    if (this.status !== 0) {
      params = params
        .set('fromDate', moment(this.ngayBatDau).format('YYYYMMDD'))
        .set('toDate', moment(this.ngayKetThuc).format('YYYYMMDD'));
    }
    this.busy = this.service.getPaging(params).subscribe((res: ResponseValue<GaragePaymentRequest[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.list = res.data ?? [];
      }
      else if (res.code == '204') {
        this.list = [];
      }
      else {
        this.list = [];
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
      this.filter();
    });
  }

  // Lọc cột phía client rồi gom nhóm theo tên đối tượng (NCC/KH)
  filter() {
    const rows = this.list.filter(item => Object.keys(this.filterColumns).every(key => {
      const filterValue = this.filterColumns[key]?.toString().trim().toLowerCase();
      if (!filterValue) return true;
      const itemValue = (key === 'dueDate' || key === 'requestDate')
        ? this.datepipe.transform(item[key], 'dd/MM/yyyy')
        : item[key]?.toString();
      return itemValue?.toLowerCase().includes(filterValue);
    }));
    // Dòng bị lọc ẩn đi thì bỏ chọn, tránh viết phiếu cho dòng không nhìn thấy
    this.list.forEach(x => { if (!rows.includes(x)) x.checked = false; });

    const groups: { [name: string]: GaragePaymentRequestGroup } = {};
    this.listGroup = [];
    rows.forEach(item => {
      const name = (item.partnerName ?? '').trim();
      const key = name.toLowerCase();
      if (!groups[key]) {
        groups[key] = { partnerName: name, items: [], total: 0 };
        this.listGroup.push(groups[key]);
      }
      groups[key].items.push(item);
      groups[key].total += item.amount || 0;
    });
    this.listGroup.sort((a, b) => a.partnerName.localeCompare(b.partnerName, 'vi'));
    this.totalRows = rows.length;
    this.totalAmount = rows.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  get selected(): GaragePaymentRequest[] {
    return this.list.filter(x => x.checked);
  }

  get selectedAmount(): number {
    return this.selected.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  // Chỉ chọn được yêu cầu đang chờ viết phiếu, và mọi yêu cầu đã chọn phải cùng chi nhánh
  // (SP_Accounts_Create loại 8 chặn: chi nhánh phiếu = chi nhánh của mọi yêu cầu).
  private canCheck(item: GaragePaymentRequest, showMessage = true): boolean {
    if (item.status !== 0) return false;
    const first = this.selected.find(x => x !== item);
    if (first && first.branchId !== item.branchId) {
      if (showMessage)
        this.notificationService.printErrorMessage('Chỉ gom được các yêu cầu cùng chi nhánh vào một phiếu.');
      return false;
    }
    return true;
  }

  clickRow(event: MouseEvent, item: GaragePaymentRequest): void {
    if ((event.target as HTMLElement).closest('a')) return;
    if (item.checked) { item.checked = false; return; }
    if (this.canCheck(item)) item.checked = true;
  }

  clickGroup(group: GaragePaymentRequestGroup): void {
    const selectable = group.items.filter(x => x.status === 0);
    if (selectable.length === 0) return;
    const allChecked = selectable.every(x => x.checked);
    if (allChecked) { selectable.forEach(x => x.checked = false); return; }
    let skipped = false;
    selectable.forEach(x => {
      if (x.checked) return;
      if (this.canCheck(x, false)) x.checked = true; else skipped = true;
    });
    if (skipped)
      this.notificationService.printErrorMessage('Chỉ gom được các yêu cầu cùng chi nhánh vào một phiếu.');
  }

  isGroupChecked(group: GaragePaymentRequestGroup): boolean {
    const selectable = group.items.filter(x => x.status === 0);
    return selectable.length > 0 && selectable.every(x => x.checked);
  }

  requestTypeText(type: number): string {
    switch (type) {
      case 1: return 'Trả trước';
      case 2: return 'Trả sau';
      case 3: return 'Trả trước';
      case 4: return 'Trả sau';
      default: return '';
    }
  }

  statusText(status: number): string {
    return this.listStatus.find(x => x.id === status)?.text ?? '';
  }

  showDetail(item: GaragePaymentRequest) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalView.show(item.id);
    }, 50);
  }

  view() {
    const rows = this.selected;
    if (rows.length === 1) this.showDetail(rows[0]);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  // Lập 1 phiếu chi/thu cho các yêu cầu đã chọn. Số tiền = tổng các yêu cầu (modal khóa ô số tiền);
  // SP_Accounts_Create loại 8 đánh dấu "Đã viết phiếu" trong CÙNG transaction + chặn viết trùng.
  createAccount() {
    const rows = this.selected;
    if (rows.length === 0) return;
    const partnerNames = Array.from(new Set(rows.map(x => (x.partnerName ?? '').trim())));
    const item: any = {
      typeAccount: 8,
      garageRequestIds: rows.map(x => x.id).join(','),
      branchId: rows[0].branchId,
      groupType: this.direction === 1 ? 3 : 2, // Chi -> Nhà cung cấp; Thu -> Khách hàng (thủ quỹ đổi được)
      amount: this.selectedAmount,
      refNo: rows.map(x => x.externalRefNo).join(', ').substring(0, 128),
      notes: rows.map(x => x.contents).join('; ').substring(0, 400),
      represent: partnerNames.join(', ').substring(0, 256)
    };
    if (this.direction === 1) {
      this.viewPhieuChi = true;
      setTimeout(() => {
        this.modalPhieuChi.add(item);
      }, 50);
    }
    else {
      this.viewPhieuThu = true;
      setTimeout(() => {
        this.modalPhieuThu.add(item);
      }, 50);
    }
  }

  saveSuccessAccounts(event: any): void {
    // Phiếu + trạng thái "Đã viết phiếu" đã lưu cùng lúc ở SP -> chỉ cần tải lại danh sách.
    if (event > 0) {
      this.loadData();
    }
  }

  closePhieuChi(): void {
    this.viewPhieuChi = false;
  }

  closePhieuThu(): void {
    this.viewPhieuThu = false;
  }
}
