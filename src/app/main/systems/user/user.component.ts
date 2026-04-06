import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalMatKhauComponent } from '@app/shared/components/systems/modal-mat-khau/modal-mat-khau.component';
import { ModalUserComponent } from '@app/shared/components/systems/modal-user/modal-user.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, User } from '@app/shared/models';
import { NotificationService, UserService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listUsers: User[];
  busy: Subscription;
  viewModal = false;
  viewModalResetPass=false;
  @ViewChild(ModalUserComponent) public modalAddEdit: ModalUserComponent;
  @ViewChild(ModalMatKhauComponent , { static: false }) public modalResetPass: ModalMatKhauComponent;
  constructor(private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const params = new HttpParams()
    .set('pageIndex', this.pageIndex.toString())
    .set('pageSize', this.pageSize.toString())
    .set('branchId', '')
    .set('keyword', this.keyword);
    this.busy = this.userService.getAllPaging(params).subscribe((res: Pagination<User>) => {
      this.listUsers = res.items;
      this.totalRows = res.totalRows;
    });
  }

  clickRow(item: User): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadUser();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadUser();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean,item:User=null): void {
    if(!item){
      const index = this.listUsers.findIndex(x => x.checked);
      if(index!=-1)
      item=this.listUsers[index];
    }
    let id=item?.id;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id, flag);
    }, 50);
  }


  deleteConfirm(): void {
    const index = this.listUsers.findIndex(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(this.listUsers[index].id));
  }

  delete(id: string): void {
    this.userService.delete(id).subscribe(() => {
      this.loadUser();
    });
  }

  checkAll(ev) {
    this.listUsers.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listUsers)
      return this.listUsers.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listUsers.filter(x => x.checked);
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
    this.loadUser();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  ngOnDestroy(): void {
    this.busy.unsubscribe();
  }

  showResetMatKhau(){
    this.viewModalResetPass = true;
    let listcheck = this.listUsers.filter(x => x.checked);
    setTimeout(() => {
      this.modalResetPass.viewModal(listcheck[0].userName);
    }, 50);
}

closeModalReset()
{
  this.viewModalResetPass=false;
}

}
