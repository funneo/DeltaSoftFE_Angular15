import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Pagination, Employee, ResponseValue, Branch, AccountList, FundReserve, FundReserveDetail, AccountingDebitCredit } from '@app/shared/models';
import { EmployeeService, NotificationService, AccountsService, UtilityService, AuthService, AccountListService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-accounting-debit-credit',
  templateUrl: './accounting-debit-credit.component.html',
  styleUrls: ['./accounting-debit-credit.component.css']
})
export class AccountingDebitCreditComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDebitCredits: AccountingDebitCredit[];
  busy: Subscription;
  viewModal = false;
  _branchId: number;
  currency: string;
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
   constructor(private accountsService: AccountsService, private notificationService: NotificationService, private _utilityService: UtilityService,
    private employeeService: EmployeeService, private authService: AuthService, private accountListService: AccountListService, private router: Router) {
      let user = this.authService.getLoggedInUser();
      this._branchId = Number.parseInt(user.branchId);
     }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
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
      .set('branchId', this._branchId.toString());
    this.busy = this.accountsService.getAccountingDebitCredit(params).subscribe((res: ResponseValue<Pagination<AccountingDebitCredit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebitCredits = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  timKiem(): void {
    this.pageIndex = 1;
     this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  showDetail(item: AccountingDebitCredit) {
    this.router.navigateByUrl('/main/accounting/accounting-debit-credit/detail/'+ item.categoryCode);
  }

  closeModal(): void {
    this.viewModal = false;
  }
}
