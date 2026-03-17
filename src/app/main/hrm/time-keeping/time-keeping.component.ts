import { ExportTimeKeeping } from './../../../shared/models/reports/export-time-keeping.model';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTimeKeepingComponent } from '@app/shared/components/hrm/modal-time-keeping/modal-time-keeping.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { TimeKeeping } from '@app/shared/models/hrm/time-keeping.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { TimeKeepingService } from '@app/shared/services/hrm/time-keeping.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-time-keeping',
  templateUrl: './time-keeping.component.html',
  styleUrls: ['./time-keeping.component.css']
})
export class TimeKeepingComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listItem: TimeKeeping[]=[];
  listBranch:Branch[]=[];
  userLoged?:Profile;
  supplierId?:number=0;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  branchId?:number;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalTimeKeepingComponent, { static: false }) modalAddEdit: ModalTimeKeepingComponent

  constructor(
    private timeKeepingService:TimeKeepingService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private branchService:BranchService
    ,private _utilityService:UtilityService
    ,private _export:ExportService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
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
  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
     // .set('usergroupid')
      this.busy = this.timeKeepingService.getPaging(params).subscribe((res: ResponseValue<Pagination<TimeKeeping>>) => {
        if (res.code == '200' || res.code == '201') {
          let list = res.data?.items;
          let listExport:ExportTimeKeeping[]=[];
          list.forEach(item=>{
            let value:ExportTimeKeeping={
              chinhanh:item.branchCode,
              taikhoan:item.userName,
              tennhavien:item.employeeFullName,
              ngay:item.timeKeepingDate,
              thoigian_den:item.commingTime,
              ghichu_den:item.commingNote,
              thoigian_ve:item.outgoingTime,
              ghichu_ve:item.outgoingNote
            }
            listExport.push(value);
          })
          this._export.exportExcel(listExport,'tong-hop-cham-cong');
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
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
     // .set('usergroupid')
      this.busy = this.timeKeepingService.getPaging(params).subscribe((res: ResponseValue<Pagination<TimeKeeping>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listItem = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listItem =[];
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


  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

 comming (): void {
    this.viewModal=true;
    setTimeout(() => {
      this.modalAddEdit.view(0);
    }, 50);
  }

  outgoing (): void {
    let item:TimeKeeping={}
    item.userName=this.userLoged.userName;
    this.busy = this.timeKeepingService.check(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        if(res.data)
        {
          this.viewModal=true;
              setTimeout(() => {
                this.modalAddEdit.view(1);
              }, 50);
        }else{
          this.notificationService.printAlert(MessageContstants.TITLE_ERROR_INFO,"Chưa chấm công đến!");
        }
      }
       else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
    });

  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
