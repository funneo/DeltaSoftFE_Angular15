import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalPortsComponent } from "@app/shared/components/danhmuc/modal-ports/modal-ports.component";
// import { ModalPortsComponent } from "@app/shared/components/danhmuc/modal-ports/modal-ports.component";
import { MessageContstants } from "@app/shared/constants";
import {
  Profile,
  ResponseValue,
  Locations,
} from "@app/shared/models";
import { Ports } from "@app/shared/models/danhmuc/ports.model";
import {
  NotificationService,
  AuthService,
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
  @ViewChild(ModalPortsComponent, { static: false })  modalAddEdit: ModalPortsComponent;

  constructor(
    private notificationService: NotificationService,
    private portsService: PortsService,
    private _authService: AuthService,
    private _export: ExportService
  ) {}

  //modal-ports

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.adminPermission = this.userLoged.roles.indexOf("Admin") > -1;
    this.loadData();
  }

  loadData(): void {
    this.busy = this.portsService
      .getAll()
      .subscribe((res: ResponseValue<Ports[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listData = res.data;
          this.totalRows = res.data?.length;
          this.filterData();
        } else {
          if (res.code == "204") {
            this.listData = [];
            this.totalRows = 0;
          } else
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
        }
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
