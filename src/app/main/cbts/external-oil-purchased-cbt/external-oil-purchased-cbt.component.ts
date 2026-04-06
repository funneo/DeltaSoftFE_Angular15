import { ExportService } from '@app/shared/services/export-excel.service';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalExternalOilPurchasedComponent } from '@app/shared/components/transports/modal-external-oil-purchased/modal-external-oil-purchased.component';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Branch, Employee, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { ExternalOilPurchased } from '@app/shared/models/transports/external-oil-purchased.model';
import { AccountsService, AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { ExternalOilPurchasedService } from '@app/shared/services/transports/external-oil-purchased.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-external-oil-purchased-cbt',
  templateUrl: './external-oil-purchased-cbt.component.html',
  styleUrls: ['./external-oil-purchased-cbt.component.css']
})
export class ExternalOilPurchasedCbtComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listItem: ExternalOilPurchased[] = [];
  listFilter: ExternalOilPurchased[] = [];
  listDriver: Employee[] = [];
  listBranch: Branch[] = [];
  driverId: number = 0;
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  viewModalPayment = false;
  viewModalReceipt = false;
  branchId?: number;

  sophieuSearch = '';
  ngaySearch = '';
  bksSearch = '';
  laixeSearch = '';
  soluongSearch = '';
  tongtienSearch = '';
  invoicenoSearch = '';
  invoicedateSearch = '';
  linkSearch = '';
  codeSearch = '';
  noteSearch = '';
  nhaccSearch = '';
  sophieuCBTSearch = '';
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalExternalOilPurchasedComponent, { static: false }) modalAddEdit: ModalExternalOilPurchasedComponent;
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent;
  @ViewChild(ModalPhieuThuComponent, { static: false }) modalPhieuThu: ModalPhieuThuComponent;

  constructor(
    private _utilityService: UtilityService,
    private externalOilPurchasedService: ExternalOilPurchasedService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService, private _authService: AuthService,
    private _export: ExportService, public datepipe: DatePipe,
    private accountsService: AccountsService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    //this.loadCustomer();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadDriver();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  showModal(item: ExternalOilPurchased) {
    this.viewModal = true;
    let permission = item.employeeId == Number.parseInt(this.userLoged.employeeId);
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, item.status < 1 ? false : true, permission);
    }, 50);
  }
  export() {
    let printList = this.listFilter.map(({ createdBy, id, branchId, vihicleId, status, closingBy, closingDate,
      employeeId, branchName, acceptedBy, acceptedDate, acceptedByName, checked, ...item }) => item);
    this._export.exportExcel(printList, 'mua-dau-ngoai-tien-mat');
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '999999')
      .set('branchid', this.userLoged.branchId)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword', this.keyword)
    // .set('usergroupid')
    this.busy = this.externalOilPurchasedService.getPaging(params, true).subscribe((res: ResponseValue<Pagination<ExternalOilPurchased>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listItem = res.data?.items;
        this.filter();
      }
      else {
        if (res.code == '204') {
          this.listItem = [];
          this.filter();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }
  filter() {
    this.listFilter = Object.assign([], this.listItem);
    if (this.tongtienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.amountAfterVat.toString().toLowerCase().includes(this.tongtienSearch.trim().toLocaleLowerCase());
      });
    if (this.soluongSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.quantity.toString().toLowerCase().includes(this.soluongSearch.trim().toLocaleLowerCase());
      });
    if (this.sophieuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo?.toLowerCase().includes(this.sophieuSearch.trim().toLocaleLowerCase());
      });
    if (this.sophieuCBTSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNoCbt?.toLowerCase().includes(this.sophieuCBTSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.bksSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.licensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
      });
    if (this.laixeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeFullName?.toLowerCase().includes(this.laixeSearch.trim().toLocaleLowerCase());
      });
    if (this.invoicenoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo?.toLowerCase().includes(this.invoicenoSearch.trim().toLocaleLowerCase());
      });
    if (this.invoicedateSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceDate?.toLowerCase().includes(this.invoicedateSearch.trim().toLocaleLowerCase());
      });
    if (this.linkSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.web?.toLowerCase().includes(this.linkSearch.trim().toLocaleLowerCase());
      });
    if (this.codeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.code?.toLowerCase().includes(this.codeSearch.trim().toLocaleLowerCase());
      });
    if (this.noteSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.notes?.toLowerCase().includes(this.noteSearch.trim().toLocaleLowerCase());
      });
    if (this.nhaccSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.supplierName?.toLowerCase().includes(this.nhaccSearch.trim().toLocaleLowerCase());
      });
    this.totalRows = this.listFilter.length;
  }

  loadDriver(): void {
    const params = new HttpParams()
      .set('branchId', this.userLoged.branchId)
    this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDriver = res.data;
      }
      else {
        if (res.code == '204') {
          this.listDriver = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }

  clickRow(item: ExternalOilPurchased): void {
    item.checked = !item.checked;
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
      this.modalAddEdit.add(false, null, null, null);
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listItem.findIndex(x => x.checked);
    this.viewModal = true;
    let permission = this.listItem[index].createdBy == this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listItem[index].id, flag, permission);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listItem.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    if (listChecks[0].status > 0) return;
    if (listChecks[0].createdBy != this.userLoged.id) return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.externalOilPurchasedService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listItem.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else {
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

  currentOilPurchaseId: number;

  openPayment(item: ExternalOilPurchased) {
    // Verify status from server first
    this.externalOilPurchasedService.getDetail(item.id).subscribe(res => {
      if (res.code == '200' && res.data) {
        const freshItem = res.data;
        if (freshItem.isCompleted) {
          this.notificationService.printErrorMessage("Phiếu này đã được thanh toán (cập nhật mới nhất từ server)!");
          this.loadData(); // Refresh local list
          return;
        }

        this.currentOilPurchaseId = freshItem.id;

        if (freshItem.amountAfterVat < 0) {
          const receiptItem: any = {
            amount: Math.abs(freshItem.amountAfterVat),
            refNo: freshItem.refNo,
            notes: `Thu tiền dầu mua ngoài - Xe: ${freshItem.licensePlates} - SL: ${freshItem.quantity}`,
            oilPurchaseId: freshItem.id,
            groupType: 3, // Defaults to Supplier
            supplierId: freshItem.supplierId,
            advanceId: freshItem.id, // Maps to @AdvanceId in SP
            typeAccount: 3 // 3: External Oil Purchased
          };
          this.viewModalReceipt = true;
          setTimeout(() => {
            this.modalPhieuThu.add(receiptItem);
          }, 50);
        } else {
          const paymentItem: any = {
            amount: freshItem.amountAfterVat,
            refNo: freshItem.refNo,
            notes: `Chi tiền dầu mua ngoài - Xe: ${freshItem.licensePlates} - SL: ${freshItem.quantity}`,
            oilPurchaseId: freshItem.id,
            groupType: 3, // Defaults to Supplier
            supplierId: freshItem.supplierId,
            advanceId: freshItem.id, // Maps to @AdvanceId in SP
            typeAccount: 3 // 3: External Oil Purchased
          };
          this.viewModalPayment = true;
          setTimeout(() => {
            this.modalPhieuChi.add(paymentItem);
          }, 50);
        }
      }
    });
  }

  onPaymentSuccess(accountId: any) {
    this.notificationService.printSuccessMessage("Đã tạo phiếu thành công!");
    this.loadData();
    this.viewModalPayment = false;
    this.viewModalReceipt = false;
  }



  closePaymentModal() {
    this.viewModalPayment = false;
    this.viewModalReceipt = false;
    this.loadData();
  }

  checkShowPayment(item: ExternalOilPurchased): boolean {
    if (item.isCompleted || item.cbtStatus >= 3) return false;
    if (!item.createdDate) return false;
    return moment(item.createdDate).isAfter(moment('2025-12-18T23:59:59.999'));
  }

}
