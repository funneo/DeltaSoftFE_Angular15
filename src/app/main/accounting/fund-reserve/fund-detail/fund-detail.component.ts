import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Pagination, Employee, ResponseValue, Branch, AccountList, FundReserve, FundReserveDetail } from '@app/shared/models';
import { EmployeeService, NotificationService, AccountsService, UtilityService, AuthService, AccountListService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-fund-detail',
  templateUrl: './fund-detail.component.html',
  styleUrls: ['./fund-detail.component.css']
})
export class FundDetailComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listFundReserve: FundReserve[];
  busy: Subscription;
  viewModal = false;
  listAccountList: AccountList[];
  _accountListId: number;
  _branchId: number;
  currency: string='VND';
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalPhieuThuComponent, { static: false }) modalPhieuThu: ModalPhieuThuComponent
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent
  constructor(private accountsService: AccountsService, private notificationService: NotificationService, private _utilityService: UtilityService,
  private activatedRoute: ActivatedRoute, private authService: AuthService, private accountListService: AccountListService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
    // console.log(params);
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

    // this._accountListId = this.activatedRoute.snapshot.params["id"];
    this._accountListId=parseInt(params.id);
    this.loadQuy();
    this.loadDataDetail();
    });
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadDataDetail();
  }

  loadQuy() {
    // const params = new HttpParams()
    //   .set('branchId', this._branchId.toString());
    this.accountListService.getDetail(this._accountListId?.toString()).subscribe((res: ResponseValue<AccountList>) => {
      this.listAccountList = [];
      this.listAccountList.push(res.data);
    });
  }

  changedQuy(event: AccountList) {
    this._accountListId = event?.id;
    this.currency = event?.currency;
    this.loadDataDetail();
  }

  loadDataDetail(): void {
    // console.log('Ok');
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('accountListId', this._accountListId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.accountsService.getFundReserveDetail(params).subscribe((res: ResponseValue<FundReserveDetail>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFundReserve=[];
        let list = res.data?.listAccounts;
        // let ngaykc =new Date(moment(res.data?.ngayKetChuyen, "YYYYMMDD").format("MM/DD/YYYY"));
        // if (this.ngayBatDau<ngaykc) {
        //   this.ngayBatDau = ngaykc;
        //   alert("Ngày bắt đầu không nhỏ hơn ngày kết chuyển quỹ!" + moment(res.data?.ngayKetChuyen, "YYYYMMDD").format("DD/MM/YYYY"));
        // }
        // if (this.ngayKetThuc < this.ngayBatDau)
        //   this.ngayKetThuc = this.ngayBatDau;


        this.totalRows = res.data?.totalRows;
          let sd = res.data?.tonDauKy;
          this.listFundReserve.push({ id: 0, refNo: 'Số dư đầu kỳ', currency: this.currency, soDu: sd });
          if (list.length > 0) {
          list.forEach(x => {
            if (x.type == 1) {
              sd = sd - x.amount;
              this.listFundReserve.push({
                id: x.id, refDate: x.refDate,effectiveDate:x.effectiveDate, refNo: x.refNo, documentNo: x.documentNo, invoiceNo: x.invoiceNo,
                contents: x.contents, currency: this.currency, thu: 0, chi: x.amount, soDu: sd,type:x.type
              });
            }
            else {
              sd = sd + x.amount;
              this.listFundReserve.push({
                id: x.id, refDate: x.refDate,effectiveDate:x.effectiveDate,  refNo: x.refNo, documentNo: x.documentNo, invoiceNo: x.invoiceNo,
                contents: x.contents, currency: this.currency, thu: x.amount, chi: 0, soDu: sd,type:x.type
              });
            }

          });
        }
          this.listFundReserve.push({ id: 0, refNo: 'Số dư cuối kỳ', currency: this.currency, soDu: res.data?.tonCuoiKy });
          // console.log(this.listFundReserve);
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

  exportExcel():void{
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('accountListId', this._accountListId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.accountsService.exportExcelDetail(params).subscribe((res: ResponseValue<FundReserveDetail>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl  + res.data;
        a.download;
        a.click();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  showModal(item: FundReserve) {
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
