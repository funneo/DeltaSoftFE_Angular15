import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';
import { ModalPerformDispatchOrderComponent } from '@app/shared/components/transports/modal-perform-dispatch-order/modal-perform-dispatch-order.component';
import { ModalPerformFclComponent } from '@app/shared/components/transports/modal-perform-fcl/modal-perform-fcl.component';
import { ModalExecuteFclComponent } from '@app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, Profile, ResponseValue } from '@app/shared/models';
import { DispatchOrderFcl } from '@app/shared/models/fcl/dispatch-order-fcl';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchOrderFclService } from '@app/shared/services/fcl/dispatch-order-fcl.service';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-perform-dispatch-order',
  templateUrl: './perform-dispatch-order.component.html',
  styleUrls: ['./perform-dispatch-order.component.css']
})
export class PerformDispatchOrderComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDispatchorder: Dispatchorder[];
  listDispatchOrderFcl: DispatchOrderFcl[];
  listFilterFcl:DispatchOrderFcl[];
  //listCustomer:Customer[];
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  viewModalFcl = false;
  viewModalFclNew = false;
  listFilterFclNew: DispatchOrderFcl[] = [];
  branchId?:number;
  driverId?:number;

  refNoSearch?:String;
  ngaySearch?:String;
  nguoilapSearch?:String;
  nccSearch?:String;
  bksSearch?:String;
  laixeSearch?:String;
  toantuyenSearch?:String;
  kmSearch?:String;
  kmdauSearch?:String;
  kmcuoiSearch?:String;
  sumSearch?:String;
  contsealSearch?:String;
  ghichuSearch?:String;
  tinhtrang?:number=0;
  contTypeSearch='';
  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public ngayBatDauFcl: Date = this._utilityService.ngayBanDau;
  public ngayKetThucFcl: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);


  @ViewChild(ModalPerformDispatchOrderComponent, { static: false }) modalAddEdit: ModalPerformDispatchOrderComponent
  @ViewChild(ModalPerformFclComponent, { static: false }) modalAddEditFcl: ModalPerformFclComponent
  @ViewChild(ModalExecuteFclComponent, { static: false }) modalExecuteFclNew: ModalExecuteFclComponent
  constructor(private dispatchOrderService: DispatchordersService, private fclService:DispatchOrderFclService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    ,private _authService:AuthService, public datepipe: DatePipe
    ,private spinner: NgxSpinnerService
    ) { }


  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    // Mặc định 7 ngày gần nhất (hôm nay + 6 ngày trước)
    this.ngayBatDau = new Date(moment().subtract(6, 'days').startOf('day').toString());
    this.ngayKetThuc = new Date(moment().endOf('day').toString());
    this.ngayBatDauFcl = new Date(moment().subtract(6, 'days').startOf('day').toString());
    this.ngayKetThucFcl = new Date(moment().endOf('day').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    //this.loadCustomer();
    this.loadData();
    this.loadDataFcl();
    
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  selectedDateFcl(event) {
    this.ngayBatDauFcl = new Date(event.start);
    this.ngayKetThucFcl = new Date(event.end);
    this.loadDataFcl();
  }


  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.userLoged.branchId)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('type',"1")
      .set('driverid',this.userLoged.employeeId)
     // .set('usergroupid')
      this.spinner.show('toSpinner');
      this.busy = this.dispatchOrderService.getPaging(params).subscribe((res: ResponseValue<Pagination<Dispatchorder>>) => {
        this.spinner.hide('toSpinner');
        if (res.code == '200' || res.code == '201') {
          this.listDispatchorder = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listDispatchorder =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      }, () => this.spinner.hide('toSpinner'));
  }

 get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilterFcl?.slice(startIndex, endIndex);
  }
  loadDataFcl(): void {
    let tuNgay = moment(this.ngayBatDauFcl).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThucFcl).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid',this.branchId?.toString())
      .set('driverid','602')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.spinner.show('fclSpinner');
      this.spinner.show('fclNewSpinner');
      this.busy = this.fclService.getPerformance(params).subscribe((res: ResponseValue<DispatchOrderFcl[]>) => {
        this.spinner.hide('fclSpinner');
        this.spinner.hide('fclNewSpinner');
        if (res.code == '200' || res.code == '201') {
          this.listDispatchOrderFcl = res.data;
          this.listDispatchOrderFcl = this.listDispatchOrderFcl.map(it => ({
            ...it,
            containerList: it.containerNumbers?.split(/[;\n]+/).map(x => x.trim()).filter(Boolean) || [],
            locationList: it.locations?.split(/\*\-|[\r\n]+/).map(x => x.trim()).filter(Boolean) || []
          }));
          this.filter();
        }
        else {
          if(res.code=='204'){
            this.listDispatchOrderFcl =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      }, () => { this.spinner.hide('fclSpinner'); this.spinner.hide('fclNewSpinner'); });
  }
  filter(){
    this.listFilterFcl = Object.assign([], this.listDispatchOrderFcl);
    if(this.refNoSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
        return data.refNo.toString().toLowerCase().includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if(this.ngaySearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if(this.nguoilapSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
    });
    if(this.nccSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.shippingUnitName?.toString().toLowerCase().includes(this.nccSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.bksSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.vehiclelLicensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });
    if(this.laixeSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.driverName?.toLowerCase().includes(this.laixeSearch.trim().toLocaleLowerCase());
    });
    if(this.toantuyenSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.fullRoute?.toLowerCase().includes(this.toantuyenSearch.trim().toLocaleLowerCase());
    });

    if(this.kmdauSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.startVehicleOdor?.toString().toLowerCase().includes(this.kmdauSearch.trim().toLocaleLowerCase());
    });
    if(this.kmcuoiSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.finishVehicleOdor?.toString().toLowerCase().includes(this.kmcuoiSearch.trim().toLocaleLowerCase());
    });
    if(this.sumSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.dispatchSummarize?.toLowerCase().includes(this.sumSearch.trim().toLocaleLowerCase());
    });
    if(this.contsealSearch?.length>0)
    this.listFilterFcl=this.listFilterFcl.filter((data)=>{
      return data.shippingTaskItem.containerNumber?.toLowerCase().includes(this.contsealSearch.trim().toLocaleLowerCase());
    });
    // Tách lệnh FCL mới (isLegacy=0) sang tab riêng; tab FCL cũ giữ phần còn lại.
    this.listFilterFclNew = this.listFilterFcl.filter(x => (x as any).isLegacy === false || (x as any).isLegacy === 0);
    this.listFilterFcl = this.listFilterFcl.filter(x => !((x as any).isLegacy === false || (x as any).isLegacy === 0));
    this.totalRows=this.listFilterFcl.length;
  }
  get visibleDataNew(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilterFclNew?.slice(startIndex, endIndex);
  }
  viewDetailedFclNew(item: DispatchOrderFcl) {
    this.viewModalFclNew = true;
    setTimeout(() => this.modalExecuteFclNew.edit(item.refNo, false), 50);
  }
  saveSuccessFclNew(): void { this.loadDataFcl(); }
  closeModalFclNew(): void { this.viewModalFclNew = false; }
  viewDetailed(item:Dispatchorder){
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.refNo);
    }, 50);
  }
  viewDetailedFcl(item:DispatchOrderFcl){
    this.viewModalFcl = true;
    setTimeout(() => {
      this.modalAddEditFcl.edit(item.refNo,true);
    }, 50);
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  timKiemFcl(): void {
    this.pageIndex = 1;
    this.loadDataFcl();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  saveSuccess(): void {
    this.loadData();
  }
  saveSuccessFcl(): void {
    this.loadDataFcl();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeModalFcl(): void {
    this.viewModalFcl = false;
  }
  
}
