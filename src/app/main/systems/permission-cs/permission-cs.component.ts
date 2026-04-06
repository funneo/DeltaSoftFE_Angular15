import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPermissionCsComponent } from '@app/shared/components/systems/modal-permission-cs/modal-permission-cs.component';
import { MessageContstants } from '@app/shared/constants';
import { PermissionCS, Pagination, ResponseValue, Branch } from '@app/shared/models';
import { BranchService, NotificationService, PermissionCSService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permission-cs',
  templateUrl: './permission-cs.component.html',
  styleUrls: ['./permission-cs.component.css']
})
export class PermissionCsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listPermissionCs: PermissionCS[];
  listBranch: Branch[];
  _branchId:number;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalPermissionCsComponent, { static: false }) modalAddEdit: ModalPermissionCsComponent
  constructor(private branchService: BranchService,private permissionCsService: PermissionCSService, private notificationService: NotificationService) { }

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
      this.busy = this.permissionCsService.getPaging(params).subscribe((res: ResponseValue<Pagination<PermissionCS>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPermissionCs = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: PermissionCS): void {
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

  edit(flag: boolean ,item: PermissionCS = null): void {
    let _id = '';
    if (item != null) {
      _id = item.id.toString();
    }
    else {
      const index = this.listPermissionCs.findIndex(x => x.checked);
      _id = this.listPermissionCs[index].id.toString();
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(_id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listPermissionCs.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.permissionCsService.delete(listIds).subscribe(() => {
      this.loadData();
    });
  }

  checkAll(ev) {
    this.listPermissionCs.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listPermissionCs)
      return this.listPermissionCs.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listPermissionCs.filter(x => x.checked);
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
