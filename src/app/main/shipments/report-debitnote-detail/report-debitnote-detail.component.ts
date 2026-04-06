import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Debt, Pagination, ResponseValue, Customer, Supplier, DebtReportViewModel, ReportViewModel, Branch } from '@app/shared/models';
import { NotificationService,  UtilityService, AuthService, CustomerService, ReportsService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-report-debitnote-detail',
  templateUrl: './report-debitnote-detail.component.html',
  styleUrls: ['./report-debitnote-detail.component.css']
})
export class ReportDebitnoteDetailComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  soTien=0;
  tienVat=0;
  tongTien=0;
  listData: ReportViewModel[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  _quyen=5;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  viewModalJob = false;
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService,
    private branchService:BranchService,private router: Router) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('RDEBITDETAIL');
    localStorage.removeItem('RDEBITDETAIL');
    if(p!=null){
      this.ngayBatDau =new Date(p.d1);
      this.ngayKetThuc =new Date(p.d2);
      this._customerId=p.customerId;
      this._branchId=p.branchId;
    }
    else{
      this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
      this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    }
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', '');
    this.busy = this.reportsService.getDebitNoteDetail(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.soTien=res.data?.totalAmount;
        this.tienVat=res.data?.totalVat;
        this.tongTien=res.data?.totalAmountVat;
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

  showDebit(item: ReportViewModel): void {
    let p={
      d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId:this._customerId,
      branchId:this._branchId
    }
    UtilityService.setLocalParams(p,'RDEBITDETAIL');
    let id=item.id;
    this.router.navigateByUrl('/main/shipments/debit-notes/detail/' + id.toString() + '/' + true);
  }

  showJob(item: ReportViewModel): void {
    if (item.shipmentId) {
      this.viewModalJob = true;
      setTimeout(() => {
        this.modalJob.edit(item?.shipmentId?.toString(), true);
      }, 50);
    }
  }
  closeModalJob() {
    this.viewModalJob = false;
  }

  exportExcel():void{
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', '');
    this.busy = this.reportsService.exportDebitNoteDetail(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
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
}
