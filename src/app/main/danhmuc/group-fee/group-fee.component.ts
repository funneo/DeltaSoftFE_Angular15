import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalGroupFeeComponent } from '@app/shared/components/danhmuc/modal-group-fee/modal-group-fee.component';
import { ModalDebitNoteZeroComponent } from '@app/shared/components/systems/modal-debit-note-zero/modal-debit-note-zero.component';
import { ModalDebitNoteZeroModule } from '@app/shared/components/systems/modal-debit-note-zero/modal-debit-note-zero.module';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { GroupFee, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, GroupFeeService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-fee',
  templateUrl: './group-fee.component.html',
  styleUrls: ['./group-fee.component.css']
})
export class GroupFeeComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listGroupFee: GroupFee[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalDebitNoteZeroComponent, { static: false }) modalDebitNoteZero: ModalDebitNoteZeroComponent
  @ViewChild(ModalGroupFeeComponent, { static: false }) modalAddEdit: ModalGroupFeeComponent
  constructor(private groupFeeService: GroupFeeService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.groupFeeService.getPaging(params).subscribe((res: ResponseValue<Pagination<GroupFee>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listGroupFee = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: GroupFee): void {
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

  viewModalDebitnote=false;
  debit(): void {
    this.viewModalDebitnote = true;
    setTimeout(() => {
      this.modalDebitNoteZero.view();
    }, 50);
  }

  edit(item:GroupFee=null, flag: boolean=true): void {
    let id=item?.id;
    if(!id){
      const index = this.listGroupFee.findIndex(x => x.checked);
      id=this.listGroupFee[index]?.id;
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listGroupFee.filter(x => x.checked);
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
    this.listGroupFee.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listGroupFee)
      return this.listGroupFee.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listGroupFee.filter(x => x.checked);
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
  closeModalDebit(): void {
    this.viewModalDebitnote = false;
  }
}
