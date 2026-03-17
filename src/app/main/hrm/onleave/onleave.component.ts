import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalOnleaveComponent } from '@app/shared/components/hrm/modal-onleave/modal-onleave.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { Onleave } from '@app/shared/models/hrm/onleave.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { OnleaveService } from '@app/shared/services/hrm/onleave.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'onleave',
  templateUrl: './onleave.component.html',
  styleUrls: ['./onleave.component.css']
})
export class OnleaveComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listOnLeave: Onleave[]=[];
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
  @ViewChild(ModalOnleaveComponent, { static: false }) modalAddEdit: ModalOnleaveComponent
  
  constructor(
    private onLeaveService:OnleaveService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private branchService:BranchService,private exportService:ExportService
    ,private _utilityService:UtilityService
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
  showModal(item: Onleave) {
    this.viewModal = true;
    let permission=item.createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true,permission);
    }, 50);
  }
  exportExcel(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid',this.userLoged.branchId)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this.onLeaveService.getExport(params).subscribe((res: ResponseValue<Onleave[]>) => {
        if (res.code == '200' || res.code == '201') {        
          const listData = res.data;
          this.exportService.exportExcel(listData, 'nghiphep-lamonline');
        }
      });
    
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
     // .set('usergroupid')
      this.busy = this.onLeaveService.getPaging(params).subscribe((res: ResponseValue<Pagination<Onleave>>) => {
        if (res.code == '200' || res.code == '201') {        
          this.listOnLeave = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listOnLeave =[];
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

  clickRow(item: Onleave): void {
    item.checked = !item.checked;
        this.listOnLeave.forEach(value=>{
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

  add(type:number): void {
    this.busy = this.onLeaveService.getOnLeave(type).subscribe((res: ResponseValue<Onleave>) => {
      if (res.code == '200' || res.code == '201') {        
        var value=res?.data;
        if(value.checkValue){
          this.notificationService.printErrorMessage(MessageContstants.ONLEAVE_REQUIED_ERROR);
          return;
        }else{
          this.viewModal = true;
          setTimeout(() => {
          this.modalAddEdit.add({status:0,checked:false,type:type, numberOfLeaveDay:value.numberOfLeaveDay,remainingOfLeaveDay:value.remainingOfLeaveDay,total:0,listOnLeaveDetailed:[]});
          }, 50);
        }
      }
      else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
    
  }

  edit(flag:boolean): void {
    const index = this.listOnLeave.findIndex(x => x.checked);
    this.viewModal = true;
    let permission=this.listOnLeave[index].createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listOnLeave[index].id, flag,permission);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listOnLeave.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    if(listChecks[0].status>0)return;
    if(listChecks[0].createdBy!=this.userLoged.id)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.onLeaveService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listOnLeave.filter(x => x.checked);
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
