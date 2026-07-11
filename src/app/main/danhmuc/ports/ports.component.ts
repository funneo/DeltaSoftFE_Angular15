import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalPortsComponent } from "@app/shared/components/danhmuc/modal-ports/modal-ports.component";
// import { ModalPortsComponent } from "@app/shared/components/danhmuc/modal-ports/modal-ports.component";
import { MessageContstants } from "@app/shared/constants";
import {
  Branch,
  Profile,
  ResponseValue,
  Locations,
} from "@app/shared/models";
import { Ports } from "@app/shared/models/danhmuc/ports.model";
import {
  NotificationService,
  AuthService,
  BranchService,
} from "@app/shared/services";
import { PortsService } from "@app/shared/services/danhmuc/ports.service";
import { ExportService } from "@app/shared/services/export-excel.service";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Subscription } from "rxjs";

@Component({
  selector: "app-ports",
  templateUrl: "./ports.component.html",
  styleUrls: ["./ports.component.css"],
})
export class PortsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listData: Ports[]=[];
  filteredData: Ports[]=[];
  busy: Subscription;
  viewModal = false;
  idSelected = 0;
  public flagLinkEdit: boolean = false;
  adminPermission: boolean = false;
  userLoged: Profile;
  filterColumns: { [key: string]: string } = {};
  sortKey: string = "";
  sortOrder: "asc" | "desc" = "asc";
  listBranch: Branch[] = [];
  /** 0/null = tất cả chi nhánh. Chọn 1 chi nhánh → cảng của chi nhánh đó + cảng dùng chung. */
  branchId?: number;
  @ViewChild(ModalPortsComponent, { static: false })  modalAddEdit: ModalPortsComponent;

  constructor(
    private notificationService: NotificationService,
    private portsService: PortsService,
    private _authService: AuthService,
    private branchService: BranchService,
    private _export: ExportService
  ) {}

  //modal-ports

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.adminPermission = this.userLoged.roles.indexOf("Admin") > -1;
    this.branchId = Number.parseInt(this.userLoged.branchId) || 0;
    this.loadBranch();
    this.loadData();
  }

  loadBranch(): void {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == "200" || res.code == "201") this.listBranch = res.data ?? [];
    });
  }

  /**
   * ng-select ghi thẳng `null` vào ngModel khi bấm × (xóa chọn), và $event khi đó là
   * `undefined` — nên phải quy về 0 = "Tất cả chi nhánh".
   */
  changedBranch(event: Branch): void {
    this.branchId = event?.id ?? 0;
    this.loadData();
  }

  loadData(): void {
    // useCache=false: màn quản trị phải thấy dữ liệu mới nhất, và để việc đổi
    // chi nhánh lần 2 vẫn gọi API thay vì lấy lại cache 60 phút.
    this.busy = this.portsService
      .getAll(this.branchId, false)
      .subscribe((res: ResponseValue<Ports[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listData = res.data;
        } else if (res.code == "204") {
          // Chi nhánh không có cảng nào. Phải xóa cả listData LẪN filteredData —
          // template lặp trên filteredData, quên gọi filterData() ở đây thì bảng
          // vẫn hiện nguyên dữ liệu của chi nhánh trước.
          this.listData = [];
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
          return;
        }
        this.totalRows = this.listData?.length ?? 0;
        this.flagEdit = false;
        this.flagDelete = false;
        this.filterData();
      });
  }

  filterData(): void {
    let listFileter = this.listData;
    this.filteredData = listFileter.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  }

  sortData(key: string): void {
    if (this.sortKey === key) {
      // Đảo chiều sắp xếp nếu cùng một cột được nhấp
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      // Sắp xếp theo cột mới
      this.sortOrder = "asc";
    }
    this.sortKey = key;
    this.filteredData.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue > bValue) {
        return this.sortOrder === "asc" ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sortOrder === "asc" ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  export(): void {
    let printList = this.filteredData.map(({ ...item }) => item);
    this._export.exportExcel(printList, "cang-bai-haiphong");
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  clickRow(item: Locations): void {
    item.checked = !item.checked;
    this.idSelected = item.checked ? item.id : 0;
    this.listData.forEach((it) => {
      if (it != item) it.checked = false;
    });
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listData.findIndex((x) => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter((x) => x.checked);
    let checks: string[] = [];
    for (let items of listChecks) {
      checks.push(items.code);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks[0])
    );
  }

  delete(code: string): void {
    this.portsService.delete(code).subscribe((res: ResponseValue<any>) => {
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
    this.listData.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  isAllChecked() {
    if (this.listData) return this.listData.every((_) => _.checked);
  }

  icheck() {
    const checksLength = this.listData.filter(x => x.checked).length;
    this.flagDelete = checksLength > 0;
    this.flagEdit = checksLength === 1;
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
}
