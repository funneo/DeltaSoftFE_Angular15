import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, Pagination, ResponseValue } from '@app/shared/models';
import { R04Dt12 } from '@app/shared/models/reports/r04-dt12.model';
import { DispatchOrderFeeExport } from '@app/shared/models/transports/exports/dispatch-order-fee-export.model';
import { AuthService, BranchService, CustomerService, NotificationService, ReportsService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-bc04-dt12',
  templateUrl: './report-bc04-dt12.component.html',
  styleUrls: ['./report-bc04-dt12.component.css']
})
export class ReportBc04Dt12Component implements OnInit {
  keyword = '';
  keyword05 = '';
  pageIndex = 1;
  listCustomers:Customer[]=[];
  listData: R04Dt12[];
  listFilter: R04Dt12[] = [];
  listBC05: DispatchOrderFeeExport[]=[];
  _branchId: number;
  _branchId05: number;
  _customerId: number;
  busy: Subscription;
  viewModal = false;
  viewAddFee=false;
  
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  ngayBatDau05: Date = this._utilityService.ngayBanDau;
  ngayKetThuc05: Date = this._utilityService.ngayKetThuc;
  _type = 0;
  _quyen = 5;
  dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  listBranch: Branch[];

  constructor(
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private reportsService: ReportsService, private customerService: CustomerService,
    private authService: AuthService,private exportService: ExportService,
    private branchService: BranchService,private spinner: NgxSpinnerService,
  ) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._branchId05 = Number.parseInt(user.branchId);
    this._quyen = parseInt(user.authorisationLevel);
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService
      .getAll(params)
      .subscribe((res: ResponseValue<Customer[]>) => {
        this.listCustomers = res.data;
      });
  }


  ngOnInit(): void {
    var p = UtilityService.getLocalParams('REPORT04');
    localStorage.removeItem('REPORT04');
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this._branchId = p.branchId;
      this.keyword=p.keyword;
    } else {
      this.ngayBatDau = new Date(
        moment().hours(0).minutes(0).seconds(0).startOf('month').toString()
      );
      this.ngayKetThuc = new Date(
        moment().hours(23).minutes(59).seconds(59).endOf('month').toString()
      );
    }
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
     this.ngayBatDau05 = new Date(
        moment().hours(0).minutes(0).seconds(0).startOf('month').toString()
      );
      this.ngayKetThuc05 = new Date(
        moment().hours(23).minutes(59).seconds(59).endOf('month').toString()
      );
    this.loadBranch();
    this.loadBC04();
    this.loadCustomer();
  }

  onTabSelect(tab: TabDirective) {
    switch (tab.heading) {
      case 'BC04-DT12':
        this.loadBC04();
        break;
      case 'BC05':
        this.loadBC05();
        break;
      default:
        console.log('Unknown tab selected');
    }
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadBC04();
  }
  selectedDate05(event) {
    this.ngayBatDau05 = new Date(event.start);
    this.ngayKetThuc05 = new Date(event.end);
    this.loadBC05();
  }


  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.loadBC04();
  }
  changedBranch05() {
    this.loadBC05();
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }
  changedCustomer() {
    this.loadBC05();
  }
  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listBC05?.slice(startIndex, endIndex);
  }
  loadBC04(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show('spinnerBC04');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branchId?.toString())
      this.busy = this.reportsService
      .getReport04(params)
      .subscribe((res: ResponseValue<R04Dt12[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data;
          this.spinner.hide('spinnerBC04');
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
          this.spinner.hide('spinnerBC04');
        }
      });
  }
  loadBC05(): void {
    let tuNgay = moment(this.ngayBatDau05).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc05).format('YYYYMMDD');
    this.spinner.show('spinnerBC05');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      this.busy = this.reportsService
      .getReport05(params)
      .subscribe((res: ResponseValue<DispatchOrderFeeExport[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listBC05 = res.data;
          this.spinner.hide('spinnerBC05');
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
          this.spinner.hide('spinnerBC05');
        }
      });
  }

  timKiem(): void {
    //this.loadData();
  }
  timKiem05(): void {
    this.loadBC05();
  }
  exportExcel(): void {
    
  }
  exportExcel05(): void {
  let printList= this.listBC05.map(({ workflowId, maphi,tenmaphi,soluong,shippingTaskId,km,kmdau,kmcuoi,pallets,containers,tomtatlenh,inquiryTimeToTheFactory,
                tien,vat,tongtien,routeCode,routeName,loaiCungduong,totalRows,luonghang,luonghangLuotdiName,luonghangLuotveName,luonghangTrungchuyenCangName,luonghangTrungchuyenCangveName
                ,luonghangTrungchuyenNhamayName,luonghangTrungchuyenNhamayveName,cang1LuotdiName,cang1LuotveName,cang2LuotdiName,cang2LuotveName,
                chang1KmLuotDi,chang1KmLuotVe,chang1LuotdiName,chang1LuotveName,chang2KmLuotDi,chang2KmLuotVe,chang2LuotdiName,chang2LuotveName,
                dieuchinh,dieuchinhKmLuotDi,dinhmucDauLuotDi,dinhmucDauLuotVe,dinhmucDauTrungchuyenCang,dinhmucDauTrungchuyenCangVe,dinhmucDauTrungchuyenNhamay,
                dinhmucDauTrungchuyenNhamayVe,kmTrungchuyenCang,kmTrungchuyenCangVe,kmTrungchuyenNhamay,kmTrungchuyenNhamayVe,nhamay1LuotdiName,nhamay1LuotveName,
                nhamay2LuotdiName,nhamay2LuotveName,tronve,loaihinh, ...item }) => item);
    this.exportService.exportExcel(printList, 'baocao05');
  }

}
