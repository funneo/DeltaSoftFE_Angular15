import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalRoleComponent } from '@app/shared/components/systems/modal-role/modal-role.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, Role } from '@app/shared/models';
import { NotificationService, RolesService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listRoles: Role[];
  busy: Subscription;
  viewModal = false;
  @ViewChild(ModalRoleComponent) public modalAddEdit: ModalRoleComponent;
  constructor(private roleService: RolesService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadRole();
  }

  loadRole(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword);
    this.busy = this.roleService.getAllPaging(params).subscribe((res: Pagination<Role>) => {
      this.listRoles = res.items;
      this.totalRows = res.totalRows;
    });
  }

  clickRow(item: Role): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadRole();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadRole();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean, item: Role = null): void {
    if (!item) {
      const index = this.listRoles.findIndex(x => x.checked);
      if (index != -1)
        item = this.listRoles[index];
    }
    let id = item?.id;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    const index = this.listRoles.findIndex(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(this.listRoles[index].id));
  }

  delete(id: string): void {
    this.roleService.delete(id).subscribe(() => {
      this.loadRole();
    });
  }

  checkAll(ev) {
    this.listRoles.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listRoles)
      return this.listRoles.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listRoles.filter(x => x.checked);
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
    this.loadRole();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  ngOnDestroy(): void {
    this.busy.unsubscribe();
  }

}
