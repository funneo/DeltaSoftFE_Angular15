import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, Pagination, ReportViewModel, ResponseValue, Supplier } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, NotificationService, ReportsService, UtilityService } from '@app/shared/services';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'report-cp03-filter',
  templateUrl: './report-cp03-filter.component.html',
  styleUrls: ['./report-cp03-filter.component.css']
})
export class ReportCp03FilterComponent implements OnInit {
  pageIndex = 1;
  pageSize = 999999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  soTien=0;
  tienVat=0;
  tongTien=0;
  listData: ReportViewModel[];
  listFilter:ReportViewModel[]=[];
  listSupplier: Supplier[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listTypes = [{ id: 0, text: 'Debit-note' }, { id: 1, text: 'Thanh toán' },{ id: 2, text: 'Chênh lệch (!=0)' }];
  _type=0;
  _quyen=5;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  viewModalJob = false;
  //Khai báo các biến search
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
  hoadonSearch: string = '';
  noidungSearch: string = '';
  tenkhSearch: string = '';
  sotienSearch: string = '';
  vatSearch: string = '';
  sotienvatSearch: string = '';
  _dateType=0;
  listTypes1 = [{ id: 0, text: 'Ngày doanh thu' }, { id: 1, text: 'Ngày vận hành' }];
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,private spinner: NgxSpinnerService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService,
    private branchService:BranchService,private router:Router) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('CP03');
    localStorage.removeItem('CP03');
    if(p!=null){
      this.ngayBatDau =new Date(p.d1);
      this.ngayKetThuc =new Date(p.d2);
      this._customerId=p.customerId;
      this._type=p.type;
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
  changedDateType(): void {
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
    this.spinner.show();
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', this._type.toString())
      .set('datetype', this._dateType.toString());
    this.busy = this.reportsService.getCp03(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.filter();
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
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
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
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
      .set('type', this._type.toString())
      .set('datetype', this._dateType.toString());
    this.busy = this.reportsService.exportCP03(params).subscribe((res: ResponseValue<string>) => {
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

  showDebit(item: ReportViewModel): void {
    let p={
      d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId:this._customerId,
      type:this._type,
      branchId:this._branchId
    }
    UtilityService.setLocalParams(p,'CP03');
    let id=item.id;
    this.router.navigateByUrl('/main/shipments/debit-notes/detail/' + id.toString() + '/' + true);
  }

  showPayment(item: ReportViewModel): void {
    let p={
      d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId:this._customerId,
      type:this._type,
      branchId:this._branchId
    }
    UtilityService.setLocalParams(p,'CP03');
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

}
