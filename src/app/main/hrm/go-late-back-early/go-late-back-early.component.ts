import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalGoLateBackEarlyComponent } from "@app/shared/components/hrm/modal-go-late-back-early/modal-go-late-back-early.component";
import { MessageContstants } from "@app/shared/constants";
import { Branch, Profile, ResponseValue, Pagination } from "@app/shared/models";
import { GolateBackearly } from "@app/shared/models/hrm/golate-backearly.model";
import {
  NotificationService,
  AuthService,
  BranchService,
  UtilityService,
} from "@app/shared/services";
import { ExportService } from "@app/shared/services/export-excel.service";
import { GolateBackearlyService } from "@app/shared/services/hrm/go-late-back-early.service";
import * as moment from "moment";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Subscription } from "rxjs";

@Component({
  selector: "app-go-late-back-early",
  templateUrl: "./go-late-back-early.component.html",
  styleUrls: ["./go-late-back-early.component.css"],
})
export class GoLateBackEarlyComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listGolateBackearly: GolateBackearly[] = [];
  listFilter: GolateBackearly[] = [];
  listBranch: Branch[] = [];
  userLoged?: Profile;
  supplierId?: number = 0;
  busy: Subscription;
  viewModal = false;
  adminPermission = false;
  branchId?: number;
  _auth = 5;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  @ViewChild(ModalGoLateBackEarlyComponent, { static: false })
  modalAddEdit: ModalGoLateBackEarlyComponent;

  constructor(
    private _sevice: GolateBackearlyService,
    private notificationService: NotificationService,
    private _authService: AuthService,
    private branchService: BranchService,private exportService: ExportService,
    private _utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this.adminPermission = this.userLoged.isAdmin || this._auth < 1;
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
    this.loadBranch();
  }
  exportExcel() {
  this.exportService.exportExcel(this.listGolateBackearly,"bang-cong-di-muon-ve-som");
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  showModal(item: GolateBackearly) {
    this.viewModal = true;
    let permission = item.createdBy == this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true, permission);
    }, 50);
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", '99999')
      .set("branchid", this.userLoged.branchId)
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword);
    // .set('usergroupid')
    this.busy = this._sevice
      .getPaging(params)
      .subscribe((res: ResponseValue<GolateBackearly[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listGolateBackearly = res.data;
          this.totalRows = res.data?.length;
        } else {
          if (res.code == "204") {
            this.listGolateBackearly = [];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listGolateBackearly?.slice(startIndex, endIndex);
  }


  loadBranch(): void {
    this.busy = this.branchService
      .getAll()
      .subscribe((res: ResponseValue<Branch[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listBranch = res.data;
        } else {
          if (res.code == "204") {
            this.listBranch = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  changedBranch(event: Branch) {
    this.branchId = event!.id;
    this.loadData();
  }

  clickRow(item: GolateBackearly): void {
    item.checked = !item.checked;
    this.listGolateBackearly.forEach((value) => {
      if (value != item) value.checked = false;
    });
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }
  edit(flag: boolean): void {
    const index = this.listGolateBackearly.findIndex((x) => x.checked);
    this.viewModal = true;
    let permission =
      this.listGolateBackearly[index].createdBy == this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(
        this.listGolateBackearly[index].id,
        flag,
        permission
      );
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listGolateBackearly.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    if (listChecks[0].status > 0) return;
    if (listChecks[0].createdBy != this.userLoged.id) return;
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks[0])
    );
  }

  delete(id: number): void {
    this._sevice.delete(id).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.DELETE_ERR_MSG + "\n" + res.code
          );
        }
      }
    );
  }

  icheck() {
    let checks = this.listGolateBackearly.filter((x) => x.checked);
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
  }
}
