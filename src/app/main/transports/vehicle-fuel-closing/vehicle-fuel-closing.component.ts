import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { Vihicle } from '@app/shared/models/vihicle';
import { DriverFuelClosing } from '@app/shared/models/transports/driver-fuel-closing.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { DriverFuelClosingService } from '@app/shared/services/transports/driver-fuel-closing.service';
import { ModalVehicleFuelClosingComponent } from '@app/shared/components/transports/modal-vehicle-fuel-closing/modal-vehicle-fuel-closing.component';
import { MessageContstants } from '@app/shared/constants';

@Component({
  selector: 'vehicle-fuel-closing',
  templateUrl: './vehicle-fuel-closing.component.html',
  styleUrls: ['./vehicle-fuel-closing.component.css']
})
export class VehicleFuelClosingComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  keyword = '';
  list: DriverFuelClosing[] = [];        // dữ liệu trang hiện tại (server-paging)
  listFilter: DriverFuelClosing[] = [];  // sau khi áp bộ lọc cột (client-side)
  listBranch: Branch[] = [];

  // Lọc theo cột (hàng filter dưới header) — chỉ lọc trong TRANG đang tải,
  // vì list dùng server-paging. Muốn tìm xuyên trang thì dùng ô "Từ khóa" ở header.
  fRefNo = '';
  fPlate = '';
  fDriver = '';
  fReason = '';
  fStatus = '';
  fCreator = '';

  // Lý do chốt là enum FE (khớp closeReasons trong modal-vehicle-fuel-closing) — SP chỉ trả số.
  closeReasons = [
    { value: 1, text: 'Cuối tháng' },
    { value: 2, text: 'Tài nghỉ giữa kỳ' },
    { value: 3, text: 'Đổi xe' },
    { value: 9, text: 'Khác' }
  ];
  listVihicle: Vihicle[] = [];
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  branchId?: number;
  vihicleId: number = 0;
  status: number = 0; // 0=Tất cả, 1=Nháp(0), 2=Đã duyệt(1)
  statuses = [
    { value: 0, text: 'Tất cả' },
    { value: 1, text: 'Nháp' },
    { value: 2, text: 'Đã duyệt' }
  ];
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions: any;
  adminPermission = false;
  flagEdit = false;    // nút Sửa   — bật khi dòng chọn là của mình + còn nháp
  flagDelete = false;  // nút Xóa   — như trên
  flagView = false;    // nút Xem   — bật khi có dòng được chọn

  @ViewChild(ModalVehicleFuelClosingComponent, { static: false }) modalAddEdit: ModalVehicleFuelClosingComponent;

  constructor(
    private _utilityService: UtilityService,
    private _authService: AuthService,
    private notificationService: NotificationService,
    private branchService: BranchService,
    private vihicleService: VihicleService,
    private service: DriverFuelClosingService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.isAdmin;
    this.ngayBatDau = new Date(moment().startOf('month').toString());
    this.ngayKetThuc = new Date(moment().endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadBranch();
    this.loadVihicle();
    this.loadData();
  }

  loadBranch() {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == '200' || res.code == '201') this.listBranch = res.data ?? [];
    });
  }

  loadVihicle() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', '0');
    this.busy = this.vihicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') this.listVihicle = res.data ?? [];
    });
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  changedBranch(event: Branch) {
    this.branchId = event?.id;
    this.loadData();
  }

  changedVihicle(event: Vihicle) {
    this.vihicleId = event?.id ?? 0;
    this.loadData();
  }

  changedStatus() {
    this.loadData();
  }

  loadData(): void {
    const tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    const denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    let statusValue = 0;
    if (this.status === 1) statusValue = 0; // Nháp = Status 0
    else if (this.status === 2) statusValue = 1; // Đã duyệt = Status 1
    let params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid', this.branchId?.toString() ?? '0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword', this.keyword);
    if (this.vihicleId > 0) params = params.set('vihicleId', this.vihicleId.toString());
    if (this.status > 0) params = params.set('status', (statusValue + 1).toString()); // tValue dùng 0=null, nên +1

    this.busy = this.service.getPaging(params).subscribe((res: ResponseValue<DriverFuelClosing[] | Pagination<DriverFuelClosing>>) => {
      this.flagEdit = this.flagDelete = this.flagView = false;   // reload → bỏ chọn dòng
      if (res.code == '200' || res.code == '201') {
        const items: any = res.data;
        this.list = Array.isArray(items) ? items : (items?.items ?? []);
        this.totalRows = this.list.length > 0 ? (this.list[0] as any).totalRows ?? this.list.length : 0;
        this.filter();
      } else if (res.code == '204') {
        this.list = []; this.totalRows = 0; this.filter();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  closeReasonText(h: DriverFuelClosing): string {
    return this.closeReasons.find(x => x.value === h?.closeReason)?.text ?? '';
  }

  private statusText(h: DriverFuelClosing): string {
    if (h?.status === 0) return 'Nháp';
    if (h?.status === 1) return 'Đã duyệt';
    return '';
  }

  /** Lọc theo cột — client-side trên trang đang tải. */
  filter(): void {
    const has = (v: string) => (v ?? '').trim().length > 0;
    const like = (val: any, q: string) => (val ?? '').toString().toLowerCase().includes(q.trim().toLowerCase());
    let rows = this.list ?? [];
    if (has(this.fRefNo))   rows = rows.filter(h => like(h.refNo, this.fRefNo));
    if (has(this.fPlate))   rows = rows.filter(h => like(h.vihicleLicensePlate, this.fPlate));
    if (has(this.fDriver))  rows = rows.filter(h => like(h.driverName, this.fDriver));
    if (has(this.fReason))  rows = rows.filter(h => like(this.closeReasonText(h), this.fReason));
    if (has(this.fStatus))  rows = rows.filter(h => like(this.statusText(h), this.fStatus));
    if (has(this.fCreator)) rows = rows.filter(h => like(h.createdByName, this.fCreator));
    this.listFilter = rows;
  }

  timKiem(): void { this.pageIndex = 1; this.loadData(); }

  pageChanged(event: PageChangedEvent): void { this.pageIndex = event.page; this.loadData(); }

  private isOwner(h: DriverFuelClosing): boolean {
    if (!h?.createdBy || !this.userLoged?.id) return false;
    return (h.createdBy + '').toLowerCase() === (this.userLoged.id + '').toLowerCase();
  }

  // Chủ tạo HOẶC Admin sửa/xóa được — nhưng CHỈ khi phiếu còn nháp
  // (phiếu đã duyệt bị chặn ở tầng DB: SP_..._Update/_Delete RAISERROR "Phiếu đã chốt").
  canEdit(h: DriverFuelClosing): boolean {
    return (this.isOwner(h) || this.adminPermission) && h?.status === 0;
  }

  canDelete(h: DriverFuelClosing): boolean {
    return (this.isOwner(h) || this.adminPermission) && h?.status === 0;
  }

  /** Chọn 1 dòng (bỏ chọn các dòng khác) — pattern shipment-normal. */
  clickRow(item: DriverFuelClosing): void {
    (item as any).checked = !(item as any).checked;
    (this.list ?? []).forEach(x => { if (x !== item) (x as any).checked = false; });
    this.icheck();
  }

  /** Gate nút toolbar theo dòng đang chọn: Sửa/Xóa chỉ cho CHỦ TẠO + phiếu NHÁP. */
  private icheck(): void {
    const sel = this.selected();
    this.flagView = !!sel;
    this.flagEdit = !!sel && this.canEdit(sel);
    this.flagDelete = !!sel && this.canDelete(sel);
  }

  private selected(): DriverFuelClosing | null {
    return (this.list ?? []).find(x => (x as any).checked) ?? null;
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => this.modalAddEdit?.add(), 50);
  }

  /** Sửa (flagXem=false) / Xem (flagXem=true) dòng đang chọn. */
  edit(flagXem: boolean): void {
    const item = this.selected();
    if (!item?.id) return;
    if (!flagXem && !this.canEdit(item)) return;
    this.viewModal = true;
    setTimeout(() => this.modalAddEdit?.edit(item.id, flagXem), 50);
  }

  deleteConfirm(): void {
    const item = this.selected();
    if (!item || !this.canDelete(item)) return;
    this.notificationService.printConfirmationDialog(
      `Xóa phiếu ${item.refNo}?`,
      () => {
        this.busy = this.service.delete(item.id).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.notificationService.printSuccessMessage('Đã xóa phiếu.');
            this.loadData();
          } else {
            this.notificationService.printErrorMessage(res.message ?? 'Xóa thất bại.');
          }
        });
      }
    );
  }

  saveSuccess(): void {
    this.viewModal = false;
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
}
