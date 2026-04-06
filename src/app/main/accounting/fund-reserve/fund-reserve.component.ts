import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Pagination, Employee, ResponseValue, Branch, AccountList, FundReserve, FundReserveDetail } from '@app/shared/models';
import { EmployeeService, NotificationService, AccountsService, UtilityService, AuthService, AccountListService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
// import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
// import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';

@Component({
  selector: 'fund-reserve',
  templateUrl: './fund-reserve.component.html',
  styleUrls: ['./fund-reserve.component.css']
})
export class FundReserveComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listFundReserve: FundReserve[];
  busy: Subscription;
  viewModal = false;

  listAccountList: AccountList[];
  accountListId: number;
  // isDetail: boolean = false;
  currency: string;
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  _branchId: number;
 _auth=5;
  constructor(private accountsService: AccountsService, private notificationService: NotificationService, private _utilityService: UtilityService,
    private branchService: BranchService, private authService: AuthService, private accountListService: AccountListService, private router: Router) {
      let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
    }

  ngOnInit(): void {

    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
   this.loadBranch();
    this.loadQuy();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.accountListId=null;
    this.loadQuy();
   this.timKiem();
  }


  loadQuy() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.accountListService.getAll(params).subscribe((res: ResponseValue<AccountList[]>) => {
      this.listAccountList = res.data;
    });
  }

  changedQuy(event: AccountList) {
    this.accountListId = event?.id;
    this.currency = event?.currency;
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
      .set('accountListId', this.accountListId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.accountsService.getFundReserve(params).subscribe((res: ResponseValue<Pagination<FundReserve>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFundReserve = res.data?.items;
        this.totalRows = res.data?.totalRows;
        if(this.accountListId==null){
          let _dauky=0;
          let _thu=0;
          let _chi=0;
          let _cuoi=0;
          this.listFundReserve.forEach(x=>{
            _dauky+=x.dauKy;
            _thu+=x.thu;
            _chi+=x.chi;
            _cuoi+=x.cuoiKy;
          });
          this.listFundReserve.push({tenQuy: 'Tổng cộng:',dauKy:_dauky,thu:_thu,chi:_chi,cuoiKy:_cuoi,id:0});
        }
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

  showDetail(item: FundReserve) {
    this.router.navigateByUrl('/main/accounting/fund-reserve/detail/'+ item.id.toString());
  }

  closeModal(): void {
    this.viewModal = false;
  }


}
