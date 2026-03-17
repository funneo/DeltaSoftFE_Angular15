import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Pipe, ViewChild } from '@angular/core';
import { ModalDriverFuelApprovalComponent } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { DriverFuelApproval } from '@app/shared/models/transports/driver-fuel-approval.model';
import { AuthService, BranchService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { DriverFuelApprovalService } from '@app/shared/services/transports/driver-fuel-approval.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'common-fuel-approval',
  templateUrl: './common-fuel-approval.component.html',
  styleUrls: ['./common-fuel-approval.component.css']
})
export class CommonFuelApprovalComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listCommonFuelApproval: DriverFuelApproval[]=[];
  listFilter: DriverFuelApproval[]=[];
  listDriver:Employee[]=[];
  listBranch:Branch[];
  driverId:number=0;
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  branchId?:number;
  adminPermission=false;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Khởi tạo" }, { "value": 2, "text": 'Xuất phiếu'}, { "value": 3, "text": 'Chốt phiếu' }];

  tinhtrang:number=0;
  sophieuSearch?:string;
  khoSearch?:string;
  ngaySearch?:string;
  nguoitaoSearch?:string;
  nccSearch?:string;
  laixeSearch?:string;
  bksSearch?:string;
  soluongSearch?:string;
  ghichuSearch?:string;
  igasSearch?:string;
  tgdoSearch?:string;
  sldoSearch?:string;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalDriverFuelApprovalComponent, { static: false }) modalAddEdit: ModalDriverFuelApprovalComponent

  constructor(
    private _utilityService: UtilityService,
    private driverFuelApprovalService:DriverFuelApprovalService,
    private employeeService:EmployeeService,private branchService:BranchService,
    private notificationService: NotificationService, private _authService:AuthService,
    private _export:ExportService, public datepipe:DatePipe
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.adminPermission=this.userLoged.isAdmin;
    this.branchId=Number.parseInt(this.userLoged.branchId);
    //this.loadCustomer();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch();
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
    .set('branchid',this.branchId.toString())
    .set('driverid',this.driverId.toString())
    .set('fromDate', tuNgay)
    .set('toDate', denNgay)
    .set('keyword','')
    .set('type','1')
     // .set('usergroupid')
     this.busy = this.driverFuelApprovalService.getPaging(params,false).subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == '200' || res.code == '201') {
          let exelList: DriverFuelApproval[];
          exelList = res.data?.items;
          let printList=exelList.map(({createdBy,id,totalRows,branchId,driverId,gasSiteId,vihicleId,type,status,approvedBy,approvedDate,supplierId,supplierCode, ...item }) => item);
          this._export.exportExcel(printList,'cap-dau-chung');
        }
        else {
          if(res.code=='204'){
            this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE )
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
      .set('driverid',this.driverId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('type','1')
     // .set('usergroupid')
      this.busy = this.driverFuelApprovalService.getPaging(params,false).subscribe((res: ResponseValue<Pagination<DriverFuelApproval>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listCommonFuelApproval = res.data?.items;
          this.totalRows = res.data?.totalRows;
          this.listFilter=this.listCommonFuelApproval;
          this.tinhtrang=0;
        }
        else {
          if(res.code=='204'){
            this.listFilter=this.listCommonFuelApproval =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  filter(){
    this.listFilter = Object.assign([], this.listCommonFuelApproval);
    if(this.tinhtrang>0){
      this.listFilter = this.listFilter.filter((data) => {
        return  this.tinhtrang==1? data.status==0:
                this.tinhtrang==2? data.status==1:data.status==2;
      });
    }
    if(this.sophieuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toString().toLowerCase().includes(this.sophieuSearch.trim().toLocaleLowerCase());
      });
      if(this.khoSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
        return data.siteName?.toLowerCase().includes(this.khoSearch.trim().toLocaleLowerCase());
      })
    if(this.nguoitaoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoitaoSearch.trim().toLocaleLowerCase());
    });
    if(this.nccSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.supplierName?.toLowerCase().includes(this.nccSearch.trim().toLocaleLowerCase());
    });
    if(this.laixeSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.driverName?.toLowerCase().includes(this.laixeSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    if(this.bksSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.licensePlate?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.igasSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.igasCode?.toLowerCase().includes(this.igasSearch.trim().toLocaleLowerCase());
    });
    if(this.tgdoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.refuelingTimeIgas, 'dd/MM/yyyy').toLowerCase().includes(this.tgdoSearch.trim().toLocaleLowerCase());
    })
    if(this.sldoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.quantityIgas?.toString().toLowerCase().includes(this.sldoSearch.trim().toLocaleLowerCase());
    })
    if(this.soluongSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.quantity?.toString().toLowerCase().includes(this.soluongSearch.trim().toLocaleLowerCase());
    })
  }

  loadDriver(): void {
    const params = new HttpParams()
      .set('branchId',this.userLoged.branchId)
      this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDriver = res.data;
        }
        else {
          if(res.code=='204'){
            this.listDriver =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  clickRow(item: DriverFuelApproval): void {
    item.checked = !item.checked;
    this.listCommonFuelApproval.forEach(it=>{
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

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(1,false,null,null,null);
    }, 50);
  }

  edit(flag:boolean): void {
    const index = this.listCommonFuelApproval.findIndex(x => x.checked);
    this.viewModal = true;
    let permission=this.listCommonFuelApproval[index].createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listCommonFuelApproval[index].id, flag,permission );
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listCommonFuelApproval.filter(x => x.checked);
    let checks: number[] = [];
    if(listChecks[0].createdBy!=this.userLoged.id)return;
    if(listChecks[0].status>0)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.driverFuelApprovalService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listCommonFuelApproval.filter(x => x.checked);
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
