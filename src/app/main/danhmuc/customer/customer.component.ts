import { ExportService } from '@app/shared/services/export-excel.service';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomerComponent } from '@app/shared/components/danhmuc/modal-customer/modal-customer.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Customer, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { NotificationService, BranchService, CustomerService, AuthService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { userInfo } from 'os';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listBranch: Branch[];
  listCustomer: Customer[];
  listLocked: Customer[];
  busy: Subscription;
  viewModal = false;
  flagLinkEdit: boolean = false;
  _accept: boolean = false;
  user: Profile;
  @ViewChild(ModalCustomerComponent, { static: false }) modalAddEdit: ModalCustomerComponent
  constructor(private branchService: BranchService, private notificationService: NotificationService, private customerService: CustomerService,
    private authService: AuthService,private _export:ExportService) {
    this.user = this.authService.getLoggedInUser();
    // this._branchId = Number.parseInt(user.branchId);
    this._accept = this.authService.hasPermission('CUSTOMER_ACCEPT');
  }

  ngOnInit(): void {
    this.loadData();
    this.loadLockedData();
  }

  exportExcel(){
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('keyword', this.keyword)
      .set('branchid', this.user.branchId)
    this.busy = this.customerService.getPaging(params).subscribe((res: ResponseValue<Pagination<Customer>>) => {
      (res);
      if (res.code == '200' || res.code == '201') {
        let listData = res.data?.items;
        this._export.exportExcel(listData,'danh-muc-khach-hang')
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchid', this.user.branchId)
      .set('locked', '0')
    this.busy = this.customerService.getPaging(params).subscribe((res: ResponseValue<Pagination<Customer>>) => {
      (res);
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  totalRowsLocked?:number;
  loadLockedData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchid', this.user.branchId)
      .set('locked', '1')
    this.busy = this.customerService.getPaging(params).subscribe((res: ResponseValue<Pagination<Customer>>) => {
      (res);
      if (res.code == '200' || res.code == '201') {
        this.listLocked = res.data?.items;
        this.totalRowsLocked = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: Customer): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  timKiemLocked(): void {
    this.pageIndex = 1;
    this.loadLockedData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  pageLockedChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadLockedData();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listCustomer.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listCustomer[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listCustomer.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.customerService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listCustomer.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listCustomer)
      return this.listCustomer.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listCustomer.filter(x => x.checked);
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
    this.loadLockedData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showModal(item: Customer) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  accept(item: Customer, b: boolean) {
    if (b) {
      const params = new HttpParams()
        .set('id', item.id.toString())
        .set('reason', 'Ok');
      this.customerService.accept(params).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      }, () => {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      });
    }
    else {
      var retVal = prompt("Lý do từ chối", "Lý do từ chối");
      if (retVal) {
        const params = new HttpParams()
          .set('id', item.id.toString())
          .set('reason', retVal);
        this.customerService.accept(params).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.loadData();
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
          }
        }, () => {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        });
      }
    }

  }

}
