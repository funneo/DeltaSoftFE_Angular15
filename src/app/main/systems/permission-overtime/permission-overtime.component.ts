import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalOvertimeComponent } from '@app/shared/components/hrm/modal-overtime/modal-overtime.component';
import { ModalPermissionOvertimeComponent } from '@app/shared/components/systems/modal-permission-overtime/modal-permission-overtime.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { PermissionOvertime } from '@app/shared/models/permission-overtime';
import { AuthService, BranchService, NotificationService } from '@app/shared/services';
import { PermissionOvertimeService } from '@app/shared/services/permission-overtime.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permission-overtime',
  templateUrl: './permission-overtime.component.html',
  styleUrls: ['./permission-overtime.component.css']
})
export class PermissionOvertimeComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  keyword = '';

  flagDelete=false;
  flagNew=false;
  listPermissionOvertime: PermissionOvertime[];
  listBranch: Branch[];
  _branchId:number;
  busy: Subscription;
  viewModal = false;
  userLoged:Profile;
  _idSelected=0;

  @ViewChild(ModalPermissionOvertimeComponent, { static: false }) modalAddEdit: ModalPermissionOvertimeComponent
  constructor(private branchService:BranchService,
    private _authService:AuthService, 
    private permissionOvertimeService: PermissionOvertimeService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this._branchId=Number.parseInt(this.userLoged.branchId);
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
      this.busy = this.permissionOvertimeService.getPaging(params).subscribe((res: ResponseValue<Pagination<PermissionOvertime>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPermissionOvertime = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listPermissionOvertime = [];
            this.totalRows =0;
          }else{
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  clickRow(item: PermissionOvertime): void {
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

  edit(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this._idSelected);
    }, 50);
  }

  deleteConfirm(): void {
    let listId = this.listPermissionOvertime.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listId) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.permissionOvertimeService.delete(id).subscribe(() => {
      this.loadData();
    });
  }

  icheck() {
    let checks = this.listPermissionOvertime.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this._idSelected=checks[0].id;
    }
    else {
      this.flagDelete = false;
      this._idSelected=0;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
