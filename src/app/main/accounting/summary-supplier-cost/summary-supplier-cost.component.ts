import { stat } from 'fs';
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSummarySupplierCostComponent } from '@app/shared/components/accounting/modal-summary-supplier-cost/modal-summary-supplier-cost.component';
import { MessageContstants } from '@app/shared/constants';
import { Advance, Branch, Pagination, Profile, ResponseValue, SummarySupplierCost, Supplier } from '@app/shared/models';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { SummarySupplierCostsService } from '@app/shared/services/accounting/summary-supplier-cost.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ExportService } from '@app/shared/services/export-excel.service';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';

@Component({
  selector: 'app-summary-supplier-cost',
  templateUrl: './summary-supplier-cost.component.html',
  styleUrls: ['./summary-supplier-cost.component.css']
})
export class SummarySupplierCostComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listSummarySupplierCost: SummarySupplierCost[];
  listFilter: SummarySupplierCost[];
  listSupplier: Supplier[];
  _supplierId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listTinhtrang = [{ id: 0, text: "Khởi tạo" }, { id: 1, text: "Chuyển duyệt" }, { id: 2, text: "Đã chi" }, { id: 3, text: "Từ chói" }, { id: 4, text: "Tất cả" }]
  listBranch: Branch[];
  acceptPermission: boolean = false;
  closingPermission: boolean = false;
  selectedtinhtrang = 4;
  filterColumns: { [key: string]: string } = {};
  userLoged?: Profile;
  itemSelected = false;
  totalAmount = 0;
  _auth = 5;
  _acc = false;
  selectedValue: SummarySupplierCost;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalSummarySupplierCostComponent, { static: false }) modalAddEdit: ModalSummarySupplierCostComponent
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService, private suppliertSerive: SupplierService,
    public datepipe: DatePipe, private service: SummarySupplierCostsService, private authService: AuthService, private branchService: BranchService, private _export: ExportService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this._acc = this.authService.hasPermission('ADVANCE_ACCOUNT') || this.authService.hasPermission('F018_ACCOUNT');
    this.acceptPermission = authService.hasPermission('F018_ACCEPT') || this.userLoged.isAdmin;
    this.closingPermission = authService.hasPermission('F018_CLOSING') || this.userLoged.isAdmin;
    this._branchId = Number.parseInt(this.userLoged.branchId);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadSupplier();
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.timKiem();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  changedSupplier(event: Supplier) {
    this._supplierId = event?.id;
    this.timKiem();
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this._branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }


  changedType(event: any): void {
    // let _id=event?.id;
    this.timKiem();
  }


  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('supplierId', this._supplierId?.toString())
      .set('branchId', this._branchId?.toString())
    this.busy = this.service.getPaging(params).subscribe((res: ResponseValue<Pagination<SummarySupplierCost>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSummarySupplierCost = res.data?.items;
        this.filterData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  filterData() {
    this.listFilter = this.listSummarySupplierCost.filter(item => {
      return Object.keys(this.filterColumns).every(key => {
        const filterValue = this.filterColumns[key]?.toString().trim().toLowerCase();
        if (!filterValue) return true; // Nếu không có giá trị lọc, bỏ qua

        const itemValue = key === "refDate"
          ? this.datepipe.transform(item[key], "dd/MM/yyyy")?.toLowerCase()
          : item[key]?.toString().trim().toLowerCase();

        return itemValue?.includes(filterValue);
      });
    });
    this.calculator();
  }

  calculator() {
    this.totalAmount = this.listFilter.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
  clickRow(item: SummarySupplierCost): void {
    this.listFilter = this.listFilter.map(x => ({
      ...x,
      checked: x.id === item.id ? !x.checked : false
    }));
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(0);
    }, 50);
  }

  edit(flag: boolean): void {
    const value = this.listFilter.filter(x => x.checked);
    debugger;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(value[0].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let item = this.listFilter.filter(x => x.checked);
    if (item[0].status > 1 || item[0].createdBy != this.userLoged.id) return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(item[0].id));
  }

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listFilter.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listFilter)
      return this.listFilter.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listFilter.filter(x => x.checked);
    if (checks.length == 1) {
      this.itemSelected = true;
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.itemSelected = true;
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.itemSelected = false;
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: SummarySupplierCost) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true);
    }, 50);
  }
  viewAccounts = false;
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent;

  showPhieuChi(entity: SummarySupplierCost) {
    this.selectedValue = entity;
    let item: any = {};
    item.groupType = 3;
    item.supplierId = entity.supplierId;
    item.amount = entity.amount;
    item.refNo = entity.refNo;
    item.notes = entity.contents;
    item.accountid = entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalPhieuChi.add(item);
    }, 50);
  }
  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      let item = Object.assign({}, this.selectedValue);
      item.status = 2;
      this.service.update(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
      });
    }
  }
  closeAccounts(): void {
    this.viewAccounts = false;
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
