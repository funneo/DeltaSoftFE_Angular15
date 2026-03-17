import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPermissionTrainingDocumentComponent } from '@app/shared/components/systems/modal-permission-training-document/modal-permission-training-document.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { ApproverPermissions } from '@app/shared/models/hrm/training-document-managment/approver-permissions';
import { BranchService, AuthService, NotificationService } from '@app/shared/services';
import { ApproverPermissionsService } from '@app/shared/services/hrm/training-document-managment/approver-permissions.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-permission-training-document',
  templateUrl: './permission-training-document.component.html',
  styleUrls: ['./permission-training-document.component.css']
})
export class PermissionTrainingDocumentComponent implements OnInit {
pageIndex = 1;
  pageSize = 999;
  totalRows = 0;
  keyword = '';
  flagDelete=false;
  flagNew=false;
  listData: ApproverPermissions[];

  viewModal = false;
  userLoged:Profile;
  _idSelected=0;

  @ViewChild(ModalPermissionTrainingDocumentComponent, { static: false }) modalAddEdit: ModalPermissionTrainingDocumentComponent
  constructor(private branchService:BranchService,
    private _authService:AuthService, 
    private _service: ApproverPermissionsService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadData();
  }



  changedBranch() {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      this._service.getAll(0).subscribe((res: ResponseValue<ApproverPermissions[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data;

        }
        else {
          if(res.code=='204'){
            this.listData = [];
            this.totalRows =0;
          }else{
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  clickRow(item: ApproverPermissions): void {
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
    let listId = this.listData.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listId) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this._service.delete(id).subscribe(() => {
      this.loadData();
    });
  }

  icheck() {
    let checks = this.listData.filter(x => x.checked);
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
