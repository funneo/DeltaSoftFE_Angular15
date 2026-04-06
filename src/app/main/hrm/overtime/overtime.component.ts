import { ExportService } from '@app/shared/services/export-excel.service';
import { ExportOverTime } from '@app/shared/models/reports/export-over-time.model';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalOvertimeComponent } from '@app/shared/components/hrm/modal-overtime/modal-overtime.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { OverTime } from '@app/shared/models/hrm/over-time.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { OverTimeService } from '@app/shared/services/hrm/over-time.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-overtime',
  templateUrl: './overtime.component.html',
  styleUrls: ['./overtime.component.css']
})
export class OvertimeComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listOverTime: OverTime[]=[];
  listBranch:Branch[]=[];
  userLoged?:Profile;
  supplierId?:number=0;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  branchId?:number;
  _auth=5;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalOvertimeComponent, { static: false }) modalAddEdit: ModalOvertimeComponent

  constructor(
    private overTimeService:OverTimeService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private branchService:BranchService
    ,private _utilityService:UtilityService
    ,private _export:ExportService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this.adminPermission=this.userLoged.isAdmin|| this._auth<1;
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

  showModal(item: OverTime) {
    this.viewModal = true;
    let permission=item.createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true,permission);
    }, 50);
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
      this.busy = this.overTimeService.getPaging(params).subscribe((res: ResponseValue<Pagination<OverTime>>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res.data?.items;
          let listPrint: ExportOverTime[]=[];
          listData.forEach(item=>{
              let val:  ExportOverTime ={
                chinhanh:item.branchName,
                nhanvien:item.createdByName,
                nhom:item.departmentName,
                ngaytao:item.createdDate,
                lydo:item.reason,
                giobatdau_dk:item.estimatedStartTime,
                gioketthuc_dk:item.estimatedFinishTime,
                giandoan_dk:item.discontinuityTime,
                giobatdau:item.startedTime,
                gioketthuc:item.finishedTime,
                giobatdau_duyet:item.adjustStartedTime,
                gioketthuc_duyet:item.adjustFinishedTime,
                giandoan_duyet:item.adjustDiscontinuityTime,
                sophut:item.realityMinutes,
                ghichu:item.notes,
                ghichu_duyet:item.acceptedNotes,
                trangthai:item.rStatus
              };
              listPrint.push(val);
            }
          )
          this._export.exportExcel(listPrint,'bao-cao-ngoai-gio');
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
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this.overTimeService.getPaging(params).subscribe((res: ResponseValue<Pagination<OverTime>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listOverTime = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listOverTime =[];
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

  clickRow(item: OverTime): void {
    item.checked = !item.checked;
        this.listOverTime.forEach(value=>{
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
    const index = this.listOverTime.findIndex(x => x.checked);
    this.viewModal = true;
    let permission=this.listOverTime[index].createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listOverTime[index].id, flag,permission);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listOverTime.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    if(listChecks[0].status>0)return;
    if(listChecks[0].createdBy!=this.userLoged.id)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.overTimeService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listOverTime.filter(x => x.checked);
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
