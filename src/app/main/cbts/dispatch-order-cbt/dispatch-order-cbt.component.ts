import { ApiItem } from "./../../../shared/models/transports/igas/api-item.model";
import { ModalPaymentCbtComponent } from "./../../../shared/components/cbt/modal-payment-cbt/modal-payment-cbt.component";
import { DatePipe } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalAdvanceCbtComponent } from "@app/shared/components/cbt/modal-advance-cbt/modal-advance-cbt.component";
import { ModalDispatchOrderCbtComponent } from "@app/shared/components/cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.component";
import { ModalAttachfileComponent } from "@app/shared/components/systems/modal-attachfile/modal-attachfile.component";
import { ModalDriverFuelApprovalComponent } from "@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.component";
import { ModalExternalOilPurchasedComponent } from "@app/shared/components/transports/modal-external-oil-purchased/modal-external-oil-purchased.component";
import { MessageContstants } from "@app/shared/constants";
import { Branch, Profile, ResponseValue } from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { DispatchOrderCbt } from "@app/shared/models/cbt/dispatch-order-cbt.model";
import {
  AuthService,
  BranchService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { CbtService } from "@app/shared/services/cbt/cbt.service";
import { ExportService } from "@app/shared/services/export-excel.service";
import * as moment from "moment";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dispatch-order-cbt",
  templateUrl: "./dispatch-order-cbt.component.html",
  styleUrls: ["./dispatch-order-cbt.component.css"],
})
export class DispatchOrderCbtComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listDispatchorder: DispatchOrderCbt[];
  listFilter: DispatchOrderCbt[];
  listBranch: Branch[];
  //Biến kiểm tra quyền thu chi để thêm chi phí cung đường cho lệnh
  account_permission: boolean = false;
  userLoged?: Profile;
  branchId?: number;
  busy: Subscription;
  viewModal = false;
  viewModalChangedDriver = false;
  adminPermission = false;
  _accept = false;

  viewAddFee = false;

  array = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Khởi tạo" },
    { value: 2, text: "Hoàn thành" },
    { value: 3, text: "Chốt lệnh" },
  ];

  refNoSearch?: String;
  ngaySearch?: String;
  nguoilapSearch?: String;
  jobidSearch?: String;
  khachhangSearch?: string;
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
  contTypeSearch = "";

  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  @ViewChild(ModalDispatchOrderCbtComponent, { static: false })
  modalDispatchOrderAddEdit: ModalDispatchOrderCbtComponent;
  constructor(
    private service: CbtService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private _authService: AuthService,
    public datepipe: DatePipe,
    private branchService: BranchService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.roles.indexOf("Admin") > -1;
    this._accept = this._authService.hasPermission("F003_ACCEPT");

    var p = UtilityService.getLocalParams("CBT");
    localStorage.removeItem("CBT");
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this.branchId = p.branchId;
      this.keyword = p.makhSearch;
      this.refNoSearch = p.refNoSearch;
      this.nguoilapSearch = p.nguoilapSearch;
      this.ngaySearch = p.ngaySearch;
      this.khachhangSearch = p.khachhangSearch;
      this.jobidSearch = p.jobidSearch;
      this.bksSearch = p.bksSearch;
      this.laixeSearch = p.laixeSearch;
      this.toantuyenSearch = p.toantuyenSearch;
      this.ghichuSearch = p.ghichuSearch;
      this.tinhtrang = p.tinhtrang;
      this.keyword = p.keyword;
    } else {
      this.ngayBatDau = new Date(moment().subtract(30, "d").toString());
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

  export() {
    let printList = this.listFilter.map(({ id, ...item }) => item);
    this.exportService.exportExcel(printList, "lenhvanchuyenCbt");
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
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword);
    // .set('usergroupid')
    this.busy = this.service
      .getPaging(params)
      .subscribe((res: ResponseValue<DispatchOrderCbt[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDispatchorder = res.data;
          this.filter();
          this.spinner.hide();
        } else {
          if (res.code == "204") {
            this.listDispatchorder = [];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG +
                "\n" +
                res.code +
                "\n" +
                res.message
            );
          }
          this.spinner.hide();
        }
      });
  }
  filter() {
    this.listFilter = Object.assign([], this.listDispatchorder);
    if (this.tinhtrang > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.tinhtrang == 1
          ? data.status == 0
          : this.tinhtrang == 2
          ? data.status == 1
          : this.tinhtrang == 3
          ? data.status == 2
          : this.tinhtrang == 4
          ? data.status == 3 && data.finished == false
          : this.tinhtrang == 5
          ? data.status == 3 && data.finished == true
          : this.tinhtrang == 6
          ? data.status == 5
          : this.tinhtrang == 7
          ? data.status == 6
          : data.status == 4 || data.status == 7;
      });
    }
    if (this.refNoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo
          .toString()
          .toLowerCase()
          .includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.createdDate, "dd/MM/yyyy")
          .toString()
          .toLowerCase()
          .includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName
          ?.toLowerCase()
          .includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
    if (this.khachhangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName
          ?.toString()
          .toLowerCase()
          .includes(this.khachhangSearch.trim().toLocaleLowerCase());
      });
    if (this.jobidSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId
          ?.toString()
          .toLowerCase()
          .includes(this.jobidSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note
          ?.toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.bksSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.vihiclelLicensePlates
          ?.toLowerCase()
          .includes(this.bksSearch.trim().toLocaleLowerCase());
      });
    if (this.laixeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.driverName
          ?.toLowerCase()
          .includes(this.laixeSearch.trim().toLocaleLowerCase());
      });
    if (this.toantuyenSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.fullRoute
          ?.toLowerCase()
          .includes(this.toantuyenSearch.trim().toLocaleLowerCase());
      });
    if (this.kmSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.kmQuota
          ?.toString()
          .toLowerCase()
          .includes(this.kmSearch.trim().toLocaleLowerCase());
      });
    if (this.kmdauSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.startVehicleOdor
          ?.toString()
          .toLowerCase()
          .includes(this.kmdauSearch.trim().toLocaleLowerCase());
      });
    if (this.kmcuoiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.finishVehicleOdor
          ?.toString()
          .toLowerCase()
          .includes(this.kmcuoiSearch.trim().toLocaleLowerCase());
      });
    if (this.sumSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.dispatchSummarize
          ?.toLowerCase()
          .includes(this.sumSearch.trim().toLocaleLowerCase());
      });
    if (this.contsealSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.documentNumber
          ?.toLowerCase()
          .includes(this.contsealSearch.trim().toLocaleLowerCase());
      });
    this.totalRows = this.listFilter.length;
  }

  clickRow(item: DispatchOrderCbt): void {
    item.checked = !item.checked;
    this.listDispatchorder.forEach((it) => {
      if (it != item) it.checked = false;
    });
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  changedBranch(event: Branch) {
    this.branchId = event?.id;
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


  edit(flag: boolean): void {
    const index = this.listDispatchorder.findIndex((x) => x.checked);
    this.viewModal = true;
    flag = flag; //|| (this.listDispatchorder[index].createdBy!=this.userLoged.id);
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.edit(
        this.listDispatchorder[index].refNo.toString(),
        flag
      );
    }, 50);
  }

  deleteConfirm(): void {
    let index = this.listDispatchorder.findIndex((x) => x.checked);
    if (this.listDispatchorder[index].status > 0) {
      this.notificationService.printErrorMessage(
        MessageContstants.CANNOT_DELETE_DISPATCHORDER
      );
      return;
    } else {
      //Kiểm tra xem lệnh có được phép xóa hay không?
      this.service
        .getDetail(this.listDispatchorder[index].refNo)
        .subscribe((res: ResponseValue<DispatchOrderCbt>) => {
          if (res.code == "200" || res.code == "201") {
            let item = res.data;
            if (
              item.listAdvances?.filter((x) => !x.deleted).length > 0 ||
              item.listPayments?.filter((x) => !x.deleted).length > 0 ||
              item.listFuelApprovals?.length > 0 ||
              item.listExternalOilPurchased?.length > 0
            )
              this.notificationService.printErrorMessage(
                MessageContstants.CANNOT_DELETE_DISPATCHORDER
              );
            else if (
              this.listDispatchorder[index].createdBy != this.userLoged.id &&
              !this.userLoged.isAdmin
            )
              return;
            else {
              this.notificationService.printConfirmationDialog(
                MessageContstants.CONFIRM_DELETE_MSG,
                () => this.delete(this.listDispatchorder[index].refNo)
              );
            }
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.SYSTEM_ERROR_MSG
            );
          }
        });
    }
  }

  /**
   * Xóa lệnh điều động CBTT
   * @param refNo mã tham chiếu của lệnh điều động CBTT
   */

  delete(refNo: string): void {
    this.service.delete(refNo).subscribe((res: ResponseValue<any>) => {
      if (res.code == "200" || res.code == "201") {
        this.loadData();
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.DELETE_ERR_MSG + "\n" + res.code
        );
      }
    });
  }

  /**
   * Check all dispatch order
   * @param ev event
   */
  checkAll(ev) {
    this.listDispatchorder.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  /**
   * Kiểm tra số lượng bản ghi được chọn
   * Nếu chỉ có một bản ghi được chọn, cho phép sửa và xóa
   * Ngược lại, không cho phép sửa và xóa
   */
  icheck() {
    let checks = this.listDispatchorder.filter((x) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    } else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  viewAttachFiles: boolean;

  /**
   * Hiển thị chi modal tài liệu đính kèm
   * @param job bản ghi lệnh vận chuyển CBT để gán vào tài liệu đính kèm tương ứng
   */
  showFiles(job: DispatchOrderCbt) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "CBTDISPATCH",
      functionName: "CBTDISPATCH",
      refNo: job.id.toString(),
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  @ViewChild(ModalAdvanceCbtComponent, { static: false })
  modalAdvances: ModalAdvanceCbtComponent;
  viewAdvances: boolean;

  /**
   * Hiển thị chi tiết modal tạm ứng cho lệnh vận chuyển CBT
   * @param item bản ghi lệnh vận chuyển CBT
   */
  showAdvances(item: DispatchOrderCbt) {
    this.viewAdvances = true;

    setTimeout(() => {
      this.modalAdvances.add(item);
    }, 50);
  }
  @ViewChild(ModalPaymentCbtComponent, { static: false })
  modalPayment: ModalPaymentCbtComponent;
  viewPayment: boolean;
  showPayment(item: DispatchOrderCbt) {
    this.viewPayment = true;
    setTimeout(() => {
      this.modalPayment.add(item);
    }, 50);
  }
  @ViewChild(ModalDriverFuelApprovalComponent, { static: false })
  modalDriverFuelApproval: ModalDriverFuelApprovalComponent;
  viewDriverFuelApproval: boolean;
  showDriverFuelApproval(job: DispatchOrderCbt) {
    this.viewDriverFuelApproval = true;
    setTimeout(() => {
      this.modalDriverFuelApproval.add(
        0,
        true,
        job.refNo,
        job.driverId,
        job.vihicleId
      );
    }, 50);
  }
  @ViewChild(ModalExternalOilPurchasedComponent, { static: false })
  modalExternalOilPurchased: ModalExternalOilPurchasedComponent;
  viewExternalOilPurchased: boolean;
  showExternalOilPurchased(job: DispatchOrderCbt) {
    this.viewExternalOilPurchased = true;
    setTimeout(() => {
      this.modalExternalOilPurchased.add(
        true,
        job.refNo,
        job.vihicleId,
        job.driverId
      );
    }, 50);
  }

  saveSuccess(): void {
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
  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
}
