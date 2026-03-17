import { DatePipe } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ModalClosingFclProcessComponent } from "@app/shared/components/transports/modal-closing-fcl-process/modal-closing-fcl-process.component";
import { ModalDispatchOrderFclComponent } from "@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.component";
import { ModalPerformFclComponent } from "@app/shared/components/transports/modal-perform-fcl/modal-perform-fcl.component";
import { MessageContstants } from "@app/shared/constants";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import {
  Branch,
  Employee,
  Profile,
  ResponseValue,
  Pagination,
} from "@app/shared/models";
import { DispatchOrderFcl } from "@app/shared/models/fcl/dispatch-order-fcl";
import { DispatchOrderFeeExport } from "@app/shared/models/transports/exports/dispatch-order-fee-export.model";
import {
  NotificationService,
  UtilityService,
  AuthService,
  BranchService,
  EmployeeService,
} from "@app/shared/services";
import { ExportService } from "@app/shared/services/export-excel.service";
import { DispatchOrderFclService } from "@app/shared/services/fcl/dispatch-order-fcl.service";
import * as moment from "moment";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { ModalPhieuChiLenhComponent } from '@app/shared/components/accounting/modal-phieu-chi-lenh/modal-phieu-chi-lenh.component';

@Component({
  selector: "app-dispatch-order-fcl",
  templateUrl: "./dispatch-order-fcl.component.html",
  styleUrls: ["./dispatch-order-fcl.component.css"],
})
export class DispatchOrderFclComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listDispatchOrderFcl: DispatchOrderFcl[];
  listFilter: DispatchOrderFcl[];
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
  flagChecked = false;
  _functionId = SystemContstants.DISPATCHORDER;
  array = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Khởi tạo" },
    { value: 2, text: "Gửi lệnh" },
    { value: 3, text: "Đã nhận" },
    { value: 4, text: "Duyệt B1" },
    { value: 5, text: "Duyệt B2" },
    { value: 6, text: "Chờ Chốt" },
    { value: 7, text: "CHỐT" },
    { value: 8, text: "Từ chối" },
  ];
  statusSelected?: number = 0;
  filterColumns: { [key: string]: string } = {};
  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  viewModalProgress = false;
  @ViewChild(ModalDispatchOrderFclComponent, { static: false }) modalDispatchOrderFclAddEdit: ModalDispatchOrderFclComponent;
  @ViewChild(ModalPerformFclComponent, { static: false }) modalPerformDispatchOrderFcl: ModalPerformFclComponent;
  @ViewChild(ModalClosingFclProcessComponent, { static: false }) modalChotMulti: ModalClosingFclProcessComponent;
  @ViewChild(ModalPhieuChiLenhComponent, { static: false }) modalPayment: ModalPhieuChiLenhComponent;
  viewModalPayment = false;
  constructor(
    private _service: DispatchOrderFclService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private _authService: AuthService,
    public datepipe: DatePipe,
    private branchService: BranchService,
    private exportService: ExportService, private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.loadDriver();
    this.adminPermission = this.userLoged.isAdmin;
    this._accept = this._authService.hasPermission("FCL_ACCEPT");
    const permiss: string[] =
      typeof this.userLoged.permissions == "string"
        ? JSON.parse(this.userLoged.permissions)
        : this.userLoged.permissions;
    this.account_permission =
      this._authService.hasPermission("FCL_ACCOUNT") || this.adminPermission;

    var p = UtilityService.getLocalParams(this._functionId);
    localStorage.removeItem(this._functionId);

    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this.filterColumns = p.filterColumns || {};
      this.keyword = p.keyword;
    } else {
      this.ngayBatDau = new Date(moment().subtract(7, "d").toString());
      this.ngayKetThuc = new Date(
        moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
      );
      this.dateOptions = this._utilityService.dateOptionMultis(
        this.ngayBatDau,
        this.ngayKetThuc
      );
      //this.loadCustomer();
    }
    this.loadData();
    this.loadBranch();
  }

  checkClosing(): boolean {
    var isChecked = false;
    let checkList = this.listFilter.filter((x) => x.checked);
    if (checkList.length > 0) {
      isChecked = !checkList.some((x) => x.status != 5);
    }
    return isChecked;
  }

  loadDriver(): void {
    const params = new HttpParams().set("branchId", this.userLoged.branchId);
    this.busy = this.employeeService
      .getByBranch(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDriver = res.data;
        } else {
          if (res.code == "204") {
            this.listDriver = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
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
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    this.spinner.show();
    const params = new HttpParams()
      .set("branchid", this.branchId?.toString())
      .set("driverid", this.driverId ? this.driverId.toString() : "0")
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword);
    // .set('usergroupid')
    this.busy = this._service
      .getAll(params)
      .subscribe((res: ResponseValue<DispatchOrderFcl[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDispatchOrderFcl = res.data;
          this.listDispatchOrderFcl = this.listDispatchOrderFcl.map((it) => ({
            ...it,
            containerList:
              it.containerNumbers
                ?.split(/[;\n]+/)
                .map((x) => x.trim())
                .filter(Boolean) || [],
            locationList:
              it.locations
                ?.split(/\*\-|[\r\n]+/)
                .map((x) => x.trim())
                .filter(Boolean) || [],
          }));
          this.filterData();
          this.spinner.hide();
        } else {
          if (res.code == "204") {
            this.listDispatchOrderFcl = [];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
          this.spinner.hide();
        }
      });
  }

  dateTimeFields: string[] = ["createdDate"]; // Các trường cần định dạng ngày

  filterData(): void {
    this.listFilter = Object.assign([], this.listDispatchOrderFcl);
    this.cdr.detectChanges();
    if (this.statusSelected > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.statusSelected == 8 ? data.isDeny == true :
          this.statusSelected == 1 ? data.status == 0 :
            this.statusSelected == 2 ? data.status == 1 :
              this.statusSelected == 3 ? data.status == 2 && data.isDeny == false :
                this.statusSelected == 4 ? data.status == 3 && data.isDeny == false :
                  this.statusSelected == 5 ? data.status == 4 :
                    this.statusSelected == 6 ? data.status == 5 : data.status == 6;
      });
    }
    this.listFilter = this.listFilter.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        if (!this.filterColumns[key]) return true; // Nếu không nhập gì, bỏ qua filter
        // Xử lý các giá trị lọc thông thường
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue = this.dateTimeFields.includes(key)
          ? this.datepipe.transform(item[key], "dd/MM/yyyy").toLowerCase()
          : Array.isArray(item[key]) // Nếu là mảng (containerList, locationList)
            ? item[key].join(", ").toLowerCase()
            : String(item[key] || "").toLowerCase();
        return itemValue.includes(filterValue);
      });
    });

    this.totalRows = this.listFilter.length;
  }

  clickRow(item: DispatchOrderFcl): void {
    item.checked = !item.checked;
    // this.listFilter.forEach((it) => {
    //   if (it != item) it.checked = false;
    // });
    this.icheck();
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

  edit(flag: boolean, refNo: string = null) {
    let p = {
      filterColumns: this.filterColumns,
      keyword: this.keyword,
      pageinex: this.pageIndex,
    };
    UtilityService.setLocalParams(p, this._functionId);
    let selectedRefNo = refNo;
    if (!selectedRefNo) {
      const index = this.listDispatchOrderFcl.findIndex((x) => x.checked);
      if (index >= 0) {
        selectedRefNo = this.listDispatchOrderFcl[index].refNo;
      }
    }

    if (selectedRefNo) {
      this.viewModal = true;
      setTimeout(() => {
        this.modalDispatchOrderFclAddEdit.edit(
          selectedRefNo,
          flag
        );
      }, 50);
    }
  }
  export(type: number) {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid', this.branchId?.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('type', type.toString())
    this.busy = this._service.getExport(params).subscribe((res: ResponseValue<DispatchOrderFeeExport[]>) => {
      if (res.code == '200' || res.code == '201') {
        let exelList: DispatchOrderFeeExport[];
        exelList = res.data;
        let printList = exelList.map(({ workflowId, maphi, tenmaphi, soluong, shippingTaskId, km, kmdau, kmcuoi, pallets, containers, tomtatlenh, inquiryTimeToTheFactory,
          tien, vat, tongtien, routeCode, routeName, contSeals, ...item }) => item);
        this.exportService.exportExcel(printList, type == 0 ? 'lenh-van-chuyenFCL' : 'lenh-van-chuyen-FCL-chi-tiet');
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
  chotlenhMulti() {
    let listChecked = this.listFilter.filter((x) => x.checked);
    this.notificationService.printConfirmationYesNo(
      "Chốt các lệnh vận chuyển FCL này hay không?",
      () => {
        this.viewModalProgress = true;
        setTimeout(() => {
          this.modalChotMulti.view(listChecked);
        }, 50);
      },
      () => { }
    );
  }

  deleteConfirm(): void {
    let index = this.listDispatchOrderFcl.findIndex((x) => x.checked);
    if (index >= 0) {
      if (this.listDispatchOrderFcl[index].status > 0) {
        this.notificationService.printErrorMessage(
          MessageContstants.CANNOT_DELETE_DISPATCHORDER
        );
        return;
      } else {
        this.notificationService.printConfirmationDialog(
          MessageContstants.CONFIRM_DELETE_MSG,
          () => this.delete(this.listDispatchOrderFcl[index].refNo)
        );
      }
    }
  }
  chotlenh(event: DispatchOrderFcl) {
    this.notificationService.printConfirmationYesNo(
      "Chốt lệnh vận chuyển FCL này hay không?",
      () => {
        var item = Object.assign({}, event);
        item.status = 6;
        this.busy = this._service
          .updateState(item, false, 0)
          .subscribe((res: ResponseValue<DispatchOrderFcl>) => {
            if (res.code == "200" || res.code == "201") {
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.loadData();
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
              );
            }
          });
      },
      () => { }
    );
  }

  delete(refNo: string): void {
    this._service.delete(refNo).subscribe((res: ResponseValue<any>) => {
      if (res.code == "200" || res.code == "201") {
        this.loadData();
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.DELETE_ERR_MSG + "\n" + res.code
        );
      }
    });
  }

  checkAll(ev) {
    this.listDispatchOrderFcl.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  isAllChecked() {
    if (this.listFilter?.length > 0)
      return this.listDispatchOrderFcl.every((_) => _.checked);
  }

  icheck() {
    let checks = this.listFilter.filter((x) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    } else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
    this.flagChecked = this.checkClosing();
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeModalProgress(): void {
    this.viewModalProgress = false;
    this.loadData();
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
