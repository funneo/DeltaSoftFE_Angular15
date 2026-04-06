import { ExportService } from '@app/shared/services/export-excel.service';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDriverFuelApprovalComponent } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue, Supplier } from '@app/shared/models';
import { DriverFuelApproval } from '@app/shared/models/transports/driver-fuel-approval.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { SupplierService } from '@app/shared/services/supplier.service';
import { DriverFuelApprovalService } from '@app/shared/services/transports/driver-fuel-approval.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dispatch-order-report02',
  templateUrl: './dispatch-order-report02.component.html',
  styleUrls: ['./dispatch-order-report02.component.css']
})
export class DispatchOrderReport02Component implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDriverFuelApproval: DriverFuelApproval[]=[];
  listSupplier:Supplier[]=[];
  listBranch:Branch[];
  branchId?:number;
  supplierId?:number=0;
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  adminPermission:boolean=false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalDriverFuelApprovalComponent, { static: false }) modalAddEdit: ModalDriverFuelApprovalComponent

  constructor(
    private _utilityService:UtilityService,
    private driverFuelApprovalService:DriverFuelApprovalService,
    private supplierService:SupplierService,
    private branchService:BranchService,
    private notificationService: NotificationService, private _authService:AuthService,
    private _export:ExportService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId= Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    //this.loadCustomer();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch()
    this.loadSupplier();
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

  changedSupplier(event:Supplier){
    this.supplierId=event?.id;
    this.loadData();
  }


  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
    .set('pageIndex', this.pageIndex.toString())
    .set('pageSize', '99999')
    .set('branchid',this.branchId!=null?this.branchId.toString():'0')
    .set('supplierId',this.supplierId!=null?this.supplierId.toString():'0')
    .set('fromDate', tuNgay)
    .set('toDate', denNgay)
    .set('keyword','')
     // .set('usergroupid')
     this.busy = this.driverFuelApprovalService.getExternalFuelApproval(params).subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == '200' || res.code == '201') {
          let exelList: DriverFuelApproval[];
          exelList = res.data?.items;
          let printList= exelList.map(({ id,totalRows,approved,approvedBy,approvedDate,createdBy,checked,status,
            supplierId,customerId,gasSiteId,siteName,vihicleId,driverId,isLocal,igasCode,type,branchId,rStatus,isFuelClosing, ...item }) => item);
          this._export.exportExcel(printList,'tong-hop-mua-dau-ngoai');
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
      .set('branchid',this.branchId!=null?this.branchId.toString():'0')
      .set('supplierId',this.supplierId!=null?this.supplierId.toString():'0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this.driverFuelApprovalService.getExternalFuelApproval(params).subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDriverFuelApproval = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listDriverFuelApproval =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid',this.userLoged.branchId)
      this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listSupplier = res.data;
        }
        else {
          if(res.code=='204'){
            this.listSupplier =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
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

  view(item:DriverFuelApproval): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true,false );
    }, 50);
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
