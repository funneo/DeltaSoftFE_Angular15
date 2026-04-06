import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import {Pagination, Employee, ResponseValue, Branch, EmployeeLimit } from '@app/shared/models';
import { EmployeeService, NotificationService, EmployeeLimitService, UtilityService, BranchService, AuthService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalEmployeeLimitComponent } from '@app/shared/components/advance-payment/modal-employee-limit/modal-employee-limit.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-employee-limit',
  templateUrl: './employee-limit.component.html',
  styleUrls: ['./employee-limit.component.css']
})
export class EmployeeLimitComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listEmployeeLimit: EmployeeLimit[];
  listBranch:Branch[];
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  @ViewChild(ModalEmployeeLimitComponent, { static: false }) modalAddEdit: ModalEmployeeLimitComponent
  constructor(private employeeLimitService: EmployeeLimitService, private notificationService: NotificationService,
   private branchService: BranchService,private authService: AuthService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    }

  ngOnInit(): void {
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch(event: Branch) {
    this._branchId = event?.id;
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString());
    this.busy = this.employeeLimitService.getPaging(params).subscribe((res: ResponseValue<Pagination<EmployeeLimit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listEmployeeLimit = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: EmployeeLimit): void {
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

  edit(flag: boolean): void {
    const index = this.listEmployeeLimit.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listEmployeeLimit[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listEmployeeLimit.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.employeeLimitService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listEmployeeLimit.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listEmployeeLimit)
      return this.listEmployeeLimit.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listEmployeeLimit.filter(x => x.checked);
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

  showModal(item:EmployeeLimit) {
    this.viewModal = true;
    if(item.id){
      setTimeout(() => {
        this.modalAddEdit.edit(item.id.toString(), false);
      }, 50);
    }
    else{
      setTimeout(() => {
        this.modalAddEdit.add({id:item.employeeId,branchId: this._branchId});
      }, 50);
    }

  }

  closeModal(): void {
    this.viewModal = false;
  }

}
