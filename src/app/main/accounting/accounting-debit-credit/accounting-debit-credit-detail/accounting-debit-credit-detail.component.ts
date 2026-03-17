import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, AccountList, FundReserve, FundReserveDetail, AccountingDebitCredit, OtherCategories, Pagination } from '@app/shared/models';
import { NotificationService, AccountsService, UtilityService, AuthService, OtherCategoriesService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';

@Component({
  selector: 'app-accounting-debit-credit-detail',
  templateUrl: './accounting-debit-credit-detail.component.html',
  styleUrls: ['./accounting-debit-credit-detail.component.css']
})
export class AccountingDebitCreditDetailComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDatas: AccountingDebitCredit[];
  busy: Subscription;
  viewModal = false;
  listAccountList: OtherCategories[];
  _accountListId: string;
  _branchId: number;
  // currency: string;
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalPhieuThuComponent, { static: false }) modalPhieuThu: ModalPhieuThuComponent;
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent;
  constructor(private accountsService: AccountsService, private notificationService: NotificationService, private _utilityService: UtilityService,
    private activatedRoute: ActivatedRoute, private authService: AuthService, private otherCategoriesService: OtherCategoriesService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadOtherCategory();
    this._accountListId = this.activatedRoute.snapshot.params["id"];
    this.loadDataDetail();

  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadDataDetail();
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'ACCOUNTING');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listAccountList = res.data;     
    });
  }

  changedTaiKhoan(event: OtherCategories) {
    this._accountListId = event?.categoryCode;   
    this.loadDataDetail();
  }

  loadDataDetail(): void {
    if(this._accountListId==null || this._accountListId=='')
    return;
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('categoryCode', this._accountListId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.accountsService.getAccountingDebitCreditDetail(params).subscribe((res: ResponseValue<Pagination<AccountingDebitCredit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDatas = res.data.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadDataDetail();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;

    this.loadDataDetail();
  }

  showModal(item: AccountingDebitCredit) {
    this.viewModal = true;
    if (item.type == 0) {
      setTimeout(() => {
        this.modalPhieuThu.edit(item.id.toString(), true);
      }, 50);
    }
    else {
      setTimeout(() => {
        this.modalPhieuChi.edit(item.id.toString(), true);
      }, 50);
    }
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
