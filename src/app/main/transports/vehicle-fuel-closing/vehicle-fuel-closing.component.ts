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
  list: DriverFuelClosing[] = [];
  listBranch: Branch[] = [];
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
      if (res.code == '200' || res.code == '201') {
        const items: any = res.data;
        this.list = Array.isArray(items) ? items : (items?.items ?? []);
        this.totalRows = this.list.length > 0 ? (this.list[0] as any).totalRows ?? this.list.length : 0;
      } else if (res.code == '204') {
        this.list = []; this.totalRows = 0;
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  timKiem(): void { this.pageIndex = 1; this.loadData(); }

  pageChanged(event: PageChangedEvent): void { this.pageIndex = event.page; this.loadData(); }

  private isOwner(h: DriverFuelClosing): boolean {
    if (!h?.createdBy || !this.userLoged?.id) return false;
    return (h.createdBy + '').toLowerCase() === (this.userLoged.id + '').toLowerCase();
  }

  canEdit(h: DriverFuelClosing): boolean {
    return this.isOwner(h) && h?.status === 0;
  }

  canDelete(h: DriverFuelClosing): boolean {
    return this.isOwner(h) && h?.status === 0;
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => this.modalAddEdit?.add(), 50);
  }

  openEdit(item: DriverFuelClosing, flagXem: boolean): void {
    if (!item?.id) return;
    this.viewModal = true;
    setTimeout(() => this.modalAddEdit?.edit(item.id, flagXem), 50);
  }

  deleteOne(item: DriverFuelClosing): void {
    if (!this.canDelete(item)) return;
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
