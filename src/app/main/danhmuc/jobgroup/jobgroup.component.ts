import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalJobgroupComponent } from '@app/shared/components/danhmuc/modal-jobgroup/modal-jobgroup.component';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { Jobgroup } from '@app/shared/models/jobgroup';
import { NotificationService } from '@app/shared/services';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-jobgroup',
  templateUrl: './jobgroup.component.html',
  styleUrls: ['./jobgroup.component.css']
})
export class JobgroupComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listJobGroup: Jobgroup[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalJobgroupComponent, { static: false }) modalAddEdit: ModalJobgroupComponent
  
  constructor(
    private jobGroupServices:JobgroupService, private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      this.busy = this.jobGroupServices.getAll().subscribe((res: ResponseValue<Jobgroup[]>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listJobGroup = res.data
          this.totalRows = res.data?.length;
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
  
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  clickRow(item: Jobgroup): void {
    item.checked = !item.checked;
    this.listJobGroup.forEach(it=>{
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
    const index = this.listJobGroup.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listJobGroup[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listJobGroup.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.jobGroupServices.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }


  checkAll(ev) {
    this.listJobGroup.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listJobGroup)
      return this.listJobGroup.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listJobGroup.filter(x => x.checked);
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
