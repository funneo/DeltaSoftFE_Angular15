import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Pagination, Employee, ResponseValue, Branch, AccountList, FundReserve, FundReserveDetail, EmployeeDebit } from '@app/shared/models';
import { EmployeeService, NotificationService, AccountsService, UtilityService, AuthService, AccountListService, BranchService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { EmployeeDebitService } from '@app/shared/services/employee-debit.service';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

import { EmployeeDebitCreditDetailComponent } from './employee-debit-credit-detail/employee-debit-credit-detail.component';

@Component({
  selector: 'app-employee-debit-credit',
  templateUrl: './employee-debit-credit.component.html',
  styleUrls: ['./employee-debit-credit.component.css']
})
export class EmployeeDebitCreditComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  totalAmount = 0;
  totalRowsTimeRange = 0;
  totalAmountTimeRange = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDebitCredits: EmployeeDebit[];
  listDebitCreditsTimeRange: EmployeeDebit[];
  busy: Subscription;
  viewModal = false;
  _branchId: number;
  _branckIdTimeRange: number;
  _employeeIdTimeRange: number;
  _quyen: number;
  listBranch: Branch[];
  currency: string;
  ngayKetChuyen: Date;
  listEmployee: Employee[];
  listEmployeeTimeRange: Employee[];
  listEmployeeOrigin: Employee[] = [];
  _employeeId: number;
  ngayRealtime: Date = new Date();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  dateOptionsSingle = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  constructor(private employeeDebitService: EmployeeDebitService, private notificationService: NotificationService, private _utilityService: UtilityService,
    private authService: AuthService, private router: Router, private branchService: BranchService, private employeeService: EmployeeService, private exportService: ExportService, private spinner: NgxSpinnerService) {
    let user = this.authService.getLoggedInUser();
    this._quyen = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
    this._branckIdTimeRange = Number.parseInt(user.branchId);
  }
  isTransfer: boolean = false;

  ngOnInit(): void {
    this.dateOptionsSingle.autoUpdateInput = true;
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadDataByTimeRange();
    this.loadBranch();
    this.loadEmployee();
  }

  changedEmployee() {
    this.timKiemSingle();
  }
  changedEmployeeTimeRange() {
    this.timKiem();
  }
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
      if (this.listBranch) {
        this.listBranch.unshift({ id: 0, branchCode: "Tất cả", branchName: "Tất cả" });
      }
    });
  }

  loadEmployee() {
    if (this.listEmployeeOrigin && this.listEmployeeOrigin.length > 0) {
      // Already loaded
    } else {
      const params = new HttpParams();
      this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
        this.listEmployeeOrigin = res.data || [];
        this.filterEmployeeLocal(this._branchId, false);
        this.filterEmployeeLocal(this._branckIdTimeRange, true);
      });
    }
  }

  filterEmployeeLocal(branchId: number, isTimeRange: boolean) {
    let targetList: Employee[];
    if (branchId && branchId > 0) {
      targetList = this.listEmployeeOrigin.filter(x => x.branchId == branchId);
    } else {
      targetList = [...this.listEmployeeOrigin];
    }
    targetList.unshift({ id: 0, employeeFullName: "Tất cả", employeeCode: "All" });

    if (isTimeRange) {
      this.listEmployeeTimeRange = targetList;
    } else {
      this.listEmployee = targetList;
    }
  }

  changedBranch() {
    this._employeeId = 0;
    this.filterEmployeeLocal(this._branchId, false);
    this.timKiemSingle();
  }
  changedBranchTimeRange() {
    this._employeeIdTimeRange = 0;
    this.filterEmployeeLocal(this._branckIdTimeRange, true);
    this.timKiem();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }
  selectedDateSingle(event) {
    this.ngayRealtime = new Date(event.start);
    this.timKiemSingle();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayRealtime).format('YYYYMMDDHHMMSS');
    let params = new HttpParams()
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('branchId', this._branchId.toString());
    if (this._employeeId) {
      params = params.set('employeeId', this._employeeId.toString());
    }
    params = params.set('isTransfer', this.isTransfer ? 'true' : 'false');
    this.spinner.show('spinner-1');
    this.busy = this.employeeDebitService.report01(params).subscribe((res: ResponseValue<EmployeeDebit[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebitCredits = res.data;
        this.totalRows = this.listDebitCredits?.length;
        this.totalAmount = this.listDebitCredits?.reduce((sum, current) => sum + (current.debitBalance ?? 0), 0);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
      this.spinner.hide('spinner-1');
    });
  }
  loadDataByTimeRange(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    let params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branckIdTimeRange ? this._branckIdTimeRange.toString() : '0');
    if (this._employeeIdTimeRange) {
      params = params.set('employeeId', this._employeeIdTimeRange.toString());
    }
    params = params.set('isTransfer', this.isTransfer ? 'true' : 'false');
    this.spinner.show('spinner-2');
    this.busy = this.employeeDebitService.report02(params).subscribe((res: ResponseValue<EmployeeDebit[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebitCreditsTimeRange = res.data;
        this.totalRowsTimeRange = this.listDebitCreditsTimeRange?.length;
        this.totalAmountTimeRange = this.listDebitCreditsTimeRange?.reduce((sum, current) => sum + (current.debitBalance ?? 0), 0);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
      this.spinner.hide('spinner-2');
    });
  }

  timKiemSingle(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadDataByTimeRange();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  // showDetail(item: EmployeeDebit) {
  //   //this.router.navigateByUrl('/main/accounting/employee-debit-credit/detail/'+ item.employeeId);
  // }
  @ViewChild('detailModal', { static: false }) detailModal: EmployeeDebitCreditDetailComponent;

  showDetail(item: EmployeeDebit) {
    const empId = item.employeeId ?? item.id;
    if (!empId) {
      this.notificationService.printErrorMessage('Không tìm thấy thông tin nhân viên!');
      return;
    }
    this.detailModal.show(empId, moment(this.ngayBatDau).format('YYYYMMDD'), moment(this.ngayKetThuc).format('YYYYMMDD'));
  }

  closeModal(): void {
    this.viewModal = false;
  }

  exportTab1() {
    if (!this.listDebitCredits || this.listDebitCredits.length === 0) {
      this.notificationService.printErrorMessage("Không có dữ liệu để xuất!");
      return;
    }
    const data = this.listDebitCredits.map(item => ({
      'Chi nhánh': item.branchCode,
      'Nhân viên': item.employeeName,
      'Tổng hạn mức': item.hanMucTong,
      'Dư nợ hiện tại': item.debitBalance
    }));
    this.exportService.exportExcel(data, 'BaoCaoCongNoNhanVien_ThoiDiem');
  }

  exportTab2() {
    if (!this.listDebitCreditsTimeRange || this.listDebitCreditsTimeRange.length === 0) {
      this.notificationService.printErrorMessage("Không có dữ liệu để xuất!");
      return;
    }
    const data = this.listDebitCreditsTimeRange.map(item => ({
      'Chi nhánh': item.branchCode,
      'Nhân viên': item.employeeName,
      'Tổng hạn mức': item.hanMucTong,
      'Dư nợ đầu kỳ': item.hanMucCon,
      'Phát sinh Nợ': item.credit,
      'Phát sinh Có': item.debit,
      'Dư nợ cuối': item.debitBalance
    }));
    this.exportService.exportExcel(data, 'BaoCaoCongNoNhanVien_TheoKy');
  }

}
