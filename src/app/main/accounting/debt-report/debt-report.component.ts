import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Debt, Pagination, ResponseValue, Customer, Supplier, DebtReportViewModel, Branch } from '@app/shared/models';
import { NotificationService, DebtService, UtilityService, AuthService, CustomerService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalDebtComponent } from '@app/shared/components/accounting/modal-debt/modal-debt.component';
import { SupplierService } from '@app/shared/services/supplier.service';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-debt-report',
  templateUrl: './debt-report.component.html',
  styleUrls: ['./debt-report.component.css']
})

export class DebtReportComponent implements OnInit {
  pageIndex = 1;
  pageSize = 999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  totalDauky=0;
  totalPsNo=0;
  totalPsCo=0;
  totalCuoiky=0;

  listDebt: DebtReportViewModel[];
  listFilter:DebtReportViewModel[];
  listSupplier: Supplier[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  _auth=3;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listTypes = [{ id: 0, text: 'Phải thu' }, { id: 1, text: 'Phải trả' }];
  _type=0;
  _refType:string='C';
  listBranch:Branch[];

  khSearch?:string;
  psNoSearch?:string;
  daukySearch?:string;
  psCoSearch?:string;
  cuoikySearch?:string;

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalDebtComponent, { static: false }) modalAddEdit: ModalDebtComponent
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService, private suppliertSerive: SupplierService,
    private debtService: DebtService,private _export:ExportService, private authService: AuthService,private customerService:CustomerService,private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadSupplier();
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
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

  changedCustomer(event:Supplier){
    // this._customerId=event?.id;
    this.timKiem();
  }

  changedSupplier(event:Supplier){
    // this._customerId=event?.id;
    this.timKiem();
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this._branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  changedType(event: any): void {
      let _id=event?.id;
      if(_id==0){
        this.loadCustomer();
        this._refType='C';
        this.timKiem();
      }
      else if(_id==1){
        this.loadSupplier();
        this._refType='S';
        this.timKiem();
      }
      else{
        alert('Bạn phải chọn loại công nợ!')
      }
  }
  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('refType', this._refType);
    this.busy = this.debtService.getReport(params).subscribe((res: ResponseValue<Pagination<DebtReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        let listData = res.data?.items;
        let printList=listData.map(({ id,totalRows, ...item }) => item);
        this._export.exportExcel(printList,'bao-cao-cong-no');
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
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
      .set('refType', this._refType);
    this.busy = this.debtService.getReport(params).subscribe((res: ResponseValue<Pagination<DebtReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebt = res.data?.items;
        this.listFilter=res.data?.items;
        this.totalRows = this.listFilter?.length;
        this.calculator();
      }
      else {
        this.calculator();
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  filter(){
    this.listFilter = Object.assign([], this.listDebt);
    if(this.khSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.khSearch.trim().toLocaleLowerCase());
      });


    if(this.daukySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.dauKy?.toString().toLowerCase().includes(this.daukySearch.trim().toLocaleLowerCase());
    });
    if(this.psNoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.psn?.toString().toLowerCase().includes(this.psNoSearch.trim().toLocaleLowerCase());
    });
    if(this.psCoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.psc?.toString().toLowerCase().includes(this.psCoSearch.trim().toLocaleLowerCase());
    });
    if(this.cuoikySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cuoiKy?.toString().toLowerCase().includes(this.cuoikySearch.trim().toLocaleLowerCase());
    });
    this.calculator();
  }

  calculator(){
    this.totalDauky=0;
    this.totalPsCo=0;
    this.totalPsNo=0;
    this.totalCuoiky=0;
    this.listFilter.forEach(it=>{
      this.totalDauky+=it.dauKy;
      this.totalPsNo+=it.psn;
      this.totalPsCo+=it.psc;
      this.totalCuoiky+=it.cuoiKy;
    })
    this.totalRows=this.listFilter?.length;
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  // showDebt(item:DebtReportViewModel):void{
  //   let _item:any={};
  //   _item.customerId=item.id;
  //   _item.fDate=this.ngayBatDau;
  //   _item.tDate=this.ngayKetThuc;
  // }
}
