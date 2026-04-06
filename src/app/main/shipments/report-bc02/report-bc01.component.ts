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
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-report-bc01',
  templateUrl: './report-bc01.component.html',
  styleUrls: ['./report-bc01.component.css']
})
export class ReportBc01Component implements OnInit {
  totalRows = 0;
  soTien=0;
  tienVat=0;
  tongTien=0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: ReportViewModel[];
  listFilter:ReportViewModel[]=[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  _type=0;
  _quyen=5;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  viewModalJob = false;

  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Chưa duyệt" }, { "value": 2, "text": "Duyệt" }];
  selectedType:number=0;
  makhSearch?: string = '';
  lohangSearch?: string = '';
  tokhaiSearch?: string = '';
  vandonSearch?: string = '';
  sobookingearch: string = '';
  sodebitSearch:string='';
  loaihinhSearch: string = '';
  ngaySearch: string = '';
  maphiSearch: string = '';
  luonghangSearch: string = '';
  referCodeSearch: string = '';
  hoadonSearch: string = '';
  noidungSearch: string = '';
  tenkhSearch: string = '';
  sotienSearch: string = '';
  vatSearch: string = '';
  sotienvatSearch: string = '';
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService,private spinner: NgxSpinnerService,
    private branchService:BranchService,private router: Router) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('REPORT01');
    localStorage.removeItem('REPORT01');
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

  changedCustomer(){
    this.loadData();
  }

  changedType(): void {
     this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branchId?.toString())
      .set('keyword', this.keyword)
    this.busy = this.reportsService.getReport02(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.filter();
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        this.spinner.hide();
      }
    });
  }
filter() {
    this.listFilter = Object.assign([], this.listData);
    if(this.selectedType>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType==1? !data.trangThai:data.trangThai;
      });
    }
    if (this.makhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerCode
          ?.toString()
          .toLowerCase()
          .includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if (this.sodebitSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.chiNhanh
          ?.toString()
          .toLowerCase()
          .includes(this.sodebitSearch.trim().toLocaleLowerCase());
      });

    if (this.lohangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId
          ?.toLowerCase()
          .includes(this.lohangSearch.trim().toLocaleLowerCase());
      });
    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode
          ?.toLowerCase()
          .includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });
    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });

    if (this.vandonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL
          ?.toLowerCase()
          .includes(this.vandonSearch.trim().toLocaleLowerCase());
      });
    if (this.sobookingearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo?.toString()
          .toLowerCase()
          .includes(this.sobookingearch.trim().toLocaleLowerCase());
      });

    if (this.loaihinhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.loaiHinh
          ?.toString()
          .toLowerCase()
          .includes(this.loaihinhSearch.trim().toLocaleLowerCase());
      });

    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ngay
          ?.toString()
          .toLowerCase()
          .includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.maphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.maPhi
          ?.toString()
          .toLowerCase()
          .includes(this.maphiSearch.trim().toLocaleLowerCase());
      });
    if (this.luonghangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cbm?.toString()
          .toLowerCase()
          .includes(this.luonghangSearch.trim().toLocaleLowerCase());
      });
    if (this.hoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soHoaDon
          ?.toString()
          .toLowerCase()
          .includes(this.hoadonSearch.trim().toLocaleLowerCase());
      });

    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ghiChu
          ?.toString()
          .toLowerCase()
          .includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.tenkhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName?.toString()
          .toLowerCase()
          .includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
      if(this.sotienSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
        return data.soTien?.toString().toLowerCase().includes(this.sotienSearch.trim().toLocaleLowerCase());
      });
      if(this.vatSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
        return data.vat?.toString().toLowerCase().includes(this.vatSearch.trim().toLocaleLowerCase());
      });
      if(this.sotienvatSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
        return data.tongTien?.toString().toLowerCase().includes(this.sotienvatSearch.trim().toLocaleLowerCase());
      });
      this.calculate();
  }
  calculate(){
    this.soTien=0;
    this.tienVat=0;
    this.tongTien=0;
    this.totalRows=this.listFilter.length;
    this.listFilter.forEach(it=>{
      this.soTien+=it.soTien;
      this.tienVat+=it.vat;
      this.tongTien+=it.tongTien
    })
  }
  timKiem(): void {
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.loadData();
  }

  showDebit(item: ReportViewModel): void {
    let p={
      d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId:this._customerId,
      type:this._type,
      branchId:this._branchId
    }
    UtilityService.setLocalParams(p,'REPORT01');
    let id=item.id;
    if(item.n==0)
    this.router.navigateByUrl('/main/shipments/debit-notes/detail/' + id.toString() + '/' + true);
    else if(item.n==1)
    this.router.navigateByUrl('/main/advance-payment/payment/detail/' + id + '/' + true);
    else
    alert('Chưa có thông tin!');
  }

  showPayment(item: ReportViewModel): void {
    let p={
      d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId:this._customerId,
      type:this._type
    }
    UtilityService.setLocalParams(p,'REPORT01');
    let id=item.id;
    this.router.navigateByUrl('/main/advance-payment/payment/detail/' + id + '/' + true);
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
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branchId?.toString())
    this.busy = this.reportsService.exportReport02(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
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
