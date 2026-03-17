import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Repayment, Pagination, Employee, ResponseValue, Branch } from '@app/shared/models';
import { AuthService, BranchService, EmployeeService, NotificationService, RepaymentService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalRepaymentComponent } from '@app/shared/components/advance-payment/modal-repayment/modal-repayment.component';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-repayment',
  templateUrl: './repayment.component.html',
  styleUrls: ['./repayment.component.css']
})
export class RepaymentComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listRepayment: Repayment[];
  listEmployee: Employee[];
  employeeId?: number;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  totalMoney=0;
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _entity: Repayment;
  _viewAll = 2;
  _functionId = SystemContstants.LOAN;
  _hubConnection: signalR.HubConnection;
  listBranch:Branch[];
  _branchId: number;
  @ViewChild(ModalRepaymentComponent, { static: false }) modalAddEdit: ModalRepaymentComponent
  @ViewChild(ModalPhieuThuComponent, { static: false }) modalAccounts: ModalPhieuThuComponent
  constructor(private repaymentService: RepaymentService, private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private exportService:ExportService, private employeeService: EmployeeService, private authService: AuthService,private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('REPAYMENT_ACCOUNT');
    this._accept = this.authService.hasPermission('REPAYMENT_ACCEPT');
    this.employeeId = this._employeeId;
    this._branchId = Number.parseInt(user.branchId);
    //signalR
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/signalr`)
      .build();

    this._hubConnection
      .start()
      .then(() => console.log('Connection started!'))
      .catch(err => console.log('Error while establishing connection :('));

    this._hubConnection.on('sendToAll', (receivedMessage: string) => {
      this.loadData();
    });
  }

  ngOnInit(): void {
    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == this._functionId);
    if (i != -1) {
      this._viewAll = list[i].value;
    }
    if (this._auth <= this._viewAll){
      this._employeeId = null;
    }
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadEmployee();
    this.loadChiNhanh();
    this.loadData();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    if (this._auth <= this._viewAll){
      this._employeeId = null;
    }
    this.loadEmployee();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadEmployee() {
    const params = new HttpParams()
    .set('branchId',this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event: Employee) {
    this._employeeId = event?.id;
    this.loadData();
  }
  export() {
    let printList = this.listRepayment.map(({ id, status, branchId,  employeeId,
      type,...item }) => item);
     this.exportService.exportExcel(printList, 'tra-vay-ca-nhan');
  }
  loadData(): void {
    this.totalMoney=0;
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branchId?.toString())
      .set('employeeId', this._employeeId?.toString());
    this.busy = this.repaymentService.getPaging(params).subscribe((res: ResponseValue<Pagination<Repayment>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listRepayment = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.listRepayment.forEach(x => {
          this.totalMoney += x.amount;
          x.styleStep = x.step > 0 ? '2' : x.step.toString();
          if (!x.status)
            x.styleStep = "Locked";
          if (x.isComplete)
            x.styleStep = 'THUTIEN';
        });
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: Repayment): void {
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

  add(type: number): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(type);
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listRepayment.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listRepayment[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listRepayment.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.repaymentService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listRepayment.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listRepayment)
      return this.listRepayment.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listRepayment.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      if (checks[0].step == -1 || checks[0].step == 0) {
        this.flagDelete = checks[0].employeeId == this.employeeId;
        this.flagEdit = checks[0].employeeId == this.employeeId;
      }
    }
    // else if (checks.length > 1) {
    //   this.flagDelete = false;
    //   this.flagEdit = false;
    //   this.flagAccounts=false;
    // }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: Repayment) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showAccounts(entity: Repayment) {
    this._entity = entity;
    let item: any = {};
    item.groupType = 1;
    item.employeeId = entity.employeeId;
    item.amount = entity.amount;
    item.refNo = entity.refNo;
    item.notes = 'Trả nợ vay cá nhân';
    item.typeAccount=5;
    item.advanceId=entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalAccounts.add(item);
    }, 50);
  }

  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      let item: Repayment = {
        id: this._entity.id,
        feedback: 'Completed',
        status: true
      };
      this.repaymentService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
      });
    }
  }

  closeAccounts(): void {
    this.viewAccounts = false;
  }

  accept(entity: Repayment, b: boolean) {
    let item: Repayment = {
      id: entity.id,
      feedback: '',
      status: b
    };
    let _ok = b;
    if (!b) {
      let retVal = prompt("Lý do từ chối", '');
      if (retVal) {
        _ok = true;
      }
      item.feedback = retVal ?? '';
    }
    if (_ok) {
      this.repaymentService.accept(item).subscribe((res: ResponseValue<any>) => {
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
