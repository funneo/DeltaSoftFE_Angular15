import { Status } from './../../../../shared/pipes/status.pipe';
import { Report01 } from './../../../../shared/models/transports/report01.model';
import { EmployeeService } from './../../../../shared/services/employee.service';
import { Employee } from './../../../../shared/models/employee.model';
import { DispatchOrderFeeExport } from './../../../../shared/models/transports/exports/dispatch-order-fee-export.model';
import { listContants } from './../../../../shared/constants/list-type.constants';
import { DispatchOrderExport } from './../../../../shared/models/transports/exports/dispatch-order-export.model';

import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalChangedDriverComponent } from '@app/shared/components/transports/modal-changed-driver/modal-changed-driver.component';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { ExportService } from '@app/shared/services/export-excel.service';
import { ModalDispatchOrderAdditionalFeeComponent } from '@app/shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.component';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ModalPhieuChiLenhComponent } from '@app/shared/components/accounting/modal-phieu-chi-lenh/modal-phieu-chi-lenh.component';
@Component({
  selector: 'app-dispatchorder',
  templateUrl: './dispatchorder.component.html',
  styleUrls: ['./dispatchorder.component.css']
})
export class DispatchorderComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDispatchorder: Dispatchorder[];
  listFilter: Dispatchorder[];
  listBranch: Branch[];
  //Biến kiểm tra quyền thu chi để thêm chi phí cung đường cho lệnh
  account_permission: boolean = false;
  listDriver: Employee[] = [];
  userLoged?: Profile;
  branchId?: number;
  busy: Subscription;
  viewModal = false;
  viewModalChangedDriver = false;
  adminPermission = false;
  _accept = false;
  driverId?: number = 0;
  viewAddFee = false;
  _functionId = SystemContstants.DISPATCHORDER;

  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Khởi tạo" }, { "value": 2, "text": 'Chưa nhận' }, { "value": 3, "text": 'Đã nhận' }, { "value": 4, "text": 'Thực hiện' }, { "value": 5, "text": 'Hoàn thành' }, { "value": 6, "text": 'Duyệt B1' }, { "value": 7, "text": 'Chốt lệnh' }, { "value": 8, "text": 'Dừng lệnh' }];

  refNoSearch?: String;
  ngaySearch?: String;
  nguoilapSearch?: String;
  referCodeSearch?: String;
  nccSearch?: String;
  bksSearch?: String;
  laixeSearch?: String;
  toantuyenSearch?: String;
  kmSearch?: String;
  kmdauSearch?: String;
  kmcuoiSearch?: String;
  sumSearch?: String;
  contsealSearch?: String;
  ghichuSearch?: String;
  tinhtrang?: number = 0;
  contTypeSearch = '';

  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent
  @ViewChild(ModalChangedDriverComponent, { static: false }) modaChangedDriver: ModalChangedDriverComponent
  @ViewChild(ModalDispatchOrderAdditionalFeeComponent, { static: false }) modalFeeAddEdit: ModalDispatchOrderAdditionalFeeComponent
  @ViewChild(ModalPhieuChiLenhComponent, { static: false }) modalPayment: ModalPhieuChiLenhComponent;
  viewModalPayment = false;
  constructor(private dispatchOrderService: DispatchordersService, private spinner: NgxSpinnerService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    , private _authService: AuthService, public datepipe: DatePipe
    , private branchService: BranchService
    , private exportService: ExportService
    , private employeeService: EmployeeService, private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.loadDriver();
    this.adminPermission = this.userLoged.roles.indexOf('Admin') > -1;
    this._accept = this._authService.hasPermission('DISPATCHORDER_ACCEPT');
    const permiss: string[] = typeof (this.userLoged.permissions) == "string" ? JSON.parse(this.userLoged.permissions) : this.userLoged.permissions;
    this.account_permission = permiss.findIndex(x => x === 'DISPATCHORDER_ACCOUNT') != -1;

    var p = UtilityService.getLocalParams(this._functionId);
    localStorage.removeItem(this._functionId);
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this.driverId = p.driverId;
      this.branchId = p.branchId;
      this.pageIndex = p.pagdindex;
      this.refNoSearch = p.refNoSearch;
      this.nguoilapSearch = p.nguoilapSearch;
      this.referCodeSearch = p.referCodeSearch;
      this.ngaySearch = p.ngaySearch;
      this.nccSearch = p.nccSearch;
      this.bksSearch = p.bksSearch;
      this.laixeSearch = p.laixeSearch;
      this.toantuyenSearch = p.toantuyenSearch;
      this.contsealSearch = p.contsealSearch;
      this.ghichuSearch = p.ghichuSearch;
      this.tinhtrang = p.tinhtrang;
      this.keyword = p.keyword;
    }
    else {
      this.ngayBatDau = new Date(moment().subtract(7, 'd').toString());
      this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
      this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
      //this.loadCustomer();
    }
    this.loadData();
    this.loadBranch();
  }

  loadDriver(): void {
    const params = new HttpParams()
      .set('branchId', this.userLoged.branchId)
    this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDriver = res.data;
      }
      else {
        if (res.code == '204') {
          this.listDriver = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }


  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  export(type: number) {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid', this.branchId?.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('type', type.toString())
    this.busy = this.dispatchOrderService.getExport(params).subscribe((res: ResponseValue<DispatchOrderFeeExport[]>) => {
      if (res.code == '200' || res.code == '201') {
        let exelList: DispatchOrderFeeExport[];
        exelList = res.data;
        let printList = exelList.map(({ workflowId, maphi, tenmaphi, soluong,
          tien, vat, tongtien, ...item }) => item);
        this.exportService.exportExcel(printList, 'lenhvanchuyen');
      }
      else {
        if (res.code == '204') {
          this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE)
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }
  changeDriver() {
    this.pageIndex = 1;
    this.loadData();
  }

  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('pageIndex', (this.pageIndex ?? 1).toString())
      .set('pageSize', '9999')
      .set('branchid', this.branchId?.toString())
      .set('driverid', this.driverId ? this.driverId.toString() : '0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword', this.keyword)
      .set('type', '0')
    // .set('usergroupid')
    this.busy = this.dispatchOrderService.getPaging(params).subscribe((res: ResponseValue<Pagination<Dispatchorder>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDispatchorder = res.data?.items;
        this.filter();
        this.spinner.hide();
      }
      else {
        if (res.code == '204') {
          this.listDispatchorder = [];
          this.totalRows = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        this.spinner.hide();
      }
    });
  }
  filter() {
    this.listFilter = Object.assign([], this.listDispatchorder);
    this.cdr.detectChanges();
    if (this.tinhtrang > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.tinhtrang == 1 ? data.status == 0 :
          this.tinhtrang == 2 ? data.status == 1 :
            this.tinhtrang == 3 ? data.status == 2 :
              this.tinhtrang == 4 ? data.status == 3 && data.finished == false :
                this.tinhtrang == 5 ? data.status == 3 && data.finished == true :
                  this.tinhtrang == 6 ? data.status == 5 :
                    this.tinhtrang == 7 ? data.status == 6 : (data.status == 4 || data.status == 7)
          ;
      });
    }
    if (this.refNoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo.toString().toLowerCase().includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode?.toLowerCase().includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });
    if (this.nccSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.shippingUnitName?.toString().toLowerCase().includes(this.nccSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.bksSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.vihiclelLicensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
      });
    if (this.laixeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.driverName?.toLowerCase().includes(this.laixeSearch.trim().toLocaleLowerCase());
      });
    if (this.toantuyenSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.fullRoute?.toLowerCase().includes(this.toantuyenSearch.trim().toLocaleLowerCase());
      });
    if (this.kmSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.kmQuota?.toString().toLowerCase().includes(this.kmSearch.trim().toLocaleLowerCase());
      });
    if (this.kmdauSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.startVehicleOdor?.toString().toLowerCase().includes(this.kmdauSearch.trim().toLocaleLowerCase());
      });
    if (this.kmcuoiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.finishVehicleOdor?.toString().toLowerCase().includes(this.kmcuoiSearch.trim().toLocaleLowerCase());
      });
    if (this.sumSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.dispatchSummarize?.toLowerCase().includes(this.sumSearch.trim().toLocaleLowerCase());
      });
    if (this.contsealSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.documentNumber?.toLowerCase().includes(this.contsealSearch.trim().toLocaleLowerCase());
      });
    this.totalRows = this.listFilter.length;
  }

  clickRow(item: Dispatchorder): void {
    item.checked = !item.checked;
    this.listDispatchorder.forEach(it => {
      if (it != item) it.checked = false;
    })
    this.icheck();
  }
  newAdditionalFee(item: Dispatchorder) {
    this.viewAddFee = true;
    setTimeout(() => {
      this.modalFeeAddEdit.add(item.refNo);
    }, 50);
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  changedBranch(event: Branch) {
    this.branchId = event?.id;
    this.loadDriver();
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.add();
    }, 50);
  }
  changedDriver(item: Dispatchorder) {
    this.viewModalChangedDriver = true;
    setTimeout(() => {
      this.modaChangedDriver.assigning(item.refNo);
    }, 50);
  }

  edit(flag: boolean, refNo: string = null): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      driverId: this.driverId,
      branchId: this.branchId,
      refNoSearch: this.refNoSearch,
      nguoilapSearch: this.nguoilapSearch,
      ngaySearch: this.ngaySearch,
      nccSearch: this.nccSearch,
      bksSearch: this.bksSearch,
      laixeSearch: this.laixeSearch,
      toantuyenSearch: this.toantuyenSearch,
      contsealSearch: this.contsealSearch,
      ghichuSearch: this.ghichuSearch,
      tinhtrang: this.tinhtrang,
      keyword: this.keyword,
      pageinex: this.pageIndex,
    }
    UtilityService.setLocalParams(p, this._functionId);
    let selectedRefNo = refNo;

    if (!selectedRefNo) {
      const index = this.listDispatchorder.findIndex(x => x.checked);
      if (index >= 0) {
        selectedRefNo = this.listDispatchorder[index].refNo;
      }
    }

    if (selectedRefNo) {
      this.viewModal = true;
      flag = flag;//|| (this.listDispatchorder[index].createdBy!=this.userLoged.id);
      setTimeout(() => {
        this.modalDispatchOrderAddEdit.edit(selectedRefNo, flag);
      }, 50);
    }
  }

  deleteConfirm(): void {
    let index = this.listDispatchorder.findIndex(x => x.checked);
    if (index >= 0) {
      if (this.listDispatchorder[index].status > 0) {
        this.notificationService.printErrorMessage(MessageContstants.CANNOT_DELETE_DISPATCHORDER)
        return;
      } else {
        this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(this.listDispatchorder[index].refNo));
      }
    }
  }

  delete(refNo: string): void {
    this.dispatchOrderService.delete(refNo).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listDispatchorder.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listDispatchorder)
      return this.listDispatchorder.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listDispatchorder.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }


  saveSuccess(): void {
    this.loadData();
  }

  savePaymentSuccess(): void {
    this.loadData();
  }
  closeModal(): void {
    this.viewModal = false;
  }

  saveChangeSuccess(): void {
    this.loadData();
  }
  saveFeeSuccess(): void {
    this.loadData();
  }

  closeChangeModal(): void {
    this.viewModalChangedDriver = false;
  }
  closeAddFeeModal() {
    this.viewAddFee = false;
  }

  payment() {
    this.viewModalPayment = true;
    setTimeout(() => {
      this.modalPayment.add();
    }, 50);
  }

  closePayment() {
    this.viewModalPayment = false;
  }
}
