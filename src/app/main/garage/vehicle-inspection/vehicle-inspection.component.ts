import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalVehicleInspectionComponent } from '@app/shared/components/garage/modal-vehicle-inspection/modal-vehicle-inspection.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { VehicleInspection } from '@app/shared/models/garage/vehicle-inspection.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { VehicleInspectionService } from '@app/shared/services/garage/vehicle-inspection.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-inspection',
  templateUrl: './vehicle-inspection.component.html',
  styleUrls: ['./vehicle-inspection.component.css']
})
export class VehicleInspectionComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: VehicleInspection[]=[];
  listFilter: VehicleInspection[]=[];
  listBranch:Branch[]=[];
  userLoged?:Profile;
  vehicleId?:number=0;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  branchId?:number;
  selectedType:number=0;
  refnoSearch='';
  bksSearch='';
  ngaySearch='';
  nguoilapSearch='';
  nguoiduyetSearch='';
  nhanxetSearch='';
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Chưa duyệt" }, { "value": 2, "text": "Duyệt" },{ "value": 3, "text": "Từ chối" }];
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalVehicleInspectionComponent, { static: false }) modalAddEdit: ModalVehicleInspectionComponent

  constructor(
    private _services:VehicleInspectionService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private branchService:BranchService
    ,private _utilityService:UtilityService
    ,private _export:ExportService,public datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.isAdmin
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch();
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  showModal(item: VehicleInspection) {
    this.viewModal = true;
    let permission=item.createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, !permission);
    }, 50);
  }
  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.selectedType>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType==1? data.status===0:this.selectedType==2? data.status===1:data.status===-1;
      });
    }
    if(this.refnoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toString().toLowerCase().includes(this.refnoSearch.trim().toLocaleLowerCase());
      });
    if(this.bksSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.licensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });
    if(this.nguoilapSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
    });

    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    if(this.nguoiduyetSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.acceptByName?.toLowerCase().includes(this.nguoiduyetSearch.trim().toLocaleLowerCase());
    });
    if(this.nhanxetSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.acceptNotes?.toLowerCase().includes(this.nhanxetSearch.trim().toLocaleLowerCase());
    });
  }

  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', "99999")
      .set('branchid',this.userLoged.branchId)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
     // .set('usergroupid')
      this.busy = this._services.getPaging(params).subscribe((res: ResponseValue<Pagination<VehicleInspection>>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res.data?.items;
          this._export.exportExcel(listData,'bao-cao-ngoai-gio');
        }
        else {
          if(res.code=='204'){
            this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE)
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId.toString())
      .set('vehicleid',this.vehicleId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this._services.getPaging(params).subscribe((res: ResponseValue<Pagination<VehicleInspection>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          this.filter();
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

  loadBranch(): void {
      this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listBranch = res.data;
        }
        else {
          if(res.code=='204'){
            this.listBranch =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  changedBranch(event:Branch){
    this.branchId=event!.id;
    this.loadData();
  }

  clickRow(item: VehicleInspection): void {
    item.checked = !item.checked;
        this.listData.forEach(value=>{
      if(value!=item)
        value.checked=false;
    });
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

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag:boolean): void {
    const index = this.listData.findIndex(x => x.checked);
    this.viewModal = true;
    let permission=this.listData[index].createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id, !permission);
    }, 50);
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
}
