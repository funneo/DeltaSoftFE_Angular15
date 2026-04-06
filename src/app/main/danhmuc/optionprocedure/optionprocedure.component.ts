import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalOptionprocedureComponent } from '@app/shared/components/danhmuc/modal-optionprocedure/modal-optionprocedure.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue } from '@app/shared/models';
import { Jobgroup } from '@app/shared/models/jobgroup';
import { Jobgroupoption } from '@app/shared/models/jobgroupoption';
import { Optionprocedure } from '@app/shared/models/optionprocedure.model';
import { NotificationService } from '@app/shared/services';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { JobgroupoptionService } from '@app/shared/services/jobgroupoption.service';
import { OptionprocedureService } from '@app/shared/services/optionprocedure.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-optionprocedure',
  templateUrl: './optionprocedure.component.html',
  styleUrls: ['./optionprocedure.component.css']
})
export class OptionprocedureComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listOptionProcedure:Optionprocedure[];
  public listJobGroupOption: Jobgroupoption[];
  listJobGroup:Jobgroup[];
  jobgroupoptionId?:number;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalOptionprocedureComponent, { static: false }) modalAddEdit: ModalOptionprocedureComponent
  
  constructor(
    private jobGroupOptionServices:JobgroupoptionService, private notificationService: NotificationService
    ,private jobGroupServices:JobgroupService,private optionProcedureService:OptionprocedureService
  ) { }

  ngOnInit(): void {
    this.loadJobGroupOption();
    this.loadData();
  }


  loadJobGroupOption():void{
    const params = new HttpParams()
    .set('jobgroupId', "0")
    .set('includeProcedure',"1")
    this.busy = this.jobGroupOptionServices.getByJobGroup(params).subscribe((res: ResponseValue<Jobgroupoption[]>) => {
      console.log(res);
      if (res.code == '200' || res.code == '201') {
        this.listJobGroupOption = res.data;
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
  loadData(): void {
    const params = new HttpParams()
    .set('pageIndex', this.pageIndex.toString())
    .set('pageSize', this.pageSize.toString())
    .set('keyword', this.keyword)
    .set('jobGroupOptionId',this.jobgroupoptionId?.toString())
    this.busy = this.optionProcedureService.getPaging(params).subscribe((res: ResponseValue<Pagination<Optionprocedure>>) => {
      console.log(res);
      if (res.code == '200' || res.code == '201') {
        this.listOptionProcedure = res.data?.items
        this.totalRows = res.data?.totalRows;
      }
      else {
        if(res.code == '204')
        {
          this.listOptionProcedure=[];
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
    this.jobgroupoptionId=event?.id;
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
    const index = this.listOptionProcedure.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listOptionProcedure[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listOptionProcedure.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.optionProcedureService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listOptionProcedure.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listOptionProcedure)
      return this.listOptionProcedure.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listOptionProcedure.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
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
