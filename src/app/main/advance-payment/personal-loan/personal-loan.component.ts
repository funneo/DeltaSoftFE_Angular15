import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { PersonalLoan, Pagination, Employee, ResponseValue, Branch } from '@app/shared/models';
import { AuthService, BranchService, EmployeeService, NotificationService, PersonalLoanService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalPersonalLoanComponent } from '@app/shared/components/advance-payment/modal-personal-loan/modal-personal-loan.component';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { ModalRepaymentHistoryComponent } from '@app/shared/components/advance-payment/modal-repayment-history/modal-repayment-history.component';
import { ModalListPersonalLoanLogComponent } from '@app/shared/components/advance-payment/modal-list-personal-loan-log/modal-list-personal-loan-log.component';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-personal-loan',
  templateUrl: './personal-loan.component.html',
  styleUrls: ['./personal-loan.component.css'],
  providers: [DatePipe]
})
export class PersonalLoanComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listPersonalLoan: PersonalLoan[];
  listFilter: PersonalLoan[];          // danh sách sau khi lọc client-side (bind ra bảng)
  // ===== Bộ lọc theo cột (FE only) =====
  fEmployee = '';
  fRefNo = '';
  fDate = '';
  fAmount = '';
  fReason = '';
  fRepayment = '';
  fStatus = '';
  listEmployee: Employee[];
  employeeId?: number;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  totalMoney: 0;
  viewRepaymentHistory: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  listBranch: Branch[];
  _branchId: number;
  _levelPermissionAdvance: number;
  _hasPermissionAdvance: boolean = false;
  _entity: PersonalLoan;

  _viewAll = 2;
  _functionId = SystemContstants.LOAN;

  _hubConnection: signalR.HubConnection;
  @ViewChild(ModalPersonalLoanComponent, { static: false }) modalAddEdit: ModalPersonalLoanComponent
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalAccounts: ModalPhieuChiComponent
  @ViewChild(ModalRepaymentHistoryComponent, { static: false }) modalRepayment: ModalRepaymentHistoryComponent
  @ViewChild(ModalListPersonalLoanLogComponent, { static: false }) modalListLog: ModalListPersonalLoanLogComponent;
  viewListLog = false;
  constructor(private personalLoanService: PersonalLoanService, private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private exportService: ExportService, private employeeService: EmployeeService, private authService: AuthService, private branchService: BranchService,
    private datepipe: DatePipe) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._branchId = Number.parseInt(user.branchId);
    this._levelPermissionAdvance = Number.parseInt(user.advanceConfirmLevel);
    this.employeeId = this._employeeId;
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

    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == this._functionId);
    if (i != -1) {
      this._viewAll = list[i].value;
    }
    if (this._auth <= this._viewAll) {
      this._employeeId = null;
    }
  }

  ngOnInit(): void {

    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadChiNhanh();
    this.loadEmployee();
    this.loadData();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    if (this._auth <= this._viewAll) {
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
      .set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event: Employee) {
    this._employeeId = event?.id;
    this.loadData();
  }

  loadData(): void {
    this.totalMoney = 0;
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    // Load TOÀN BỘ bản ghi trong kỳ → lọc + phân trang client-side để filter/tổng tiền/export nhất quán
    const params = new HttpParams()
      .set('pageIndex', '1')
      .set('pageSize', '99999')
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branchId?.toString())
      .set('employeeId', this._employeeId?.toString());
    this.busy = this.personalLoanService.getPaging(params).subscribe((res: ResponseValue<Pagination<PersonalLoan>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPersonalLoan = res.data?.items ?? [];
        this.listPersonalLoan.forEach(x => {
          x.step = x.acceptStep.toString();
          if (!x.status)
            x.step = "Locked";
          if (x.isComplete)
            x.step = 'Completed';
          if (x.isPayment)
            x.step = 'Paymented';
        })
        this.applyFilter();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  // Lọc client-side trên trang đang hiển thị (không gọi lại API)
  applyFilter(): void {
    let list = this.listPersonalLoan || [];
    const txt = (v: any) => (v ?? '').toString().toLowerCase().trim();
    if (txt(this.fEmployee)) list = list.filter(x => txt(x.employeeName).includes(txt(this.fEmployee)));
    if (txt(this.fRefNo)) list = list.filter(x => txt(x.refNo).includes(txt(this.fRefNo)));
    if (txt(this.fDate)) list = list.filter(x => txt(x.refDate ? this.datepipe.transform(x.refDate, 'dd/MM/yyyy') : '').includes(txt(this.fDate)));
    if (txt(this.fAmount)) list = list.filter(x => txt(x.amount).includes(txt(this.fAmount)));
    if (txt(this.fReason)) list = list.filter(x => txt(x.reason).includes(txt(this.fReason)));
    if (txt(this.fRepayment)) list = list.filter(x => txt(x.amountRepayment).includes(txt(this.fRepayment)));
    if (txt(this.fStatus)) list = list.filter(x => txt(this.statusText(x.step)).includes(txt(this.fStatus)));
    this.listFilter = list;
    // Tổng tiền + tổng số bản ghi đổi theo danh sách đã lọc (toàn bộ kỳ)
    this.totalMoney = list.reduce((s, x) => s + (x.amount ?? 0), 0) as any;
    this.totalRows = list.length;
    this.pageIndex = 1;
  }

  // Trang hiện tại sau khi lọc (phân trang client-side)
  get pagedList(): PersonalLoan[] {
    const list = this.listFilter || [];
    const start = (this.pageIndex - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  // Nhãn trạng thái hiển thị (để lọc theo chữ người dùng thấy)
  statusText(step: string): string {
    return this.listStatus.find(s => s.id === step)?.text ?? '';
  }

  export() {
    // Xuất đúng danh sách đang hiển thị sau khi lọc (client-side)
    let printList = (this.listFilter || []).map(({ id, status, branchId, employeeId, advanceGroupId,
      type, isTransfer, checked, step, ...item }) => item);
    if (printList.length == 0) {
      this.notificationService.printErrorMessage('Không có dữ liệu để xuất!');
      return;
    }
    this.exportService.exportExcel(printList, 'vay-ca-nhan');
  }

  clickRow(item: PersonalLoan): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    // Phân trang client-side — chỉ đổi trang, không gọi lại API
    this.pageIndex = event.page;
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listPersonalLoan.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listPersonalLoan[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listPersonalLoan.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.personalLoanService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.pagedList.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    const page = this.pagedList;
    return page.length ? page.every(_ => _.checked) : false;
  }

  icheck() {
    let checks = this.listPersonalLoan.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      if (checks[0].acceptStep == -1 || checks[0].acceptStep == 0 || checks[0].acceptStep == -2) {
        this.flagDelete = checks[0].employeeId == this.employeeId;
        this.flagEdit = checks[0].employeeId == this.employeeId;
      }
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
      this.flagView = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: PersonalLoan) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showAccounts(entity: PersonalLoan) {
    this._entity = entity;
    let item: any = {};
    item.groupType = 1;
    item.employeeId = entity.employeeId;
    item.amount = entity.amount;
    item.refNo = entity.refNo;
    item.notes = 'Vay cá nhân ' + entity.reason;
    item.typeAccount = 6;
    item.advanceId = entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalAccounts.add(item);
    }, 50);
  }

  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      let item: PersonalLoan = {
        id: this._entity.id,
        feedback: 'Completed',
        status: true
      };
      this.personalLoanService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
          //this.flagAccounts = false;
        }
      });
    }
  }

  closeAccounts(): void {
    this.viewAccounts = false;
  }

  showRepayment(item: PersonalLoan) {
    this.viewRepaymentHistory = true;
    if (item.amountRepayment > 0)
      setTimeout(() => {
        this.modalRepayment.showList(item.id);
      }, 50);
    else
      alert('Chưa có trả vay!')
  }

  closeRepayment() {
    this.viewRepaymentHistory = false;
  }

  accept(entity: PersonalLoan, b: boolean) {
    let item: PersonalLoan = {
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
      this.personalLoanService.accept(item).subscribe((res: ResponseValue<any>) => {
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

  showPersonalLoanLog(id: number) {
    this.viewListLog = true;
    setTimeout(() => {
      this.modalListLog.view(id);
    }, 50);
  }

  closeModalLog() {
    this.viewListLog = false;
  }
}
