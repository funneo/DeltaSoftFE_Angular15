import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalTransportOrderComponent } from '@app/shared/components/transports/modal-transport-order/modal-transport-order.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Employee, Profile, ResponseValue } from '@app/shared/models';
import { TransportOrder } from '@app/shared/models/transports/dispatchorders/transport-order.model';
import {
  AuthService, BranchService, EmployeeService,
  NotificationService, UtilityService
} from '@app/shared/services';
import { TransportOrderService } from '@app/shared/services/transports/transport-order.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transport-order',
  templateUrl: './transport-order.component.html',
  styleUrls: ['./transport-order.component.scss']
})
export class TransportOrderComponent implements OnInit {

  @ViewChild(ModalTransportOrderComponent, { static: false }) modal: ModalTransportOrderComponent;

  pageIndex = 1;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  busy: Subscription;

  list: TransportOrder[] = [];
  listFilter: TransportOrder[] = [];
  listBranch: Branch[] = [];
  listDriver: Employee[] = [];

  userLoged: Profile;
  branchId?: number;
  driverId?: number = 0;
  statusSelected = 0;
  filterColumns: { [key: string]: string } = {};
  adminPermission = false;
  _functionId = SystemContstants.DISPATCHORDER;

  statusArray = [
    { value: 0, text: 'Tất cả' },
    { value: 1, text: 'Khởi tạo' },
    { value: 2, text: 'Gửi lệnh' },
    { value: 3, text: 'Đã nhận' },
    { value: 4, text: 'Duyệt B1' },
    { value: 5, text: 'Duyệt B2' },
    { value: 6, text: 'Chờ chốt' },
    { value: 7, text: 'Đã chốt' },
    { value: 8, text: 'Từ chối' },
  ];
  dateTimeFields = ['createdDate'];

  public ngayBatDau: Date;
  public ngayKetThuc: Date;
  public dateOptions: any;

  constructor(
    private _service: TransportOrderService,
    private spinner: NgxSpinnerService,
    private _notif: NotificationService,
    private _utilityService: UtilityService,
    private _auth: AuthService,
    private branchService: BranchService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.userLoged = this._auth.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.isAdmin;

    const p = UtilityService.getLocalParams(this._functionId + '_TO');
    localStorage.removeItem(this._functionId + '_TO');

    if (p) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this.filterColumns = p.filterColumns || {};
      this.keyword = p.keyword || '';
      this.statusSelected = p.statusSelected || 0;
      this.pageIndex = p.pageIndex || 1;
    } else {
      this.ngayBatDau = new Date(moment().subtract(7, 'd').toString());
      this.ngayKetThuc = new Date(moment().endOf('month').hours(23).minutes(59).seconds(59).toString());
    }
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

    this.loadBranch();
    this.loadDriver();
    this.loadData();
  }

  loadBranch(): void {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res?.data) this.listBranch = res.data;
    });
  }

  loadDriver(): void {
    const params = new HttpParams().set('branchId', this.userLoged.branchId);
    this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listDriver = res?.code === '200' ? res.data : [];
    });
  }

  selectedDate(event: any): void {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.pageIndex = 1;
    this.loadData();
  }

  changedBranch(event: Branch): void {
    this.branchId = event?.id;
    this.loadDriver();
    this.pageIndex = 1;
    this.loadData();
  }

  changeDriver(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  loadData(): void {
    const tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    const denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('branchid', this.branchId?.toString() ?? '')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword', this.keyword);

    this.busy = this._service.getAll(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res?.code === '200' || res?.code === '201') {
        this.list = (res.data as TransportOrder[]).map(item => ({
          ...item,
          rStatus: this._getRStatus(item)
        }));
        this.filterData();
      } else if (res?.code === '204') {
        this.list = [];
        this.listFilter = [];
        this.totalRows = 0;
      } else {
        this._notif.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res?.code);
      }
    });
  }

  private _getRStatus(item: TransportOrder): string {
    if (item.isDeny) return 'Từ chối';
    switch (item.status) {
      case 0: return 'Khởi tạo';
      case 1: return 'Gửi lệnh';
      case 2: return 'Đã nhận';
      case 3: return 'Duyệt B1';
      case 4: return 'Duyệt B2';
      case 5: return 'Chờ chốt';
      case 6: return 'Đã chốt';
      default: return '';
    }
  }

  getStatusClass(item: TransportOrder): string {
    if (item.isDeny) return 'badge-status badge-deny';
    switch (item.status) {
      case 0: return 'badge-status badge-init';
      case 1: return 'badge-status badge-sent';
      case 2: return 'badge-status badge-received';
      case 3: return 'badge-status badge-b1';
      case 4: return 'badge-status badge-b2';
      case 5: return 'badge-status badge-waiting';
      case 6: return 'badge-status badge-closed';
      default: return 'badge-status badge-init';
    }
  }

  filterData(): void {
    let result = [...this.list];

    if (this.driverId) {
      result = result.filter(x => x.driverId === this.driverId);
    }

    if (this.statusSelected > 0) {
      result = result.filter(item => {
        switch (this.statusSelected) {
          case 1: return item.status === 0 && !item.isDeny;
          case 2: return item.status === 1 && !item.isDeny;
          case 3: return item.status === 2 && !item.isDeny;
          case 4: return item.status === 3 && !item.isDeny;
          case 5: return item.status === 4 && !item.isDeny;
          case 6: return item.status === 5 && !item.isDeny;
          case 7: return item.status === 6 && !item.isDeny;
          case 8: return item.isDeny === true;
          default: return true;
        }
      });
    }

    result = result.filter(item =>
      Object.keys(this.filterColumns).every(key => {
        const fv = this.filterColumns[key];
        if (!fv) return true;
        const filterVal = fv.toLowerCase();
        const itemVal = this.dateTimeFields.includes(key)
          ? (this.datepipe.transform(item[key], 'dd/MM/yyyy') ?? '').toLowerCase()
          : String(item[key] ?? '').toLowerCase();
        return itemVal.includes(filterVal);
      })
    );

    this.listFilter = result;
    this.totalRows = result.length;
    this.cdr.detectChanges();
  }

  get visibleData(): TransportOrder[] {
    const start = (this.pageIndex - 1) * 50;
    return this.listFilter.slice(start, start + 50);
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  clickRow(item: TransportOrder): void {
    item.checked = !item.checked;
    this._icheck();
  }

  checkAll(ev: any): void {
    this.listFilter.forEach(x => x.checked = ev.target.checked);
    this._icheck();
  }

  isAllChecked(): boolean {
    return this.listFilter?.length > 0 && this.listFilter.every(x => x.checked);
  }

  private _icheck(): void {
    const checks = this.listFilter.filter(x => x.checked);
    this.flagEdit = checks.length === 1;
    this.flagDelete = checks.length === 1 && checks[0].status === 0;
  }

  openEdit(id?: number): void {
    this._saveParams();
    const targetId = id ?? this.listFilter.find(x => x.checked)?.id;
    if (targetId) this.modal.edit(targetId);
  }

  deleteConfirm(): void {
    const item = this.listFilter.find(x => x.checked);
    if (!item) return;
    if (item.status > 0) {
      this._notif.printErrorMessage('Chỉ được xóa lệnh ở trạng thái Khởi tạo.');
      return;
    }
    this._notif.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this._service.delete(item.id).subscribe({
        next: (res: any) => {
          if (res?.code === '200' || res?.code === '201') {
            this._notif.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
            this.loadData();
          } else {
            this._notif.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res?.code);
          }
        },
        error: () => this._notif.printErrorMessage(MessageContstants.DELETE_ERR_MSG)
      })
    );
  }

  saveSuccess(): void {
    this.loadData();
  }

  private _saveParams(): void {
    UtilityService.setLocalParams({
      d1: this.ngayBatDau,
      d2: this.ngayKetThuc,
      filterColumns: this.filterColumns,
      keyword: this.keyword,
      statusSelected: this.statusSelected,
      pageIndex: this.pageIndex
    }, this._functionId + '_TO');
  }
}
