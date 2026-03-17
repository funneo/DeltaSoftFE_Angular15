import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, Pagination, ReportViewModel, ResponseValue, Supplier } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, NotificationService, ReportsService, UtilityService } from '@app/shared/services';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-revenue-filter',
  templateUrl: './report-revenue-filter.component.html',
  styleUrls: ['./report-revenue-filter.component.css']
})
export class ReportRevenueFilterComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  soTien=0;
  tienVat=0;
  tongTien=0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  makhSearch:string;
  tenkhSearch:string;
  loaihinhSearch:string;
  lohangSearch:string;
  tokhaiSearch:string;
  ngaytokhaiSearch:string;
  vandonSearch:string;
  sobookingSearch:string;
  luonghangSearch:string;
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
  listTypes = [{ id: 0, text: 'Theo lô hàng' }, { id: 1, text: 'Theo khách hàng' }];
  _type=0;
  _quyen=5;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService,
    private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
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

  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.makhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerCode.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if(this.tenkhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if(this.lohangSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.jobId?.toLowerCase().includes(this.lohangSearch.trim().toLocaleLowerCase());
    });
    if(this.tokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
    });

    if(this.vandonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.vandonSearch.trim().toLocaleLowerCase());
    });
    if(this.sobookingSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.sobookingSearch.trim().toLocaleLowerCase());
    });
    if(this.luonghangSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.luongHang?.toLowerCase().includes(this.luonghangSearch.trim().toLocaleLowerCase());
    });
    this.calculate();
  }

  calculate(){
    this.soTien=0;
    this.tienVat=0;
    this.tongTien=0;
    this.totalRows=this.listFilter.length;
    this.listFilter.forEach(it=>{
      this.soTien+=it.doanhThuTong;
      this.tienVat+=it.doanhThuVat;
      this.tongTien+=it.doanhThuTongVat
    })
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
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', this._type.toString());
    this.busy = this.reportsService.getRevenue(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.listFilter=res.data?.items;
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

  viewModalJob=false;
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
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
      .set('type', this._type.toString());
    this.busy = this.reportsService.exportRevennue(params).subscribe((res: ResponseValue<string>) => {
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
