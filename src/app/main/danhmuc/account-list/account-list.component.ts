import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalAccountListComponent } from '@app/shared/components/danhmuc/modal-account-list/modal-account-list.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { AccountList, Branch, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, AccountListService, AuthService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listAccountList: AccountList[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  listBranch:Branch[];
  _isAdmin=false;
  _auth: number = 5;
  _branchId: number;

  @ViewChild(ModalAccountListComponent, { static: false }) modalAddEdit: ModalAccountListComponent
  constructor(private accountListService: AccountListService, private notificationService: NotificationService,private authService:AuthService,
    private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
    this._isAdmin=user.isAdmin;
   }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadData();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchId', this._branchId.toString())
      .set('keyword', this.keyword);
      this.busy = this.accountListService.getPaging(params).subscribe((res: ResponseValue<Pagination<AccountList>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listAccountList = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: AccountList): void {
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

  edit(item:AccountList=null, flag: boolean=true): void {
    if(!item){
      const index = this.listAccountList.findIndex(x => x.checked);
      item=this.listAccountList[index];
    }
    let id=item?.id;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listAccountList.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.accountListService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listAccountList.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listAccountList)
      return this.listAccountList.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listAccountList.filter(x => x.checked);
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
