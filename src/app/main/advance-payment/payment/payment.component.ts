import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Payments, Pagination, Employee, ResponseValue, Branch } from '@app/shared/models';
import { AuthService, BranchService, EmployeeService, NotificationService, PaymentsService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  totalAmount = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listPayments: Payments[];
  listFilter: Payments[];
  listEmployee: Employee[];
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  _levelPermissionPayments: number;
  _hasPermissionPayments: boolean = false;
  _listPaymentsGroupId: string[];
  _isAdmin: boolean;
  _functionId = SystemContstants.PAYMENT;
  _viewAll = 2;
  employeeId: number;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  groupedItemLuu: any[] = [];
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listTypePayment = UtilityService.listTypePayment();
  listTypePaymentMode: any[] = [];
  viewRepaymentHistory: boolean = false;
  _hubConnection: signalR.HubConnection;
  listBranch: Branch[];
  listType: any[] = [
    { id: 0, text: 'Cá nhân' },
    { id: 1, text: 'Nhà cung cấp' },
    { id: 2, text: 'Tất cả' },
  ];
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Khởi tạo" }, { "value": 2, "text": "Chuyển duyệt" }, { "value": 3, "text": "Đang duyệt" }, { "value": 4, "text": "Đã duyệt" }, { "value": 5, "text": "Từ chối" }];

  listTrangthai: any[] = [
    { id: 0, text: 'Chưa duyệt' },
    { id: 1, text: 'Duyệt' },
    { id: 2, text: 'Từ chối' },
    { id: 3, text: 'Tất cả' },
  ];
  _type = 2;
  _isDirectPayment = 2;
  _typett = 3;

  nameSearch = '';
  refnoSearch = '';
  ngaySearch = '';
  tongtienSearch = '';
  noidungSearch = '';
  jobidSearch = '';
  tokhaiSearch = '';
  hbillSearch = '';
  bookingSearch = '';
  chungtuSearch = '';
  tamungSearch = '';
  selectedType = 0;
  selectedLoaiTT = 0;
  selectedIsDirect = 2;
  arrayLoaiTT = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Cá nhân" }, { "value": 2, "text": "Nhà cung cấp" }];
  arrayD = [{ "id": 2, "text": "Tất cả" }, { "id": 1, "text": "Trực tiếp" }, { "id": 0, "text": "Có tạm ứng" }];
  khachhangSearch = '';
  luonghangSearch = '';
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalAccounts: ModalPhieuChiComponent
  constructor(private advanceService: PaymentsService, private exportService: ExportService, private notificationService: NotificationService,
    private _utilityService: UtilityService, private employeeService: EmployeeService, private authService: AuthService, private spinner: NgxSpinnerService,
    private router: Router, private branchService: BranchService, public datepipe: DatePipe) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('PAYMENT_ACCOUNT');
    this._accept = this.authService.hasPermission('PAYMENT_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);
    this._levelPermissionPayments = Number.parseInt(user.advanceConfirmLevel);
    this._isAdmin = user.isAdmin;
    this.employeeId = this._employeeId;
    this._isAdmin = user.isAdmin;

    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == this._functionId);
    if (i != -1) {
      this._viewAll = list[i].value;
    }
    if (this._auth <= this._viewAll) {
      this._employeeId = null;
    }
    // Lấy tên theo file json
    if (list?.filter(x => x.id == 'PAYMENT-TYPE')?.length > 0) {
      this.listType = [];
      list?.filter(x => x.id == 'PAYMENT-TYPE')?.forEach(z => {
        this.listType.push({ id: z.value, text: z.text });
      });
      this.listType.push({ id: 2, text: 'Tất cả' });
    }
  }

  ngOnInit(): void {
    var p = UtilityService.getLocalParams(this._functionId);
    localStorage.removeItem(this._functionId);
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this._employeeId = p.employeeId;
      this._branchId = p.branchId;
      this._type = p.type;
      this.keyword = p.keyword;
      this.nameSearch = p.nanameSearch,
        this.refnoSearch = p.refnoSearch,
        this.ngaySearch = p.ngaySearch,
        this.tongtienSearch = p.tongtienSearch,
        this.noidungSearch = p.noidungSearch,
        this.jobidSearch = p.jobidSearch,
        this.tokhaiSearch = p.tokhaiSearch,
        this.hbillSearch = p.hbillSearch,
        this.bookingSearch = p.bookingSearch,
        this.chungtuSearch = p.chungtuSearch,
        this.groupedItemLuu = p.groupedItem
    }
    else {
      this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
      this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    }
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadEmployee();
    this.loadChiNhanh();
    this.listTypePaymentMode = [
      { id: 2, text: 'Tất cả' },
      { id: 1, text: 'Trực tiếp' },
      { id: 0, text: 'Có tạm ứng' },
    ];
    this.loadData();

  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event: Employee) {
    this._employeeId = event?.id;
    this.timKiem();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    if (this._auth <= this._viewAll) {
      this._employeeId = null;
    }
    this.loadEmployee();
    this.timKiem();
  }

  loadData(): void {
    this.spinner.show();
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('type', this._type?.toString())
      .set('isDirectPayment', this._isDirectPayment?.toString())
      .set('branchId', this._branchId?.toString());
    this.busy = this.advanceService.getPaging(params).subscribe((res: ResponseValue<Pagination<Payments>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPayments = res.data?.items;
        this.filter();
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        this.spinner.hide();
      }
    });
  }
  filter() {
    this.listFilter = Object.assign([], this.listPayments);
    if (this.selectedType > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType == 4 ? data.step == 2 : this.selectedType == 3 ? data.step == 1 : this.selectedType == 5 ? data.step == -1 : this.selectedType == 2 ? (data.status && data.step == 0) : !data.status;
      });
    }
    if (this.selectedLoaiTT > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedLoaiTT == 1 ? data.type == 0 : data.type == 1;
      });
    }
    if (this.selectedIsDirect < 2) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.isDirectPayment == this.selectedIsDirect;
      });
    }
    if (this._isDirectPayment < 2) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.isDirectPayment == this._isDirectPayment;
      });
    }
    if (this.nameSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeName.toString().toLowerCase().includes(this.nameSearch.trim().toLocaleLowerCase());
      });
    if (this.khachhangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName.toString().toLowerCase().includes(this.khachhangSearch.trim().toLocaleLowerCase());
      });
    if (this.refnoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo?.toLowerCase().includes(this.refnoSearch.trim().toLocaleLowerCase());
      });
    if (this.tongtienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.totalAmount?.toString().toLowerCase().includes(this.tongtienSearch.trim().toLocaleLowerCase());
      });
    if (this.luonghangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.weight?.toString().toLowerCase().includes(this.luonghangSearch.trim().toLocaleLowerCase());
      });

    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.contents?.toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.chungtuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.relatedDocuments?.toLowerCase().includes(this.chungtuSearch.trim().toLocaleLowerCase());
      });
    if (this.jobidSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.shipmentNo?.toLowerCase().includes(this.jobidSearch.trim().toLocaleLowerCase());
      });
    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.hbillSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL?.toLowerCase().includes(this.hbillSearch.trim().toLocaleLowerCase());
      });
    if (this.bookingSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo?.toLowerCase().includes(this.bookingSearch.trim().toLocaleLowerCase());
      });
    this.groupedItem = this.groupByAndSort(this.listFilter, 'employeeName'); // Nhóm theo cột "customerName"

    //so sánh các nhóm đã mở ra đã lưu vào storage để set lại sau khi back màn hình
    this.groupedItem.forEach(it => {
      const matchedItem = this.groupedItemLuu.find(x => x.key === it.key);
      if (matchedItem) {
        // Nếu tìm thấy, gán giá trị từ groupedItemLuu sang groupedItem
        it.isExpanded = matchedItem.isExpanded;
      }
    })
    this.calculator();
  }
  groupedItem: any[] = [];
  // Hàm tách tên thành First Name và Last Name
  splitName(fullName: string): [string, string] {
    const parts = fullName.trim().split(' ');
    const firstName = parts[parts.length - 1]; // Lấy tên (First Name)
    const lastName = parts.slice(0, -1).join(' '); // Phần còn lại là họ (Last Name)
    return [firstName, lastName];
  }

  groupByAndSort(array: any[], key: string) {
    const groups = array.reduce((result, item) => {
      const groupKey = item[key] || 'Khác';
      if (!result[groupKey]) {
        result[groupKey] = { key: groupKey, items: [], isExpanded: false };
      }
      result[groupKey].items.push(item);
      return result;
    }, {});

    // Chuyển thành mảng và sắp xếp theo tên trước, họ sau
    return Object.values(groups)
      .sort((a: any, b: any) => {
        const [firstNameA, lastNameA] = this.splitName(a.key);
        const [firstNameB, lastNameB] = this.splitName(b.key);

        return firstNameA.localeCompare(firstNameB) || lastNameA.localeCompare(lastNameB);
      });
  }

  toggleGroup(group: any) {
    group.isExpanded = !group.isExpanded;
  }
  calculator() {
    this.totalAmount = 0;
    this.listFilter.forEach(it => {
      this.totalAmount += it.totalAmount;
    })
    this.totalRows = this.listFilter.length;
  }
  export() {
    let printList = this.listFilter.map(({ id, customerId, step, status, deleted, ...item }) => item);
    this.exportService.exportExcel(printList, 'payments');
  }

  clickRow(item: Payments): void {
    item.checked = !item.checked;
    this.listFilter.forEach(it => {
      if (it != item) it.checked = false;
    })
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add(type: number): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      employeeId: this._employeeId,
      branchId: this._branchId,
      type: this._type,
      keyword: this.keyword,
    }
    UtilityService.setLocalParams(p, this._functionId);
    this.router.navigateByUrl('/main/advance-payment/payment/create/' + type + '/0');
  }

  edit(id: number, flag: boolean): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      employeeId: this._employeeId,
      branchId: this._branchId,
      type: this._type,
      keyword: this.keyword,
      nameSearch: this.nameSearch,
      refnoSearch: this.refnoSearch,
      ngaySearch: this.ngaySearch,
      tongtienSearch: this.tongtienSearch,
      noidungSearch: this.noidungSearch,
      jobidSearch: this.jobidSearch,
      tokhaiSearch: this.tokhaiSearch,
      hbillSearch: this.hbillSearch,
      bookingSearch: this.bookingSearch,
      chungtuSearch: this.chungtuSearch,
      groupedItem: this.groupedItem,
    }
    UtilityService.setLocalParams(p, this._functionId);
    if (id == null) {
      const index = this.listPayments.findIndex(x => x.checked);
      if (index >= 0) {
        id = this.listPayments[index].id;
      }
    }
    this.router.navigateByUrl('/main/advance-payment/payment/detail/' + id.toString() + '/' + flag);
  }

  deleteConfirm(): void {
    let listChecks = this.listPayments.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.advanceService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
        this.flagDelete = false;
        this.flagEdit = false;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listPayments.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      this.flagDelete = checks[0].employeeId == this.employeeId && checks[0].step < 1;
      this.flagEdit = checks[0].employeeId == this.employeeId;
    }
    else {
      this.flagView = false;
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(job: Payments) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: this._functionId,
      functionName: this._functionId,
      refNo: job.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
}
