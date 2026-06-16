import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalEmployeeHrComponent } from '@app/shared/components/danhmuc/modal-employee-hr/modal-employee-hr.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, BranchService, EmployeeService, AuthService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-hr',
  templateUrl: './employee-hr.component.html',
  styleUrls: ['./employee-hr.component.css']
})
export class EmployeeHrComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  keyword = '';
  listBranch: Branch[];
  listEmployee: Employee[];
  _branchId: number;
  busy: Subscription;
  viewModalHr = false;
  @ViewChild(ModalEmployeeHrComponent, { static: false }) modalHr: ModalEmployeeHrComponent;

  constructor(private branchService: BranchService, private notificationService: NotificationService,
    private employeeService: EmployeeService, private authService: AuthService) {
    const user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => { this.listBranch = res.data; });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString());
    this.busy = this.employeeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Employee>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listEmployee = res.data?.items;
        this.totalRows = res.data?.totalRows;
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  changedBranch(event: Branch) { this._branchId = event?.id; this.loadData(); }
  timKiem(): void { this.pageIndex = 1; this.loadData(); }
  pageChanged(event: PageChangedEvent): void { this.pageIndex = event.page; this.loadData(); }

  clickRow(item: Employee): void {
    item.checked = !item.checked;
    this.listEmployee.forEach(it => { if (it != item) it.checked = false; });
    this.icheck();
  }

  icheck() {
    const checks = this.listEmployee.filter(x => x.checked);
    this.flagEdit = checks.length == 1;
  }

  add(): void {
    this.viewModalHr = true;
    setTimeout(() => this.modalHr.add(), 50);
  }

  edit(flag: boolean): void {
    const index = this.listEmployee.findIndex(x => x.checked);
    if (index < 0) return;
    this.viewModalHr = true;
    setTimeout(() => this.modalHr.edit(this.listEmployee[index].id.toString(), flag), 50);
  }

  saveSuccess(): void { this.loadData(); }
  closeModalHr(): void { this.viewModalHr = false; }
}
