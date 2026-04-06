import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSubcontractorDispatchOrderComponent } from '@app/shared/components/transports/modal-subcontractor-dispatch-order/modal-subcontractor-dispatch-order.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue, Supplier } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'subcontractors-dispatch-order',
  templateUrl: './subcontractors-dispatch-order.component.html',
  styleUrls: ['./subcontractors-dispatch-order.component.css']
})
export class SubcontractorsDispatchOrderComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDispatchorder: Dispatchorder[];
  listFilter: Dispatchorder[];
  listBranch:Branch[]=[];
  listSupplier:Supplier[]=[];
  //listCustomer:Customer[];
  userLoged?:Profile;
  branchId?:number;
  supplierId?:number=0
  busy: Subscription;
  viewModal = false;
  adminPermission=false;

  refNoSearch?:String;
  ngaySearch?:String;
  nguoilapSearch?:String;
  nccSearch?:String;
  bksSearch?:String;
  toantuyenSearch?:String;
  sumSearch?:String;
  ghichuSearch?:String;
  tinhtrang?:number=0;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Khởi tạo" }, { "value": 2, "text": 'Chưa nhận'}, { "value": 3, "text": 'Đã nhận' },{ "value": 4, "text": 'Thực hiện' },{ "value": 5, "text": 'Hoàn thành'}, { "value": 6, "text": 'Duyệt B1'},{ "value": 7, "text": 'Chốt lệnh'}, { "value": 8, "text": 'Dừng lệnh'}];


  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  @ViewChild(ModalSubcontractorDispatchOrderComponent, { static: false }) modalAddEdit: ModalSubcontractorDispatchOrderComponent
  constructor(private dispatchOrderService: DispatchordersService, 
    private notificationService: NotificationService, private _utilityService: UtilityService
    ,private _authService:AuthService
    ,private branchService:BranchService
    ,private supplierService:SupplierService
    ,public datepipe: DatePipe
    ) { }


  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    //this.loadCustomer();
    this.loadBranch();
    this.loadSupplier();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadSupplier();
    this.loadData();
  }

  changedSupplier(event:Supplier){
    this.supplierId=event?.id;
    this.loadData();
  }
  
  loadSupplier(){
    const params = new HttpParams()
    .set('branchid', this.branchId.toString());
    this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
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
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  } 

  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }
  

  loadData(): void {
    this.pageIndex=1;
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('type',"2")
      .set('supplierid',this.supplierId.toString())
     // .set('usergroupid')
      this.busy = this.dispatchOrderService.getPaging(params).subscribe((res: ResponseValue<Pagination<Dispatchorder>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDispatchorder = res.data?.items;
          this.filter();
        }
        else {
          if(res.code=='204'){
            this.listDispatchorder =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  filter(){
    this.listFilter = Object.assign([], this.listDispatchorder);
    if(this.tinhtrang>0){
      this.listFilter = this.listFilter.filter((data) => {
        return  this.tinhtrang==1? data.status==0:
                this.tinhtrang==2? data.status==1:
                this.tinhtrang==3? data.status==2:
                this.tinhtrang==4? data.status==3 && data.finished==false:
                this.tinhtrang==5? data.status==3 && data.finished==true:
                this.tinhtrang==6? data.status==5:
                this.tinhtrang==7? data.status==6:(data.status==4 || data.status==7)
                ;
      });
    }
    if(this.refNoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toString().toLowerCase().includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if(this.nguoilapSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
    });
    if(this.nccSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.shippingUnitName?.toString().toLowerCase().includes(this.nccSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.bksSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vihiclelLicensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });

    if(this.toantuyenSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.fullRoute?.toLowerCase().includes(this.toantuyenSearch.trim().toLocaleLowerCase());
    });

    if(this.sumSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.dispatchSummarize?.toLowerCase().includes(this.sumSearch.trim().toLocaleLowerCase());
    });
    this.totalRows=this.listFilter.length;
  }
  viewDetailed(item:Dispatchorder){
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.refNo);
    }, 50);
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
