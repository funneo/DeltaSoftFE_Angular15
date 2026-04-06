import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalHandlinggroupComponent } from '@app/shared/components/danhmuc/modal-handlinggroup/modal-handlinggroup.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue } from '@app/shared/models';
import { Handlinggroup } from '@app/shared/models/handlinggroup';
import { NotificationService } from '@app/shared/services';
import { HandlinggroupService } from '@app/shared/services/handlinggroup.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-handlinggroups',
  templateUrl: './handlinggroups.component.html',
  styleUrls: ['./handlinggroups.component.css']
})
export class HandlinggroupsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listHandlingGroup: Handlinggroup[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalHandlinggroupComponent, { static: false }) modalAddEdit: ModalHandlinggroupComponent
  constructor(
    private handlingService:HandlinggroupService,private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.handlingService.getPaging(params).subscribe((res: ResponseValue<Pagination<Handlinggroup>>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listHandlingGroup = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: Handlinggroup): void {
    item.checked = !item.checked;
    this.listHandlingGroup.forEach(it=>{
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
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listHandlingGroup.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listHandlingGroup[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listHandlingGroup.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.handlingService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listHandlingGroup.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listHandlingGroup)
      return this.listHandlingGroup.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listHandlingGroup.filter(x => x.checked);
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
