import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Rebets, Pagination, Employee, ResponseValue, Branch } from '@app/shared/models';
import { AuthService, BranchService, EmployeeService, NotificationService, RebetsService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalRebetsComponent } from '@app/shared/components/advance-payment/modal-rebets/modal-rebets.component';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-rebets',
  templateUrl: './rebets.component.html',
  styleUrls: ['./rebets.component.css']
})
export class RebetsComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  totalAmount=0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listRebets: Rebets[];
  listEmployee: Employee[];
  employeeId?: number;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _entity: Rebets;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  _viewAll = 2;
  _functionId = SystemContstants.BETS;
  listBranch:Branch[];
  _isAdmin=false;
  _branchId:number;

  _hubConnection: signalR.HubConnection;
  @ViewChild(ModalRebetsComponent, { static: false }) modalAddEdit: ModalRebetsComponent
  @ViewChild(ModalPhieuThuComponent, { static: false }) modalAccounts: ModalPhieuThuComponent
  constructor(private rebetsService: RebetsService, private notificationService: NotificationService,private _export:ExportService,
    private _utilityService: UtilityService, private employeeService: EmployeeService, private authService: AuthService,private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('REBETS_ACCOUNT');
    this._accept = this.authService.hasPermission('REBETS_ACCEPT');
    this.employeeId = this._employeeId;
    this._isAdmin=user.isAdmin;
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

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('branchId', this._branchId?.toString());
    this.busy = this.rebetsService.getPaging(params).subscribe((res: ResponseValue<Pagination<Rebets>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listRebets = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.totalAmount=res.data?.totalAmount;
        this.listRebets.forEach(x => {
          if (x.status)
            x.styleStep = "0";
          else
            x.styleStep = "Entity";
          if (x.isComplete)
            x.styleStep = '2';
        });
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  exportExcel(){
    let printList= this.listRebets.map(({ id,branchId,employeeId,status, ...item }) => item);
    this._export.exportExcel(printList,'tong-hop-hoan-cuoc');
  }

  clickRow(item: Rebets): void {
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
    const index = this.listRebets.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listRebets[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listRebets.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.rebetsService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listRebets.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listRebets)
      return this.listRebets.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listRebets.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      if (!checks[0].isComplete) {
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

  showModal(item: Rebets) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showAccounts(entity: Rebets) {
    this._entity = entity;
    let item: any = {};
    item.groupType = 1;
    item.employeeId = entity.employeeId;
    item.amount = entity.amount;
    item.refNo = entity.refNo;
    item.notes = 'Hoàn cược';
    item.typeAccount=4;
    item.advanceId=entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalAccounts.add(item);
    }, 50);
  }

  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      let item: Rebets = {
        id: this._entity.id,
        feedback: 'Completed',
        status: true
      };
      this.rebetsService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
      });
    }
  }

  closeAccounts(): void {
    this.viewAccounts = false;
  }

  saveAccept(): void {
    let index = this.listRebets.findIndex(x => x.checked);
    let entity = this.listRebets[index];

    let item: Rebets = {
      id: entity.id,
      feedback: 'Completed',
      status: true
    };
    this.rebetsService.accept(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
    });

  }

}
