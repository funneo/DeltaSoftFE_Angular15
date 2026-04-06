import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalAdvanceGroupComponent } from '@app/shared/components/danhmuc/modal-advance-group/modal-advance-group.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { AdvanceGroup, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, AdvanceGroupService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-advance-group',
  templateUrl: './advance-group.component.html',
  styleUrls: ['./advance-group.component.css']
})
export class AdvanceGroupComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listAdvanceGroup: AdvanceGroup[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalAdvanceGroupComponent, { static: false }) modalAddEdit: ModalAdvanceGroupComponent
  constructor(private advanceGroupService: AdvanceGroupService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.advanceGroupService.getPaging(params).subscribe((res: ResponseValue<Pagination<AdvanceGroup>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listAdvanceGroup = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: AdvanceGroup): void {
    item.checked = !item.checked;
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

  edit(item:AdvanceGroup=null, flag: boolean=true): void {
    if(!item){
      const index = this.listAdvanceGroup.findIndex(x => x.checked);
      item=this.listAdvanceGroup[index];
    }
    let id=item?.id;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listAdvanceGroup.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.advanceGroupService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listAdvanceGroup.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listAdvanceGroup)
      return this.listAdvanceGroup.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listAdvanceGroup.filter(x => x.checked);
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
