import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { DebtInventory, Pagination, Employee, ResponseValue } from '@app/shared/models';
import { AuthService, EmployeeService, NotificationService, DebtInventoryService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalInventoryComponent } from '@app/shared/components/advance-payment/modal-inventory/modal-inventory.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-debt-inventory',
  templateUrl: './debt-inventory.component.html',
  styleUrls: ['./debt-inventory.component.css']
})
export class DebtInventoryComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listDebtInventory: DebtInventory[];
  listEmployee: Employee[];
  // _acc:boolean=false;
  // _accept:boolean=false;
  // _auth:number=5;
  _employeeId:number;
  _entity:DebtInventory;
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
  @ViewChild(ModalInventoryComponent, { static: false }) modalAddEdit: ModalInventoryComponent
  constructor(private debtInventoryService: DebtInventoryService, private notificationService: NotificationService,
    private _utilityService: UtilityService, private employeeService: EmployeeService, private authService: AuthService) {
      // let user = this.authService.getLoggedInUser();
      // this._auth=Number.parseInt(user.authorisationLevel);
      // this._employeeId=Number.parseInt(user.employeeId);
      // this._acc = this.authService.hasPermission('DEPOSIT_ACCOUNT');
      // this._accept = this.authService.hasPermission('DEPOSIT_ACCEPT');
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
    this.busy = this.debtInventoryService.getPaging(params).subscribe((res: ResponseValue<Pagination<DebtInventory>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebtInventory = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: DebtInventory): void {
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

  edit(item:DebtInventory=null, flag: boolean): void {
    const index = this.listDebtInventory.findIndex(x => x.checked);
    let _id=this.listDebtInventory[index]?.id.toString();
    if(item)
    _id=item.id.toString();
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(_id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDebtInventory.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.debtInventoryService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listDebtInventory.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listDebtInventory)
      return this.listDebtInventory.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listDebtInventory.filter(x => x.checked);
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

  submitOK(entity:DebtInventory,b:true): void {
    this.notificationService.printConfirmationDialog('Bạn chắc chắc muốn thực hiện xác nhận này?', () =>{
      let item: DebtInventory = {
        id: entity.id,
        feedback: 'Completed',
        status: true
      };
      this.debtInventoryService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG + '\n' + res.code)
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + '\n' + res.code)
        }
      });
    });
  }

}
