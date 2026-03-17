import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Debt, Pagination, ResponseValue, Customer, Branch } from '@app/shared/models';
import { NotificationService, DebtService, UtilityService, AuthService, CustomerService, BranchService } from '@app/shared/services';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalDebtComponent } from '@app/shared/components/accounting/modal-debt/modal-debt.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-debt',
  templateUrl: './debt.component.html',
  styleUrls: ['./debt.component.css']
})
export class DebtComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  totalPsNo=0;
  totalPsCo=0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDebt: Debt[];
  listFilter: Debt[];
  listCustomer: Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  itemSelected=false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listTinhtrang=[{id:0,text:"Khóa"},{id:1,text:"Chưa khóa"},{id:2,text:"Đã thanh toán"},{id:3,text:"Chưa thanh toán"},{id:4,text:"Tất cả"}]
  listTypes = [{ id: 0, text: 'Phát sinh nợ' }, { id: 1, text: 'Phát sinh có' }, { id: 2, text: 'Tất cả' }];
  _type: number = 2;
  _refType:string='C';
  listBranch:Branch[];
  _auth: number = 5;
  selectedtinhtrang=4;
  khSearch?:string;
  soctSearch?:string;
  jobidSearch?:string;
  invoicenoSearch?:string;
  nguoilapSearch?:string;
  ngaySearch?:string;
  noidungSearch?:string;
  psnoSearch?:string;
  pscoSearch?:string;
  ghichuSearch?:string;
  acceptPermission:boolean=false;
  closingPermission:boolean=false;

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalDebtComponent, { static: false }) modalAddEdit: ModalDebtComponent
  constructor( private notificationService: NotificationService, private _utilityService: UtilityService, private customerService: CustomerService,
    public datepipe: DatePipe,private debtService: DebtService, private authService: AuthService,private branchService:BranchService, private _export:ExportService) {
    let user = this.authService.getLoggedInUser();
    this.acceptPermission=authService.hasPermission('DEBT1_ACCEPT')  || user.isAdmin || authService.hasPermission('DEBT2_ACCEPT');
    this.closingPermission=authService.hasPermission('DEBT1_CLOSING') || user.isAdmin || authService.hasPermission('DEBT2_CLOSING');
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
   this.timKiem();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event:Customer){
    // this._customerId=event?.id;
    this.timKiem();
  }

  changedType(event: any): void {
      // let _id=event?.id;
      this.timKiem();
  }

  export(){
    let printList=this.listFilter.map(({ id,branchId,employeeId,
          customerId,debtDetails,createdDate,updatedDate,status,deleted, ...item }) => item);
        this._export.exportExcel(printList,'cong-no-phai-thu');
  }
  lock(){
    this.notificationService.printConfirmationDialog("Khóa các công nợ đã chọn?", () => {
      this.listFilter.forEach(it=>{
        if(it.checked){
          this.accept(1,it.id);
        }
      })
      this.loadData();
    });
  }
  tt(){
    this.notificationService.printConfirmationDialog("Xác nhận thanh toán với các công nợ đã chọn?", () => {
      this.listFilter.forEach(it=>{
        if(it.checked){
          this.accept(0,it.id);
        }
      })
      this.loadData();
    });
  }
  accept(type:number,id:number){
    this.debtService.set(id,type).subscribe((res: ResponseValue<Debt>) => {
      if (res.code == '200' || res.code == '201') {
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
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
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', this._type?.toString())
      .set('refType', this._refType);
    this.busy = this.debtService.getPaging(params).subscribe((res: ResponseValue<Pagination<Debt>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebt = res.data?.items;
        this.listFilter=res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.calculator();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  filter(){
    this.listFilter = Object.assign([], this.listDebt);
    if(this.selectedtinhtrang==3){
      this.listFilter=this.listFilter.filter((data)=>{
        return !data.isPaid;
      });
    }else if (this.selectedtinhtrang==2){
      this.listFilter=this.listFilter.filter((data)=>{
        return data.isPaid;
      });
    }else if(this.selectedtinhtrang==1)
    {
      this.listFilter=this.listFilter.filter((data)=>{
        return !data.locked;
      });
    }else if(this.selectedtinhtrang==0)
    {
      this.listFilter=this.listFilter.filter((data)=>{
        return data.locked;
      });
    }
    if(this.khSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.khSearch.trim().toLocaleLowerCase());
      });
    if(this.soctSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.documentNo.toLowerCase().includes(this.soctSearch.trim().toLocaleLowerCase());
      });
    if(this.jobidSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.jobId?.toLowerCase().includes(this.jobidSearch.trim().toLocaleLowerCase());
    });
    if(this.psnoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.totalDebit?.toString().toLowerCase().includes(this.psnoSearch.trim().toLocaleLowerCase());
    });
    if(this.pscoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.totalCredit?.toString().toLowerCase().includes(this.pscoSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.noidungSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.refName?.toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
    });
    if(this.invoicenoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoiceNo?.toLowerCase().includes(this.invoicenoSearch.trim().toLocaleLowerCase());
    });
    if(this.nguoilapSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    this.calculator();
  }

  calculator(){
    this.totalPsCo=0;
    this.totalPsNo=0;
    this.listFilter.forEach(it=>{
      this.totalPsNo+=it.totalDebit;
      this.totalPsCo+=it.totalCredit;
    })
  }

  clickRow(item: Debt): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  add(loai:number): void {
    this.viewModal = true;
    let item={refType:this._refType,type:loai};
    setTimeout(() => {
      this.modalAddEdit.add(item);
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listDebt.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listDebt[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDebt.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.debtService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listDebt.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listDebt)
      return this.listDebt.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listDebt.filter(x => x.checked);
    if (checks.length == 1) {
      this.itemSelected=true;
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.itemSelected=true;
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.itemSelected=false;
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item:Debt) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }


}
