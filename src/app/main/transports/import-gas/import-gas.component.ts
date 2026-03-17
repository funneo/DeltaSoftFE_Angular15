import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalImportGasComponent } from "@app/shared/components/transports/modal-import-gas/modal-import-gas.component";
import { MessageContstants } from "@app/shared/constants";
import {
  Pagination,
  Profile,
  ResponseValue,
  Supplier,
} from "@app/shared/models";
import { ImportGas } from "@app/shared/models/transports/import-gas.model";
import {
  AuthService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { SupplierService } from "@app/shared/services/supplier.service";
import { ImportGasService } from "@app/shared/services/transports/import-gas.service";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { ExportService } from "@app/shared/services/export-excel.service";

@Component({
  selector: "app-import-gas",
  templateUrl: "./import-gas.component.html",
  styleUrls: ["./import-gas.component.css"],
})
export class ImportGasComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listImportGas: ImportGas[] = [];
  listSupplier: Supplier[] = [];
  listSite;
  userLoged?: Profile;
  supplierId?: number = 0;
  busy: Subscription;
  viewModal = false;

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  @ViewChild(ModalImportGasComponent, { static: false })
  modalAddEdit: ModalImportGasComponent;

  constructor(
    private importGasService: ImportGasService,
    private notificationService: NotificationService,
    private _authService: AuthService,
    private supplierService: SupplierService,
    private _export: ExportService,
    private _utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
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
    this.loadSupplier();
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  export() {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", '99999')
      .set("branchid", this.userLoged.branchId)
      .set("supplierid", this.supplierId.toString())
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword);
    // .set('usergroupid')
    this.busy = this.importGasService
      .getPaging(params)
      .subscribe((res: ResponseValue<Pagination<ImportGas>>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          let exelList = res.data?.items;
          let printList=exelList.map(({createdBy,id,branchId,gasSiteId,status,supplierCode, ...item }) => item);
          this._export.exportExcel(printList,'nhap-dau-tec');
        }  else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code+ "\n" + res.message
            );
          }
      });
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", this.pageSize.toString())
      .set("branchid", this.userLoged.branchId)
      .set("supplierid", this.supplierId!=null?this.supplierId.toString():'0')
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword);
    // .set('usergroupid')
    this.busy = this.importGasService
      .getPaging(params)
      .subscribe((res: ResponseValue<Pagination<ImportGas>>) => {
        if (res.code == "200" || res.code == "201") {
          this.listImportGas = res.data?.items;
          this.totalRows = res.data?.totalRows;
        } else {
          if (res.code == "204") {
            this.listImportGas = [];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  loadSupplier(): void {
    const params = new HttpParams().set("branchid", this.userLoged.branchId);
    this.busy = this.supplierService
      .getAll(params)
      .subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listSupplier = res.data;
        } else {
          if (res.code == "204") {
            this.listSupplier = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  clickRow(item: ImportGas): void {
    item.checked = !item.checked;
    this.listImportGas.forEach((it) => {
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

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listImportGas.findIndex((x) => x.checked);
    this.viewModal = true;
    let permission = this.listImportGas[index].createdBy == this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listImportGas[index].id, flag, permission);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listImportGas.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks.join(","))
    );
  }

  delete(listIds: string): void {
    this.importGasService
      .delete(listIds)
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
    let checks = this.listImportGas.filter((x) => x.checked);
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
