import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, EmployeeDebit, Employee } from '@app/shared/models';
import { NotificationService, UtilityService, AuthService, EmployeeService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { EmployeeDebitService } from '@app/shared/services/employee-debit.service';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-employee-debit-credit-detail',
  templateUrl: './employee-debit-credit-detail.component.html',
  styleUrls: ['./employee-debit-credit-detail.component.css']
})
export class EmployeeDebitCreditDetailComponent implements OnInit {
  @ViewChild('modalDetail', { static: false }) modalDetail: ModalDirective;
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDatas: EmployeeDebit[];
  busy: Subscription;
  viewModal = false;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId: number;
  _quyen: number;
  _viewAll = -1;
  _functionId = SystemContstants.EMPLOYEEDEBIT;
  ngayBatDau: string;
  ngayKetThuc: string;

  constructor(private employeeDebitService: EmployeeDebitService, private notificationService: NotificationService, private _utilityService: UtilityService,
     private authService: AuthService, private employeeService: EmployeeService, private router: Router) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen = Number.parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
   
  }

  show(id: number, fromDate: string, toDate: string) {
    console.log('[DetailModal] show() called - id:', id, 'fromDate:', fromDate, 'toDate:', toDate);
    this._employeeId = id;
    this.ngayBatDau = fromDate;
    this.ngayKetThuc = toDate;
    this.listDatas = [];
    this.loadEmployee();
    this.loadDataDetail();
    this.modalDetail.show();
  }

  selectedDate(event) {

    this.loadDataDetail();
  }

  loadEmployee() {
    // const params = new HttpParams()
    // .set('branchId', this._branchId.toString());
    this.employeeService.getDetail(this._employeeId.toString()).subscribe((res: ResponseValue<Employee>) => {
      this.listEmployee = [];
      this.listEmployee.push(res.data);
    });
  }

  changedEmployee(event: any): void {
    this.loadDataDetail();
  }

  loadDataDetail(): void {
    if (this._employeeId == null || this._employeeId.toString() == '') {
      return;
    }
    const params = new HttpParams()
      .set('fromDate', this.ngayBatDau)
      .set('toDate', this.ngayKetThuc)
      .set('employeeId', this._employeeId?.toString())
    this.busy = this.employeeDebitService.reportDetail(params).subscribe((res: ResponseValue<EmployeeDebit[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDatas = res.data;
      }
      else if (res.code == '204') {
        this.listDatas = [];
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadDataDetail();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;

    this.loadDataDetail();
  }



  closeModal(): void {
    this.modalDetail.hide();
  }

  exportExcel(): void {
    if (this._employeeId == null || this._employeeId.toString() == '') {
      return;
    }
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.employeeDebitService.exportExcel(params).subscribe((res: ResponseValue<EmployeeDebit[]>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl + res.data;
        a.download;
        a.click();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
}

