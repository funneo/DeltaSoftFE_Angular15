import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPaymentCbtComponent } from '@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Employee, Profile, ResponseValue } from '@app/shared/models';
import { PaymentCbt } from '@app/shared/models/cbt/payment-cbt.model';
import { AuthService, BranchService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { PaymentCbtService } from '@app/shared/services/cbt/payment-cbt.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-cbt',
  templateUrl: './payment-cbt.component.html',
  styleUrls: ['./payment-cbt.component.css']
})
export class PaymentCbtComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  totalAmount=0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  flagSave=false;
  keyword = '';
  listAdvance: PaymentCbt[];
  listFilter:PaymentCbt[];
  listEmployee: Employee[];
  employeeId?: number;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId?: number;
  _branchId: number;
  _levelPermissionAdvance: number;
  _hasPermissionAdvance: boolean = false;
  _listAdvanceGroupId: string[];
  _viewAll = 2;
  _functionId = SystemContstants.PAYMENTCBT;
  busy: Subscription;
  viewModal = false;
  viewAccounts = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  flagAccounts: boolean = false;
  userLoged?:Profile;
  listBranch:Branch[];
  _isAdmin=false;

  nguoiSearch?:string='';
  soSearch?:string='';
  ngaySearch?:string='';
  phapnhanSearch?:string='';
  lydoSearch?:string='';
  chungtuSearch?:string='';
  tienSearch?:string='';
  ghichuSearch='';
  listStep:any[]=[{id:1,text:'Đã duyệt'},{id:0,text:'Chưa duyệt'},{id:2,text:'Tất cả'}];
  _step=2;
  @ViewChild(ModalPaymentCbtComponent, { static: false }) modalAddEdit: ModalPaymentCbtComponent
  constructor(private service: PaymentCbtService, private notificationService: NotificationService,
    public datepipe: DatePipe,private _utilityService: UtilityService, private employeeService: EmployeeService, private authService: AuthService,private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this.userLoged=this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._acc = this.authService.hasPermission('F006_ACCOUNT');
    this._accept = this.authService.hasPermission('F006_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);
    this._levelPermissionAdvance = Number.parseInt(user.advanceConfirmLevel);
    this._isAdmin=user.isAdmin;
  }

  ngOnInit(): void {
    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == this._functionId)
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
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('step', this._step?.toString())
      .set('branchId',this._branchId?.toString());
    this.busy = this.service.getAll(params).subscribe((res: ResponseValue<PaymentCbt[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listAdvance = res.data;
        this.filter();
        // this.listAdvance.forEach(x => {
        //   x.styleStep = x.acceptStep.toString();
        //   if (!x.status)
        //     x.styleStep = "Entity";
        //   if (x.isComplete && x.amount > 0)
        //     x.styleStep = 'Completed';
        //   if (x.isComplete && x.amount < 0)
        //     x.styleStep = 'Completed2';
        //   if (x.isPayment)
        //     x.styleStep = 'Paymented';
        //   if (this._listAdvanceGroupId.findIndex(_ => _ == x.advanceGroupId.toString()) != -1)
        //     x.has_accept = true;
        // });
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  filter(){
    this.listFilter = Object.assign([], this.listAdvance);
    if(this.nguoiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.employeeFullName.toString().toLowerCase().includes(this.nguoiSearch.trim().toLocaleLowerCase());
      });
    if(this.soSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toLowerCase().includes(this.soSearch.trim().toLocaleLowerCase());
      });
    if(this.phapnhanSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.phapnhanSearch.trim().toLocaleLowerCase());
    });
    if(this.tienSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.totalAmount?.toString().toLowerCase().includes(this.tienSearch.trim().toLocaleLowerCase());
    });
    if(this.lydoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.contents?.toLowerCase().includes(this.lydoSearch.trim().toLocaleLowerCase());
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

  calculator(){
    this.totalAmount=0;
    this.totalRows=this.listFilter?.length;
    this.listFilter?.forEach(it=>{
      this.totalAmount+=it.totalAmount;
    })
  }

  clickRow(item: PaymentCbt): void {
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

  edit(flag: boolean): void {
    const index = this.listFilter.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listFilter[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listAdvance.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listFilter.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      console.log(checks);
      
      if (checks[0].step == -1 || (checks[0].step == 0 && !checks[0].status)) {
        this.flagDelete = checks[0].createdBy == this.userLoged.id;
        this.flagEdit = checks[0].createdBy == this.userLoged.id;
      }
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
      this.flagAccounts = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: PaymentCbt) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  _entity: PaymentCbt;
  


  accept(entity: PaymentCbt, b: boolean) {
    // if(!this.flagSave){
    //   this.flagSave=true;
    //   let item: PaymentCbt = {
    //     id: entity.id,
    //     feedback: "",
    //     status: b,
    //   };
    //   let _ok = b;
    //   if (!b) {
    //     let retVal = prompt("Lý do từ chối", "");
    //     if (retVal) {
    //       _ok = true;
    //     }
    //     item.feedback = retVal ?? "";
    //   }
    //   if (_ok) {
    //     this.service.accept(item).subscribe(
    //       (res: ResponseValue<any>) => {
    //         if (res.code == "200" || res.code == "201") {
    //           this.loadData();
    //           this.flagSave=false;
    //         } else {
    //           this.notificationService.printErrorMessage(
    //             MessageContstants.UPDATED_ERR_MSG
    //           );
    //           this.flagSave=false;
    //         }
    //       },
    //       () => {
    //         this.notificationService.printErrorMessage(
    //           MessageContstants.UPDATED_ERR_MSG
    //         );
    //         this.flagSave=false;
    //       }
    //     );
    //   }
    // }
    
  }

}
