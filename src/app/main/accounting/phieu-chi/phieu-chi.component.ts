import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Pagination, Employee, ResponseValue, AccountList, Branch, PrintForm } from '@app/shared/models';
import { EmployeeService, NotificationService, AccountsService, UtilityService, AccountListService, AuthService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { DatePipe } from '@angular/common';
import { ExportService } from '@app/shared/services/export-excel.service';
import { ModalPhieuChiMultiComponent } from '@app/shared/components/accounting/modal-phieu-chi-multi/modal-phieu-chi-multi.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-phieu-chi',
  templateUrl: './phieu-chi.component.html',
  styleUrls: ['./phieu-chi.component.css']
})
export class PhieuChiComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  totalAmount = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listAccounts: Accounts[];
  listFilter: Accounts[];
  listEmployee: Employee[];
  _employeeId?: number;
  _branchId: number;
  _accountListId: number;
  busy: Subscription;
  viewModal = false;
  viewModalChi = false;
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listAccountList: AccountList[];
  listTransfer = [{ id: 0, text: 'Tiền mặt' }, { id: 1, text: 'Chuyển khoản' }, { id: 2, text: 'Tất cả' }];
  _transfer: number = 2;
  listBranch: Branch[];
  _auth: number = 5;

  refNoSearch?: string = '';
  ngaylapSearch?: string = '';
  nguoilapSearch: string = '';
  thuquySearch: string = '';
  ngaySearch?: string = '';
  donviSearch?: string = '';
  soctSearch?: string = '';
  sotienSearch?: string = '';
  tienteSearch?: string = '';
  quySearch?: string = '';
  noidungSearch?: string = '';
  ghichuSearch?: string = '';
  isAdmin = false;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalAddEditChi: ModalPhieuChiComponent
  @ViewChild(ModalPhieuChiMultiComponent, { static: false }) modalAddEdit: ModalPhieuChiMultiComponent
  constructor(private accountsService: AccountsService, private notificationService: NotificationService, private _utilityService: UtilityService, private employeeService: EmployeeService,
    public datepipe: DatePipe, private _export: ExportService, private spinner: NgxSpinnerService,
    private accountListService: AccountListService, private authService: AuthService, private branchService: BranchService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
    this.isAdmin = user.isAdmin;
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadEmployee();
    this.loadQuy();
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

  loadEmployee() {
    const params = new HttpParams();
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event: Employee) {
    // this._employeeId = event?.id;
    this.timKiem();
  }

  loadQuy() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.accountListService.getAll(params).subscribe((res: ResponseValue<AccountList[]>) => {
      this.listAccountList = res.data;
    });
  }

  changedQuy(event: AccountList) {
    // this._accountListId = event?.id;
    this.timKiem();
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
      .set('employeeId', this._employeeId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('accountListId', this._accountListId?.toString())
      .set('iTransfer', this._transfer?.toString())
      .set('type', '1');
    this.busy = this.accountsService.getPaging(params).subscribe((res: ResponseValue<Pagination<Accounts>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listAccounts = res.data?.items;
        this.listFilter = this.listAccounts;
        this.calculator();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  filter() {
    this.listFilter = Object.assign([], this.listAccounts);
    if (this.refNoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo.toString().toLowerCase().includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if (this.donviSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeName?.toLowerCase().includes(this.donviSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
    if (this.thuquySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tenThuQuy.toLowerCase().includes(this.thuquySearch.trim().toLocaleLowerCase());
      });
    if (this.soctSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.documentNo?.toLowerCase().includes(this.soctSearch.trim().toLocaleLowerCase());
      });
    if (this.sotienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.amount?.toString().toLowerCase().includes(this.sotienSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.contents?.toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.quySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.accountListName?.toLowerCase().includes(this.quySearch.trim().toLocaleLowerCase());
      });
    if (this.tienteSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.currency?.toLowerCase().includes(this.tienteSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.effectiveDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.ngaylapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaylapSearch.trim().toLocaleLowerCase());
      });
    this.calculator();
  }
  calculator() {
    this.totalAmount = 0;
    this.totalRows = this.listFilter?.length;
    this.listFilter.forEach(it => {
      this.totalAmount += it.amount;
    })
  }

  clickRow(item: Accounts): void {
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
    this.viewModalChi = true;
    setTimeout(() => {
      this.modalAddEditChi.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listAccounts.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listAccounts[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listAccounts.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.accountsService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listAccounts.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listAccounts)
      return this.listAccounts.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listAccounts.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: Accounts) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  closeModalChi(): void {
    this.viewModal = false;
  }

  exportExcel(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('accountListId', this._accountListId?.toString())
      .set('iTransfer', this._transfer?.toString())
      .set('type', '1');
    this.busy = this.accountsService.exportExcel(params).subscribe((res: ResponseValue<Pagination<Accounts>>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl + res.data;
        a.download;
        a.click();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  export() {
    this._export.exportExcel(this.listFilter, 'bao-cao-phieu-chi');
  }

  print() {
    let listChecks = this.listAccounts.filter(x => x.checked);
    if (listChecks.length == 0) {
      this.notificationService.printErrorMessage("Vui lòng chọn phiếu để in!");
      return;
    }
    this.spinner.show();
    let printContents = '';
    let count = 0;
    listChecks.forEach(item => {
      this.accountsService.getDetail(item.id.toString()).subscribe((res: ResponseValue<Accounts>) => {
        if (res.code == '200' || res.code == '201') {
          let entity = res.data;
          let _entity: any = {};
          if (entity.tenDonVi == entity.represent)
            entity.tenDonVi = '';
          _entity.TongTien = entity.amount;
          _entity.NgayThuChi = moment(entity.refDate, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATEVN
          );
          _entity.SoPhieu = entity.refNo;
          _entity.ChungTuSo = entity.documentNo ?? '';
          _entity.TenKhachHang = entity.tenDonVi ?? '';
          _entity.NoiDung = entity.contents ?? '';
          _entity.TienTe = entity.currency ?? '';
          _entity.TenCongTy = entity.ctyName ?? '';
          _entity.DiaChiCongTy = entity.ctyAdd ?? '';
          _entity.DaiDien = entity.represent ?? '';
          _entity.TenQuy = entity.tenQuy ?? '';
          _entity.ThuQuy = entity.tenThuQuy ?? '';
          _entity.LapPhieu = entity.tenThuQuy ?? ''

          let noiDung: string = "";
          let list = localStorage.getItem(SystemContstants.LISTMAUIN);
          if (list != null) {
            let listMauIn: PrintForm[] = JSON.parse(list);
            let index = listMauIn.findIndex(x => x.type == 2);
            if (index != -1)
              noiDung = listMauIn[index].content;
          }
          let content = this._utilityService.PrintPhieuThu(noiDung, _entity);
          printContents += '<div class="kho-giay page-a4" style="page-break-after: always;">' + content + '</div>';
          count++;
          if (count == listChecks.length) {
            this.spinner.hide();
            var newWin = window.frames["printf"];
            newWin.document.write(`
              <html>
                <head>
                  <title>Phiếu chi</title>
                  <link rel="stylesheet" type="text/css" href="../../../assets/css/print.css" />
                  <style>
                    @media print {
                      body { padding: 0 !important; }
                      .page-a4 { padding: 0.5cm 1cm 1cm 1cm !important; box-sizing: border-box; width: 100%; height: 100%; }
                    }
                  </style>
                </head>
                <body onload="window.print(); window.close()">${printContents}</body>
              </html>`
            );
            newWin.document.close();
          }
        }
      });
    });
  }
}
