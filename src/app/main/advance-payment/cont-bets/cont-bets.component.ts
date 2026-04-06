import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ContBets, Pagination, Employee, ResponseValue, Branch } from '@app/shared/models';
import { AuthService, EmployeeService, NotificationService, ContBetsService, UtilityService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { ModalContBetsComponent } from '@app/shared/components/advance-payment/modal-cont-bets/modal-cont-bets.component';
import { environment } from '@environments/environment';
import * as signalR from '@aspnet/signalr';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { DatePipe } from '@angular/common';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-cont-bets',
  templateUrl: './cont-bets.component.html',
  styleUrls: ['./cont-bets.component.css']
})
export class ContBetsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  totalAmount=0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = '';
  listContBets: ContBets[];
  listFilter: ContBets[];
  listEmployee: Employee[];
  employeeId?: number;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _entity: ContBets;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Tiền mặt" }, { "value": 2, "text": "Chuyển khoản" }];
  arrayht = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Chưa duyệt" }, { "value": 2, "text": "Đã chi" }, { "value": 3, "text": "Thanh toán" }, { "value": 4, "text": "Từ chối" }];
  listStatus = UtilityService.listTrangThaiDuyets();
  listLables = UtilityService.listLableTrangThaiDuyets();
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  _functionId = SystemContstants.BETS;
  _viewAll = 2;
  viewRepaymentHistory: boolean = false;
  _hubConnection: signalR.HubConnection;
  listBranch:Branch[];
  _branchId: number;
  _isAdmin=false;
  _listAdvanceGroupId:string[]=[];
  nguoilapSearch?:string='';
  refnoSearch?:string='';
  ngaySearch?:string='';
  sotienSearch?:string='';
  hangtauSearch?:string='';
  ghichuSearch?:string='';
  hinhthucSearch?:number=0;
  trangthaiSearch?:number=0;
  @ViewChild(ModalContBetsComponent, { static: false }) modalAddEdit: ModalContBetsComponent
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalAccounts: ModalPhieuChiComponent
  constructor(private contBetsService: ContBetsService, private notificationService: NotificationService,public datepipe: DatePipe,private _export:ExportService,
    private _utilityService: UtilityService, private employeeService: EmployeeService, private authService: AuthService,private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('BETS_ACCOUNT');
    this._branchId = Number.parseInt(user.branchId);
    this.employeeId = this._employeeId;
    this._isAdmin=user.isAdmin;
    this._listAdvanceGroupId = user.listAdvanceGroupId?.split(',');
    let i=this._listAdvanceGroupId.findIndex(it=>it==='2')
    this._accept = this.authService.hasPermission('BETS_ACCEPT')&&(i>-1);
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
    this.timKiem();
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
    this.timKiem();
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
    this.timKiem();
  }

  loadData(): void {
    this.nguoilapSearch='';
    this.refnoSearch ='';
    this.ngaySearch ='';
    this.sotienSearch ='';
    this.hangtauSearch ='';
    this.ghichuSearch ='';
    this.hinhthucSearch =0;
    this.trangthaiSearch =0;
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
    this.busy = this.contBetsService.getPaging(params).subscribe((res: ResponseValue<Pagination<ContBets>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listContBets = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.totalAmount=res.data?.totalAmount;
        this.listContBets.forEach(x => {
          x.isAlert=false;
          x.step = x.acceptStep.toString();
          if (!x.status)
            x.step = "Entity";
          if (x.isComplete)
            x.step = 'Completed';
          if (x.isPayment)
            x.step = 'Paymented';
          if(!x.isPayment){
            if(moment(x.createdDate).add(9, 'days')< moment(new Date())){
              x.isAlert=true;
            }
          }
        })
        this.listFilter=this.listContBets;
        this.filter();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  calculator(){
    this.totalAmount=0;
    this.listFilter.forEach(it=>{
      this.totalAmount+=it.amount;
    })
  }

  filter(){
    this.listFilter = Object.assign([], this.listContBets);
    if(this.hinhthucSearch>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.hinhthucSearch==1? data.type==0:data.type==1;
      });
    }
    if(this.trangthaiSearch!=0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.trangthaiSearch==1? data.acceptStep==0:
        this.trangthaiSearch==2? (data.isComplete&&!data.isPayment): this.trangthaiSearch==3? data.isPayment:data.acceptStep<0;
      });
    }
    if(this.nguoilapSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.employeeName.toString().toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
    if(this.refnoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toLowerCase().includes(this.refnoSearch.trim().toLocaleLowerCase());
      });
    if(this.hangtauSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.carriers?.toLowerCase().includes(this.hangtauSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    this.calculator();
  }

  export(){
    this._export.exportExcel(this.listFilter,'bao-cao-cuoc-vo');
  }

  clickRow(item: ContBets): void {
    item.checked = !item.checked;
    this.listFilter.forEach(it=>{
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

  add(type: number): void {
    let item:ContBets={
      createdBy:'42662D2B-DB8B-4F38-AE3C-70DDBA2F4EB9'
    }
    this.contBetsService.check(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        if (res.data) {
          this.notificationService.printAlert(
            MessageContstants.TITLE_ERROR_INFO,
            'Phiếu cược đến hạn chưa giải trình, không được tạo phiếu cược mới!'
          );
          return;
        } else {
          this.viewModal = true;
          setTimeout(() => {
            this.modalAddEdit.add(type);
          }, 50);
        }
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.DELETE_ERR_MSG + '\n' + res.code
        );
      }
    });
  }

  edit(flag: boolean): void {
    const index = this.listContBets.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listContBets[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listContBets.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.contBetsService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listContBets.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listContBets)
      return this.listContBets.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listContBets.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      if (checks[0].acceptStep == -1 || checks[0].acceptStep == 0) {
        this.flagDelete = checks[0].employeeId == this.employeeId;
        this.flagEdit = checks[0].employeeId == this.employeeId;
      }
    }
    // else if (checks.length > 1) {
    //   this.flagDelete = false;
    //   this.flagEdit = false;
    // }
    else {
      this.flagDelete = false;
      this.flagEdit = false;

    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: ContBets) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showAccounts(entity: ContBets) {
    this._entity = entity;
    let item: any = {};
    item.groupType = 1;
    item.employeeId = entity.employeeId;
    item.amount = entity.amount;
    item.refNo = entity.refNo;
    item.notes = 'Tạm ứng cược vỏ';
    item.typeAccount=1;
    item.advanceId=entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalAccounts.add(item);
    }, 50);
  }

  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      let item: ContBets = {
        id: this._entity.id,
        feedback: 'Completed',
        status: true
      };
      this.contBetsService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
      });
    }
  }

  closeAccounts(): void {
    this.viewAccounts = false;
  }

  accept(entity: ContBets, b: boolean){
    let item: ContBets = {
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
      this.contBetsService.accept(item).subscribe((res: ResponseValue<any>) => {
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
