import { SupplierService } from './../../../shared/services/supplier.service';
import { Supplier } from './../../../shared/models/supplier';
import { DispatchOrderFeeExport } from './../../../shared/models/transports/exports/dispatch-order-fee-export.model';
import { DispatchOrderExport } from '@app/shared/models/transports/exports/dispatch-order-export.model';
import { ExportService } from '@app/shared/services/export-excel.service';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { Report03 } from '@app/shared/models/transports/report03.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DispatchOrderFclService } from '@app/shared/services/fcl/dispatch-order-fcl.service';
import { ModalDispatchOrderFclComponent } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.component';

@Component({
  selector: 'app-dispatch-order-report03',
  templateUrl: './dispatch-order-report03.component.html',
  styleUrls: ['./dispatch-order-report03.component.css']
})
export class DispatchOrderReport03Component implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listItem: DispatchOrderFeeExport[]=[];
  listFilter: DispatchOrderFeeExport[]=[];
  listItemFCL: DispatchOrderFeeExport[]=[];
  listFilterFCL: DispatchOrderFeeExport[]=[];
  listBranch:Branch[];
  listSupplier:Supplier[];
  branchId?:number;
  branchIdFCL?:number;
  userLoged?:Profile;
  busy: Subscription;
  shippingId=0;
  listType=[{'id':0,'value':'Báo cáo tổng hợp'},{'id':1,'value':'Báo cáo chi tiết'}]
  typeSelectd=0;
  adminPermission:boolean=false;
  viewDispatchModal=false;
  viewDispatchFclModal=false;
  sotien=0; vat=0;tongtien=0
  sotienFcl=0; vatFcl=0;tongtienFcl=0

  // Tab 1: Lệnh vận chuyển
filterColumns: { [key: string]: any } = {
  refNo: '',
  jobId: '',
  ngaytao: '',
  nguoitao: '',
  nhathauphu: '',
  pallets: '',
  tomtatlenh: '',
  cungduongtinhphi: '',
  maphi: '',
  tenmaphi: '',
  soluong: '',
  tien: '',
  vat: '',
  tongtien: '',
  ghichu: ''
};

// Tab 2: Lệnh vận chuyển FCL
filterColumnsFCL: { [key: string]: any } = {
  refNo: '',
  jobId: '',
  ngaytao: '',
  nguoitao: '',
  nhathauphu: '',
  pallets: '',
  tomtatlenh: '',
  cungduongtinhphi: '',
  maphi: '',
  tenmaphi: '',
  soluong: '',
  tien: '',
  vat: '',
  tongtien: '',
  ghichu: ''
};

dateTimeFields: string[] = ['ngaytao'];

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public ngayBatDauFcl: Date = this._utilityService.ngayBanDau;
  public ngayKetThucFcl: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent
  @ViewChild(ModalDispatchOrderFclComponent, { static: false }) modalDispatchOrderFclAddEdit: ModalDispatchOrderFclComponent

  constructor(
    private _utilityService:UtilityService,
    private dispatchOrderService:DispatchordersService,
    private branchService:BranchService, private fclService:DispatchOrderFclService,
    private notificationService: NotificationService, private _authService:AuthService,private spinner: NgxSpinnerService,
    private _export:ExportService,
    private suppliertSerive:SupplierService,public datepipe: DatePipe
  ) { }
  loadFCL=false;
  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId= Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.isAdmin;
    //this.loadCustomer();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
        this.ngayBatDauFcl = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
        this.ngayKetThucFcl = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadDataFCL();
    this.loadBranch();
    this.loadSupplier();
  }

  loadSupplier(){
    const params = new HttpParams()
    .set('branchid', this.branchId.toString());
  this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
    if (res.code == '200' || res.code == '201') {
      this.listSupplier = res.data
    }
    else {
      if (res.code == "204") {
        this.listSupplier = [];
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    }
  });
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }
  changedBranchFCL(event:Branch){
    this.branchIdFCL=event?.id;
    this.loadDataFCL();
  }
  changedType(){
    this.loadData();
  }
  changedTypeFcl(){
    this.loadDataFCL();
  }
  changedShipping(){
    this.loadData();
  }

  export(){
          let printList= this.listFilter.map(({ giadau,dinhmucdau,dieuchinh,km, ...item }) => item);
          this._export.exportExcel(printList,'bao-cao-chi-phi-vanchuyen');
  }
  exportFCL(){
          let printList= this.listItemFCL.map(({ giadau,dinhmucdau,dieuchinh,km,routeCode,routeName,workflowId,shippingTaskId,
            noigiaonhan,pallets,containers,contSeals,tomtatlenh,inquiryTimeToTheFactory, ...item }) => item);
          this._export.exportExcel(printList,'bao-cao-chi-phi-vanchuyenFcl');
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  selectedDateFcl(event) {
    this.ngayBatDauFcl = new Date(event.start);
    this.ngayKetThucFcl = new Date(event.end);
    this.loadDataFCL();
  }

  loadData(): void {
    this.spinner.show('spinner1');
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid',this.branchId!=null?this.branchId.toString():'0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      this.busy = this.dispatchOrderService.getReport03(params,this.typeSelectd).subscribe((res: ResponseValue<DispatchOrderFeeExport[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listItem = res.data
          this.filterData();
          this.spinner.hide('spinner1');
        }
        else {
          this.spinner.hide('spinner1');
          if(res.code=='204'){
            this.listItem =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
      
  }
  typeSelectdFCL=0;
  loadDataFCL(): void {
    this.spinner.show('spinner2');
    let tuNgay = moment(this.ngayBatDauFcl).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThucFcl).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid',this.branchId!=null?this.branchId.toString():'0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      this.busy = this.fclService.getReport03(params,this.typeSelectdFCL).subscribe((res: ResponseValue<DispatchOrderFeeExport[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listItemFCL = res.data;
          this.filterDataFCL();
          this.spinner.hide('spinner2');
        }
        else {
          this.spinner.hide('spinner2');
          if(res.code=='204'){
            this.listItem =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
      
  }
  filterData(): void {
    this.listFilter = this.listItem.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        if (!this.filterColumns[key]) return true;
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue = this.dateTimeFields.includes(key)
          ? this.datepipe.transform(item[key], 'dd/MM/yyyy')?.toLowerCase() || ''
          : String(item[key] ?? '').toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
    this.calculator();
  }
  
  filterDataFCL(): void {
    this.listFilterFCL = this.listItemFCL.filter((item) => {
      return Object.keys(this.filterColumnsFCL).every((key) => {
        if (!this.filterColumnsFCL[key]) return true;
        const filterValue = this.filterColumnsFCL[key].toString().toLowerCase();
        const itemValue = this.dateTimeFields.includes(key)
          ? this.datepipe.transform(item[key], 'dd/MM/yyyy')?.toLowerCase() || ''
          : String(item[key] ?? '').toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
    this.calculatorFcl();
  }
  calculator(){
    this.sotien=0;
    this.vat=0;
    this.tongtien=0;
    this.listFilter.forEach(it=>{
      this.sotien+=it.tien;
      this.vat+=it.vat;
      this.tongtien+=it.tongtien;
    })
  }
  calculatorFcl(){
    this.sotienFcl=0;
    this.vatFcl=0;
    this.tongtienFcl=0;
    this.listFilterFCL.forEach(it=>{
      this.sotienFcl+=it.tien;
      this.vatFcl+=it.vat;
      this.tongtienFcl+=it.tongtien;
    })
  }
  viewDispatchOrder(refNo:string){
    this.viewDispatchModal = true;
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.edit(refNo, true);
    }, 50);
  }
  viewDispatchOrderFcl(refNo:string){
    this.viewDispatchFclModal = true;
    setTimeout(() => {
      this.modalDispatchOrderFclAddEdit.edit(refNo, true);
    }, 50);
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  closeDispatchModal(){
    this.viewDispatchModal=false;
  }
  closeDispatchFclModal(){
    this.viewDispatchFclModal=false;
  }

}
