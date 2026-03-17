import { HttpParams } from '@angular/common/http';
import { ModalDbsShipmentComponent } from './../../../shared/components/dbs/modal-dbs-shipment/modal-dbs-shipment.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { DbsShipment } from '@app/shared/models/dbs/dbs-shipment.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { DbsShipmentService } from '@app/shared/services/dbs-shipment.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-dbs-shipments',
  templateUrl: './dbs-shipments.component.html',
  styleUrls: ['./dbs-shipments.component.css']
})
export class DbsShipmentsComponent implements OnInit {

  pageIndex = 1;
  pageSize = 999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: DbsShipment[]=[];
  listFilter: DbsShipment[]=[];
  listFilter1: DbsShipment[]=[];
  listDone:DbsShipment[]=[];
  listBranch:Branch[]=[];
  branchId:number=0;
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  adminPerrmission=false;
  viewDispatchModal=false;

  ediReferenceSeach?:string;
  internalShipmentNumberSeach?:string;
  primaryReferenceSeach?:string;
  servicesNameSeach?:string;
  quantitySeach?:string;
  grossWeightSeach?:string;
  pickupNameLine1Seach?:string;
  pickupAddressLine1Seach?:string;
  deliveryNameLine1Seach?:string;
  deliveryAddressLine1each?:string;

  ediReferenceSeach1?:string;
  internalShipmentNumberSeach1?:string;
  primaryReferenceSeach1?:string;
  servicesNameSeach1?:string;
  quantitySeach1?:string;
  grossWeightSeach1?:string;

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  @ViewChild(ModalDbsShipmentComponent, { static: false }) modalDbsAddEdit: ModalDbsShipmentComponent

  constructor(
    private _utilityService: UtilityService,
    private _service:DbsShipmentService,
    private notificationService: NotificationService, private _authService:AuthService,
    private branchService:BranchService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.adminPerrmission=this.userLoged.isAdmin;
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this._service.getPaging(params).subscribe((res: ResponseValue<Pagination<DbsShipment>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          this.listData = res.data?.items.filter(o=>o.status<3
          )
          this.listDone = res.data?.items.filter(o=>o.status>2)
          this.filter();
          this.filter1();
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listData =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.ediReferenceSeach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.ediReference.toString().toLowerCase().includes(this.ediReferenceSeach.trim().toLocaleLowerCase());
      });
    if(this.internalShipmentNumberSeach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.internalShipmentNumber?.toLowerCase().includes(this.internalShipmentNumberSeach.trim().toLocaleLowerCase());
    });
    if(this.primaryReferenceSeach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.primaryReference?.toLowerCase().includes(this.primaryReferenceSeach.trim().toLocaleLowerCase());
    });
    if(this.servicesNameSeach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.servicesName?.toLowerCase().includes(this.servicesNameSeach.trim().toLocaleLowerCase());
    });
    if(this.quantitySeach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.quantity.toString().toLowerCase().includes(this.quantitySeach.trim().toLocaleLowerCase());
      });
    if(this.grossWeightSeach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.grossWeight?.toString().toLowerCase().includes(this.grossWeightSeach.trim().toLocaleLowerCase());
    });
    if(this.pickupNameLine1Seach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.pickupAddressLine1?.toLowerCase().includes(this.pickupNameLine1Seach.trim().toLocaleLowerCase());
    });
    if(this.pickupAddressLine1Seach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.pickupAddressLine1?.toLowerCase().includes(this.pickupAddressLine1Seach.trim().toLocaleLowerCase());
    });
    if(this.deliveryNameLine1Seach?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.deliveryNameLine1?.toLowerCase().includes(this.deliveryNameLine1Seach.trim().toLocaleLowerCase());
    });
    if(this.deliveryAddressLine1each?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.deliveryAddressLine1?.toLowerCase().includes(this.deliveryAddressLine1each.trim().toLocaleLowerCase());
    });
  }

  filter1(){
    this.listFilter1 = Object.assign([], this.listDone);
    if(this.ediReferenceSeach1?.length>0)
    this.listFilter1=this.listFilter1.filter((data)=>{
        return data.ediReference.toString().toLowerCase().includes(this.ediReferenceSeach1.trim().toLocaleLowerCase());
      });
    if(this.internalShipmentNumberSeach1?.length>0)
    this.listFilter1=this.listFilter1.filter((data)=>{
      return data.internalShipmentNumber?.toLowerCase().includes(this.internalShipmentNumberSeach1.trim().toLocaleLowerCase());
    });
    if(this.primaryReferenceSeach1?.length>0)
    this.listFilter1=this.listFilter1.filter((data)=>{
      return data.primaryReference?.toLowerCase().includes(this.primaryReferenceSeach1.trim().toLocaleLowerCase());
    });
    if(this.servicesNameSeach1?.length>0)
    this.listFilter1=this.listFilter1.filter((data)=>{
      return data.servicesName?.toLowerCase().includes(this.servicesNameSeach1.trim().toLocaleLowerCase());
    });
    if(this.quantitySeach1?.length>0)
    this.listFilter1=this.listFilter1.filter((data)=>{
        return data.quantity.toString().toLowerCase().includes(this.quantitySeach1.trim().toLocaleLowerCase());
      });
    if(this.grossWeightSeach1?.length>0)
    this.listFilter1=this.listFilter1.filter((data)=>{
      return data.grossWeight?.toString().toLowerCase().includes(this.grossWeightSeach1.trim().toLocaleLowerCase());
    });
  }


  getDocument(){
    this.busy = this._service.getDocument().subscribe((res: ResponseValue<Pagination<DbsShipment>>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.GETDATA_OK_MSG + '\n' + res.code);
      }
      else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
    });
  }
  getEdi(){
    this.busy = this._service.getEdi(this.branchId).subscribe((res: ResponseValue<Pagination<DbsShipment>>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.GETDATA_OK_MSG + '\n' + res.code)
        this.loadData();
      }
      else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
    });
  }

  clickRow(item: DbsShipment): void {
    item.checked = !item.checked;
    this.listData.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    this.icheck();
  }

  clickRow1(item: DbsShipment): void {
    item.checked = !item.checked;
    this.listDone.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    this.icheck();
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  edit(): void {
    const index = this.listData.findIndex(x => x.checked);
    if(index>-1){
      this.viewModal = true;
    setTimeout(() => {
      this.modalDbsAddEdit.edit(this.listData[index].id);
    }, 50);
    }
    const index1 = this.listDone.findIndex(x => x.checked);
    if(index1>-1){
      this.viewModal = true;
    setTimeout(() => {
      this.modalDbsAddEdit.edit(this.listDone[index1].id);
    }, 50);
    }
  }

  icheck() {
    let checks = this.listData.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeDispatchModal(){
    this.viewDispatchModal=false;
  }


}
