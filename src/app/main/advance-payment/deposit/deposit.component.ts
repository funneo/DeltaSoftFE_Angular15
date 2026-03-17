import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Deposit, Pagination, Employee, ResponseValue } from '@app/shared/models';
import { AuthService, EmployeeService, NotificationService, DepositService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalDepositComponent } from '@app/shared/components/advance-payment/modal-deposit/modal-deposit.component';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listDeposit: Deposit[];
  listEmployee: Employee[];
  _acc:boolean=false;
  _accept:boolean=false;
  _auth:number=5;
  _employeeId:number;
  _entity:Deposit;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  // flagAccounts: boolean = false;
  // flagComplete: boolean = false;
  _hubConnection: signalR.HubConnection;
  @ViewChild(ModalDepositComponent, { static: false }) modalAddEdit: ModalDepositComponent
  constructor(private depositService: DepositService, private notificationService: NotificationService,
    private _utilityService: UtilityService, private employeeService: EmployeeService, private authService: AuthService) {
      let user = this.authService.getLoggedInUser();
      this._auth=Number.parseInt(user.authorisationLevel);
      // this._employeeId=Number.parseInt(user.employeeId);
      this._acc = this.authService.hasPermission('DEPOSIT_ACCOUNT');
      this._accept = this.authService.hasPermission('DEPOSIT_ACCEPT');
      // this.employeeId=this._employeeId;
     }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    // this.loadEmployee();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  // loadEmployee() {
  //   const params = new HttpParams();
  //   this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
  //     this.listEmployee = res.data;
  //   });
  // }

  // changedEmployee(event: Employee) {
  //   this._employeeId = event?.id;
  //   this.loadData();
  // }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString());
    this.busy = this.depositService.getPaging(params).subscribe((res: ResponseValue<Pagination<Deposit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDeposit = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: Deposit): void {
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

  edit(item:Deposit=null, flag: boolean): void {
    const index = this.listDeposit.findIndex(x => x.checked);
    let _id=this.listDeposit[index]?.id.toString();
    if(item)
    _id=item.id.toString();
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(_id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDeposit.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.depositService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listDeposit.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listDeposit)
      return this.listDeposit.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listDeposit.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
        this.flagDelete = !checks[0].isComplete;
        this.flagEdit = !checks[0].isComplete;

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

  closeModal(): void {
    this.viewModal = false;
  }

  saveAccept(entity:Deposit): void {
    this.notificationService.printConfirmationDialog('Bạn chắc chắc muốn thực hiện xác nhận này?', () =>{
      let item: Deposit = {
        id: entity.id,
        feedback: entity.isComplete?'Paymented': 'Completed',
        status: true
      };
      this.depositService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
      });
    });
  }
}
