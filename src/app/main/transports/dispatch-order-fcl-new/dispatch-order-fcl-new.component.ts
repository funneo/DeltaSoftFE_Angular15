import { DatePipe } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ModalClosingFclProcessComponent } from "@app/shared/components/transports/modal-closing-fcl-process/modal-closing-fcl-process.component";
import { ModalDispatchOrderFclV2Component } from "@app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component";
import { MessageContstants } from "@app/shared/constants";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import {
  Branch,
  Employee,
  Profile,
  ResponseValue,
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

// Component MỚI HOÀN TOÀN: list lệnh FCL MỚI (isLegacy=0), giao diện table hiện đại.
// Kế thừa toàn bộ logic FCL list; CHỈ dùng modal v2 + closing + phiếu chi (KHÔNG có modal FCL legacy).
@Component({
  selector: "app-dispatch-order-fcl-new",
  templateUrl: "./dispatch-order-fcl-new.component.html",
  styleUrls: ["./dispatch-order-fcl-new.component.scss"],
})
export class DispatchOrderFclNewComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listDispatchOrderFcl: DispatchOrderFcl[];
  listFilter: DispatchOrderFcl[];
  listBranch: Branch[];
  account_permission: boolean = false;
  listDriver: Employee[] = [];
  userLoged?: Profile;
  branchId?: number;
  busy: Subscription;
  adminPermission = false;
  _accept = false;
  driverId?: number = 0;
  flagChecked = false;
  _functionId = SystemContstants.DISPATCHORDER;
  // Chỉ lấy lệnh FCL MỚI
  _isLegacy = 0;
  // Key localStorage riêng để không lẫn bộ lọc với trang FCL cũ
  _storageKey = SystemContstants.DISPATCHORDER + "_NEW";
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
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  viewModalProgress = false;
  viewModalV2 = false;
  viewModalPayment = false;
  @ViewChild(ModalDispatchOrderFclV2Component, { static: false }) modalDispatchOrderFclV2AddEdit: ModalDispatchOrderFclV2Component;
  @ViewChild(ModalClosingFclProcessComponent, { static: false }) modalChotMulti: ModalClosingFclProcessComponent;
  @ViewChild(ModalPhieuChiLenhComponent, { static: false }) modalPayment: ModalPhieuChiLenhComponent;

  constructor(
    private _service: DispatchOrderFclService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private _authService: AuthService,
    public datepipe: DatePipe,
    private branchService: BranchService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.isAdmin;
    this._accept = this._authService.hasPermission("FCL_ACCEPT");
    this.account_permission =
      this._authService.hasPermission("FCL_ACCOUNT") || this.adminPermission;

    var p = UtilityService.getLocalParams(this._storageKey);
    localStorage.removeItem(this._storageKey);

    const defaultFrom = new Date(moment().subtract(7, "d").toString());
    const defaultTo = new Date(
      moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
    );
    if (p != null) {
      const d1 = p.d1 ? new Date(p.d1) : null;
      const d2 = p.d2 ? new Date(p.d2) : null;
      this.ngayBatDau = d1 && !isNaN(d1.getTime()) ? d1 : defaultFrom;
      this.ngayKetThuc = d2 && !isNaN(d2.getTime()) ? d2 : defaultTo;
      this.filterColumns = p.filterColumns || {};
      this.keyword = p.keyword || "";
    } else {
      this.ngayBatDau = defaultFrom;
      this.ngayKetThuc = defaultTo;
    }
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.loadData();
    this.loadBranch();
    this.loadDriver();
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
    const params = new HttpParams().set("branchId", this.branchId?.toString());
    this.busy = this.employeeService
      .getByBranch(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDriver = res.data;
        } else {
          this.listDriver = [];
        }
      });
  }

  loadBranch() {
    this.branchService.getAll().subscribe({
      next: (res: ResponseValue<Branch[]>) => {
        if ((res?.code == "200" || res?.code == "201") && Array.isArray(res.data) && res.data.length > 0) {
          this.listBranch = res.data;
        } else {
          this._loadBranchFresh();
        }
      },
      error: () => this._loadBranchFresh(),
    });
  }

  private _loadBranchFresh() {
    this.branchService.clearCache?.();
    this.branchService.getAll(false).subscribe({
      next: (res: ResponseValue<Branch[]>) => {
        this.listBranch = Array.isArray(res?.data) ? res.data : [];
      },
      error: () => {
        this.listBranch = [];
      },
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
      .set("keyword", this.keyword)
      .set("isLegacy", this._isLegacy.toString());
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
            this.listFilter = [];
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

  dateTimeFields: string[] = ["createdDate"];

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
        if (!this.filterColumns[key]) return true;
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue = this.dateTimeFields.includes(key)
          ? this.datepipe.transform(item[key], "dd/MM/yyyy").toLowerCase()
          : Array.isArray(item[key])
            ? item[key].join(", ").toLowerCase()
            : String(item[key] || "").toLowerCase();
        return itemValue.includes(filterValue);
      });
    });

    this.totalRows = this.listFilter.length;
  }

  clickRow(item: DispatchOrderFcl): void {
    item.checked = !item.checked;
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
      d1: this.ngayBatDau,
      d2: this.ngayKetThuc,
      filterColumns: this.filterColumns,
      keyword: this.keyword,
      pageinex: this.pageIndex,
    };
    UtilityService.setLocalParams(p, this._storageKey);
    let selectedRefNo = refNo;
    if (!selectedRefNo) {
      const index = this.listDispatchOrderFcl.findIndex((x) => x.checked);
      if (index >= 0) selectedRefNo = this.listDispatchOrderFcl[index].refNo;
    }
    if (selectedRefNo) {
      // Lệnh mới → luôn dùng modal v2 (không có modal FCL legacy ở trang này)
      this.viewModalV2 = true;
      setTimeout(() => {
        this.modalDispatchOrderFclV2AddEdit.edit(selectedRefNo, flag);
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
        let exelList: DispatchOrderFeeExport[] = res.data;
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
    return false;
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

  // Class badge trạng thái cho giao diện hiện đại
  getStatusClass(item: DispatchOrderFcl): string {
    if (item.isDeny) return 'dof-badge dof-badge--deny';
    switch (item.status) {
      case 0: return 'dof-badge dof-badge--init';
      case 1: return 'dof-badge dof-badge--sent';
      case 2: return 'dof-badge dof-badge--received';
      case 3: return 'dof-badge dof-badge--b1';
      case 4: return 'dof-badge dof-badge--b2';
      case 5: return 'dof-badge dof-badge--waiting';
      case 6: return 'dof-badge dof-badge--closed';
      default: return 'dof-badge dof-badge--init';
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModalV2(): void {
    this.viewModalV2 = false;
  }

  closeModalProgress(): void {
    this.viewModalProgress = false;
    this.loadData();
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
