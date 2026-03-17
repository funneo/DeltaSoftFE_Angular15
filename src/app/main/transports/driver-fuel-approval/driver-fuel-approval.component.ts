import { ExportService } from "@app/shared/services/export-excel.service";
import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalDriverFuelApprovalComponent } from "@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.component";
import { MessageContstants } from "@app/shared/constants";
import {
  Branch,
  Employee,
  Pagination,
  Profile,
  ResponseValue,
} from "@app/shared/models";
import { DriverFuelApproval } from "@app/shared/models/transports/driver-fuel-approval.model";
import {
  AuthService,
  BranchService,
  EmployeeService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { DriverFuelApprovalService } from "@app/shared/services/transports/driver-fuel-approval.service";
import * as moment from "moment";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { ModalFuelSummaryComponent } from "@app/shared/components/transports/modal-fuel-summary/modal-fuel-summary.component";

@Component({
  selector: "app-driver-fuel-approval",
  templateUrl: "./driver-fuel-approval.component.html",
  styleUrls: ["./driver-fuel-approval.component.css"],
})
export class DriverFuelApprovalComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listDriverFuelApproval: DriverFuelApproval[] = [];
  listFilter: DriverFuelApproval[] = [];
  listDriver: Employee[] = [];
  listBranch: Branch[] = [];
  driverId: number = 0;
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  viewModalSum = false;
  adminPermission = false;
  branchId?: number;
  array = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Khởi tạo" },
    { value: 2, text: "Xuất phiếu" },
    { value: 3, text: "Chốt phiếu" },
  ];

  tinhtrang: number = 0;
  sophieuSearch?: string;
  khoSearch?: string;
  ngaySearch?: string;
  nguoitaoSearch?: string;
  nccSearch?: string;
  laixeSearch?: string;
  bksSearch?: string;
  soluongSearch?: string;
  ghichuSearch?: string;
  igasSearch?: string;
  tgdoSearch?: string;
  sldoSearch?: string;

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  @ViewChild(ModalDriverFuelApprovalComponent, { static: false })
  modalAddEdit: ModalDriverFuelApprovalComponent;
  @ViewChild(ModalFuelSummaryComponent, { static: false })
  modalSummary: ModalFuelSummaryComponent;

  constructor(
    private _utilityService: UtilityService,
    private driverFuelApprovalService: DriverFuelApprovalService,
    private employeeService: EmployeeService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private _authService: AuthService,
    private _export: ExportService,
    private branchService: BranchService,
    public datepipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.isAdmin;
    //this.loadCustomer();
    this.ngayBatDau = new Date(
      moment().hours(0).minutes(0).seconds(0).startOf("month").toString()
    );
    this.ngayKetThuc = new Date(
      moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
    );
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.loadData();
    this.loadDriver();
    this.loadBranch();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changedBranch(event: Branch) {
    this.branchId = event?.id;
    this.loadData();
  }

  export() {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", "99999")
      .set("branchid", this.branchId.toString())
      .set("driverid", this.driverId.toString())
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword)
      .set("type", "0");
    // .set('usergroupid')
    this.busy = this.driverFuelApprovalService
      .getPaging(params, false)
      .subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == "200" || res.code == "201") {
          let exelList: DriverFuelApproval[];
          exelList = res.data?.items;
          let printList = exelList.map(
            ({
              createdBy,
              id,
              totalRows,
              branchId,
              driverId,
              gasSiteId,
              vihicleId,
              type,
              status,
              approvedBy,
              approvedDate,
              supplierId,
              supplierCode,
              ...item
            }) => item
          );
          this._export.exportExcel(printList, "xuat-dau-xe-nha");
        } else {
          if (res.code == "204") {
            this.notificationService.printErrorMessage(
              MessageContstants.EMPTY_VALUE
            );
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", this.pageSize.toString())
      .set("branchid", this.branchId.toString())
      .set("driverid", this.driverId.toString())
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword)
      .set("type", "0");
    // .set('usergroupid')
    this.busy = this.driverFuelApprovalService
      .getPaging(params, false)
      .subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDriverFuelApproval = res.data?.items;
          this.totalRows = res.data?.totalRows;
          this.listFilter = this.listDriverFuelApproval;
          this.tinhtrang = 0;
        } else {
          if (res.code == "204") {
            this.listDriverFuelApproval = [];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  filter() {
    this.listFilter = Object.assign([], this.listDriverFuelApproval);
    if (this.tinhtrang > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.tinhtrang == 1
          ? data.status == 0
          : this.tinhtrang == 2
          ? data.status == 1
          : data.status == 2;
      });
    }
    if (this.sophieuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo
          .toString()
          .toLowerCase()
          .includes(this.sophieuSearch.trim().toLocaleLowerCase());
      });
    if (this.khoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.siteName
          ?.toLowerCase()
          .includes(this.khoSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoitaoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName
          ?.toLowerCase()
          .includes(this.nguoitaoSearch.trim().toLocaleLowerCase());
      });
    if (this.nccSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.supplierName
          ?.toLowerCase()
          .includes(this.nccSearch.trim().toLocaleLowerCase());
      });
    if (this.laixeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.driverName
          ?.toLowerCase()
          .includes(this.laixeSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.createdDate, "dd/MM/yyyy")
          .toLowerCase()
          .includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.bksSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.licensePlate
          ?.toLowerCase()
          .includes(this.bksSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note
          ?.toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.igasSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.igasCode
          ?.toLowerCase()
          .includes(this.igasSearch.trim().toLocaleLowerCase());
      });
    if (this.tgdoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.refuelingTimeIgas, "dd/MM/yyyy")
          .toLowerCase()
          .includes(this.tgdoSearch.trim().toLocaleLowerCase());
      });
    if (this.sldoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.quantityIgas
          ?.toString()
          .toLowerCase()
          .includes(this.sldoSearch.trim().toLocaleLowerCase());
      });
    if (this.soluongSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.quantity
          ?.toString()
          .toLowerCase()
          .includes(this.soluongSearch.trim().toLocaleLowerCase());
      });
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

  clickRow(item: DriverFuelApproval): void {
    item.checked = !item.checked;
    this.listDriverFuelApproval.forEach((it) => {
      if (it != item) it.checked = false;
    });
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

  sum(): void {
    this.viewModalSum = true;
    setTimeout(() => {
      this.modalSummary.add();
    }, 50);
  }
  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(0, false, null, null, null);
    }, 50);
  }
  igas() {
    this.spinner.show();
    this.busy = this.driverFuelApprovalService
      .updateIgas()
      .subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
          this.filter();
          this.spinner.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
          this.spinner.hide();
        }
      });
  }

  edit(flag: boolean): void {
    const index = this.listDriverFuelApproval.findIndex((x) => x.checked);
    let permission =
      this.listDriverFuelApproval[index].createdBy == this.userLoged.id;
    if (this.listDriverFuelApproval[index].type < 2) {
      this.viewModal = true;
      setTimeout(() => {
        this.modalAddEdit.edit(
          this.listDriverFuelApproval[index].id,
          flag,
          permission
        );
      }, 50);
    } else {
      this.viewModalSum = true;
      setTimeout(() => {
        this.modalSummary.edit(
          this.listDriverFuelApproval[index].id,
          flag,
          permission
        );
      }, 50);
    }
  }

  deleteConfirm(): void {
    let listChecks = this.listDriverFuelApproval.filter((x) => x.checked);
    if (listChecks[0].status > 1) return;
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks[0])
    );
  }

  delete(id: number): void {
    this.driverFuelApprovalService
      .delete(id)
      .subscribe((res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.DELETE_ERR_MSG + "\n" + res.code
          );
        }
      });
  }
  icheck() {
    let checks = this.listDriverFuelApproval.filter((x) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    } else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
    this.viewModalSum = false;
  }
}
