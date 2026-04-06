import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPermissionPaymentComponent } from '@app/shared/components/systems/modal-permission-payment/modal-permission-payment.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, PermissionPayment, ResponseValue } from '@app/shared/models';
import { BranchService, NotificationService, PermissionPaymentService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permission-payment',
  templateUrl: './permission-payment.component.html',
  styleUrls: ['./permission-payment.component.css']
})
export class PermissionPaymentComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listPermissionPayment: PermissionPayment[];
  listBranch: Branch[];
  _branchId:number;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit: boolean = false;
  @ViewChild(ModalPermissionPaymentComponent, { static: false }) modalAddEdit: ModalPermissionPaymentComponent
  constructor(private branchService: BranchService,private permissionPaymentService: PermissionPaymentService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString());
    this.busy = this.permissionPaymentService.getPaging(params).subscribe((res: ResponseValue<Pagination<PermissionPayment>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPermissionPayment = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: PermissionPayment): void {
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

  edit(flag: boolean, item: PermissionPayment = null): void {
    let _id = '';
    if (item != null) {
      _id = item.id.toString();
    }
    else {
      const index = this.listPermissionPayment.findIndex(x => x.checked);
      _id = this.listPermissionPayment[index].id.toString();
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(_id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listPermissionPayment.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.permissionPaymentService.delete(listIds).subscribe(() => {
      this.loadData();
    });
  }

  checkAll(ev) {
    this.listPermissionPayment.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listPermissionPayment)
      return this.listPermissionPayment.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listPermissionPayment.filter(x => x.checked);
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
