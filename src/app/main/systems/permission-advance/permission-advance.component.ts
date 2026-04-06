import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPermissionAdvanceComponent } from '@app/shared/components/systems/modal-permission-advance/modal-permission-advance.component';
import { MessageContstants } from '@app/shared/constants';
import { PermissionAdvance, Pagination, ResponseValue, Branch } from '@app/shared/models';
import { BranchService, NotificationService, PermissionAdvanceService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permission-advance',
  templateUrl: './permission-advance.component.html',
  styleUrls: ['./permission-advance.component.css']
})
export class PermissionAdvanceComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listPermissionAdvance: PermissionAdvance[];
  listBranch: Branch[];
  _branchId:number;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalPermissionAdvanceComponent, { static: false }) modalAddEdit: ModalPermissionAdvanceComponent
  constructor(private branchService:BranchService, private permissionAdvanceService: PermissionAdvanceService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadData();
    this.loadBranch();
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
      this.busy = this.permissionAdvanceService.getPaging(params).subscribe((res: ResponseValue<Pagination<PermissionAdvance>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPermissionAdvance = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: PermissionAdvance): void {
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

  edit(flag: boolean ,item: PermissionAdvance = null): void {
    let _id = '';
    if (item != null) {
      _id = item.id.toString();
    }
    else {
      const index = this.listPermissionAdvance.findIndex(x => x.checked);
      _id = this.listPermissionAdvance[index].id.toString();
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(_id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listPermissionAdvance.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.permissionAdvanceService.delete(listIds).subscribe(() => {
      this.loadData();
    });
  }

  checkAll(ev) {
    this.listPermissionAdvance.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listPermissionAdvance)
      return this.listPermissionAdvance.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listPermissionAdvance.filter(x => x.checked);
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
