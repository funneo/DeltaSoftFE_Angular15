import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Pagination, Employee, ResponseValue } from '@app/shared/models';
import { EmployeeService, NotificationService, AccountsService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
//import { ModalAccountsComponent } from '@app/shared/components/advance-payment/modal-accounts/modal-accounts.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listAccounts: Accounts[];
  listEmployee: Employee[];
  employeeId?: number;
  busy: Subscription;
  viewModal = false;
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  //@ViewChild(ModalAccountsComponent, { static: false }) modalAddEdit: ModalAccountsComponent
  constructor(private accountsService: AccountsService, private notificationService: NotificationService, private _utilityService: UtilityService, private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadEmployee();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadEmployee() {
    const params = new HttpParams();
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event: Employee) {
    this.employeeId = event?.id;
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this.employeeId?.toString());
    this.busy = this.accountsService.getPaging(params).subscribe((res: ResponseValue<Pagination<Accounts>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listAccounts = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: Accounts): void {
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
      //this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listAccounts.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
     // this.modalAddEdit.edit(this.listAccounts[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    const checksToDelete = this.listAccounts
      .filter(account => account.checked)
      .map(account => account.id);
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG, 
      () => this.delete(checksToDelete.join(','))
    );
  }

  delete(listIds: string): void {
    this.accountsService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listAccounts.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listAccounts)
      return this.listAccounts.every(_ => _.checked);
  }

  icheck() {
    const checkedAccounts = this.listAccounts.filter(x => x.checked);
    const checkedCount = checkedAccounts.length;
    this.flagDelete = checkedCount > 0;
    this.flagEdit = checkedCount === 1;
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item:Accounts) {
    this.viewModal = true;
    setTimeout(() => {
    //  this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
