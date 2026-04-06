import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalJobgroupoptionComponent } from '@app/shared/components/danhmuc/modal-jobgroupoption/modal-jobgroupoption.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue } from '@app/shared/models';
import { Jobgroup } from '@app/shared/models/jobgroup';
import { Jobgroupoption } from '@app/shared/models/jobgroupoption';
import { NotificationService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { JobgroupoptionService } from '@app/shared/services/jobgroupoption.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-jobgroupoption',
  templateUrl: './jobgroupoption.component.html',
  styleUrls: ['./jobgroupoption.component.css']
})
export class JobgroupoptionComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listJobGroupOption: Jobgroupoption[];
  listJobGroup:Jobgroup[];
  jobgroupId?:number;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalJobgroupoptionComponent, { static: false }) modalAddEdit: ModalJobgroupoptionComponent

  constructor(
    private jobGroupOptionServices:JobgroupoptionService, private notificationService: NotificationService
    ,private jobGroupServices:JobgroupService, private _export:ExportService
  ) { }

  ngOnInit(): void {
    this.loadJobgroup();
    this.loadData();
  }

  loadJobgroup(): void{
    const params = new HttpParams()
      this.busy = this.jobGroupServices.getAll().subscribe((res: ResponseValue<Jobgroup[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listJobGroup = res.data
        }
      });
  }
  exportExcel(){
    const params = new HttpParams()
    .set('pageIndex', this.pageIndex.toString())
    .set('pageSize', this.pageSize.toString())
    .set('keyword', this.keyword)
    .set('jobgroupId',this.jobgroupId?.toString())
      this.busy = this.jobGroupOptionServices.getPaging(params).subscribe((res: ResponseValue<Pagination<Jobgroupoption>>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res.data?.items;
          this._export.exportExcel(listData,'danh-muc-ten-cong-viec')
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('jobgroupId',this.jobgroupId?.toString())
      this.busy = this.jobGroupOptionServices.getPaging(params).subscribe((res: ResponseValue<Pagination<Jobgroupoption>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listJobGroupOption = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listJobGroupOption=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  changedJobGroup(event:Jobgroup){
    this.jobgroupId=event?.id;
    this.pageIndex=1;
    this.loadData();
  }

  clickRow(item: Jobgroupoption): void {
    item.checked = !item.checked;
    this.listJobGroupOption.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listJobGroupOption.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listJobGroupOption[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listJobGroupOption.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.jobGroupOptionServices.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listJobGroupOption.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listJobGroupOption)
      return this.listJobGroupOption.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listJobGroupOption.filter(x => x.checked);
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
