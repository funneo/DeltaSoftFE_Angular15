import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalRevenueFeeComponent } from '@app/shared/components/danhmuc/modal-revenue-fee/modal-revenue-fee.component';
import { MessageContstants } from '@app/shared/constants';
import { RevenueFeeGroup, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, RevenueFeeGroupService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-revenue-fee',
  templateUrl: './revenue-fee.component.html',
  styleUrls: ['./revenue-fee.component.css']
})
export class RevenueFeeComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listRevenueFeeGroup: RevenueFeeGroup[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalRevenueFeeComponent, { static: false }) modalAddEdit: ModalRevenueFeeComponent
  constructor(private groupFeeService: RevenueFeeGroupService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.groupFeeService.getPaging(params).subscribe((res: ResponseValue<Pagination<RevenueFeeGroup>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listRevenueFeeGroup = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: RevenueFeeGroup): void {
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

  edit(item:RevenueFeeGroup=null, flag: boolean=true): void {
    let id=item?.id;
    if(!id){
      const index = this.listRevenueFeeGroup.findIndex(x => x.checked);
      id=this.listRevenueFeeGroup[index]?.id;
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listRevenueFeeGroup.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.groupFeeService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }
  checkAll(ev) {
    this.listRevenueFeeGroup.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listRevenueFeeGroup)
      return this.listRevenueFeeGroup.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listRevenueFeeGroup.filter(x => x.checked);
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
