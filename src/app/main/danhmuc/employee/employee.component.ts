import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalEmployeeComponent } from '@app/shared/components/danhmuc/modal-employee/modal-employee.component';
import { ModalEmployeeHrComponent } from '@app/shared/components/danhmuc/modal-employee-hr/modal-employee-hr.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, BranchService, EmployeeService, AuthService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listBranch: Branch[];
  listEmployee:Employee[];
  _branchId:number;
  busy: Subscription;
  viewModal = false;
  viewModalHr = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalEmployeeComponent, { static: false }) modalAddEdit: ModalEmployeeComponent
  @ViewChild(ModalEmployeeHrComponent, { static: false }) modalHr: ModalEmployeeHrComponent
  constructor(private branchService: BranchService, private notificationService: NotificationService, private employeeService:EmployeeService,
    private authService:AuthService, private _export:ExportService) {
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

  export() {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString());
      this.busy = this.employeeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Employee>>) => {
        if (res.code == '200' || res.code == '201') {
          let exelList = res.data?.items;
          let printList=exelList.map(({departmentId,id,titleId,branchId, ...item }) => item);
          this._export.exportExcel(printList,'nhan-vien');
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
      .set('branchId', this._branchId?.toString());
      this.busy = this.employeeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Employee>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listEmployee = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  _
  changedBranch(event: Branch) {
    this._branchId = event?.id;
    this.loadData();
  }

  clickRow(item: Employee): void {
    item.checked = !item.checked;
    this.listEmployee.forEach(it=>{
      if(it!=item)it.checked=false;
    })
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
    const index = this.listEmployee.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listEmployee[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listEmployee.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id.toString()));
  }

  delete(listIds: string): void {
    this.employeeService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listEmployee.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listEmployee)
      return this.listEmployee.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listEmployee.filter(x => x.checked);
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

  // ===== Modal HR mới (Hồ sơ nhân viên đầy đủ) =====
  addHr(): void {
    this.viewModalHr = true;
    setTimeout(() => this.modalHr.add(), 50);
  }

  editHr(flag: boolean): void {
    const index = this.listEmployee.findIndex(x => x.checked);
    if (index < 0) return;
    this.viewModalHr = true;
    setTimeout(() => this.modalHr.edit(this.listEmployee[index].id.toString(), flag), 50);
  }

  closeModalHr(): void {
    this.viewModalHr = false;
  }

}
