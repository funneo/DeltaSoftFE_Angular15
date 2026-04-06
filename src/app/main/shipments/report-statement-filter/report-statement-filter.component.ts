import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDebitNoteUpdateExchangeRateComponent } from '@app/shared/components/shipments/modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.component';
import { ModalDebitNoteUpdateInvoiceComponent } from '@app/shared/components/shipments/modal-debit-note-update-invoice/modal-debit-note-update-invoice.component';
import { ModalDebitNotesComponent } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Customer, DebitNotes, Pagination, ReportViewModel, ResponseValue, Supplier } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, DebitNotesService, NotificationService, ReportsService, UtilityService } from '@app/shared/services';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'report-statement-filter',
  templateUrl: './report-statement-filter.component.html',
  styleUrls: ['./report-statement-filter.component.css']
})
export class ReportStatementFilterComponent implements OnInit {
  pageIndex = 1;
  pageSize = 999999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  soTien=0;
  tienVat=0;
  tongTien=0;
  soTienUsd=0;
  tienVatUsd=0;
  tongTienUsd=0;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Chưa duyệt" }, { "value": 2, "text": "Duyệt" }];
  selectedType:number=0;
  makhSearch:string;
  tenkhSearch:string;
  loaihinhSearch:string;
  sodebitSearch:string;
  tokhaiSearch:string;
  ngaytokhaiSearch:string;
  ngaydtSearch:string='';
  ngayhtSearch:string='';
  vandonSearch:string;
  mblSearch?:string;
  sobookingSearch:string;
  luonghangSearch:string;
  ghichuSearch:string;
  trangthaiSearch:string;
  sotienSearch: string = '';
  vatSearch: string = '';
  sotienvatSearch: string = '';
  sotienUsdSearch: string = '';
  vatUsdSearch: string = '';
  sotienvatUsdSearch: string = '';
  listData: ReportViewModel[];
  listFilter:ReportViewModel[]=[];
  listSupplier: Supplier[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  viewModalDebit=false;
  viewModalExchangeRate=false;
  viewDebitnote=false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listTypes2 = [{ id: 0, text: 'Ngày doanh thu' }, { id: 1, text: 'Ngày vận hành' }];
  listTypes = [{ id: 0, text: 'Debit-note' }, { id: 1, text: 'Thanh toán' }];
  listTypes1 = [{ id: 0, text: 'Tất cả' }, { id: 1, text: 'Chi nhánh lên Debit' }, { id: 2, text: 'Chi nhánh ghi nhận DT' }];
  _type=0;
  _quyen=5;
  _dateType=0;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  @ViewChild(ModalDebitNoteUpdateInvoiceComponent, { static: false }) modalDebit: ModalDebitNoteUpdateInvoiceComponent;
  @ViewChild(ModalDebitNotesComponent, { static: false }) modalDebitNote: ModalDebitNotesComponent
  @ViewChild(ModalDebitNoteUpdateExchangeRateComponent, { static: false }) modalTygia: ModalDebitNoteUpdateExchangeRateComponent;
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,private spinner: NgxSpinnerService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService,
    private branchService:BranchService, private debitnoteService:DebitNotesService, private router:Router) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }
  ngOnInit(): void {
    var p=UtilityService.getLocalParams('STATEMENT');
    localStorage.removeItem('STATEMENT');
    if(p!=null){
      this.ngayBatDau =new Date(p.d1);
      this.ngayKetThuc =new Date(p.d2);
      this._customerId=p.customerId;
      this._branchId=p.branchId;
      this.keyword=p.keyword;
      this.selectedType=p.selectedType;
      this.loaihinhSearch=p.loaihinhSearch;
      this.vandonSearch=p.vandonSearch;
      this.sobookingSearch=p.sobookingSearch;
      this.tokhaiSearch=p.tokhaiSearch
    }
    else{
      this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
      this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    }
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }
  updateInvoice(){
    this.viewModalDebit = true;
    setTimeout(() => {
      this.modalDebit.view();
    }, 50);
  }
  changedDateType(): void {
    this.loadData();
 }
  updateTygia(){
    this.viewModalExchangeRate = true;
    setTimeout(() => {
      this.modalTygia.view();
    }, 50);
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(){
    this.loadData();
  }

  changedType(): void {
     this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.loadData();
  }

  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.selectedType>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType==1? !data.trangThai:data.trangThai;
      });
    }
    if(this.makhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerCode.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if(this.tenkhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if(this.loaihinhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.loaiHinh?.toLowerCase().includes(this.loaihinhSearch.trim().toLocaleLowerCase());
    });
    if(this.sodebitSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitNo?.toLowerCase().includes(this.sodebitSearch.trim().toLocaleLowerCase());
    });
    if(this.tokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaytokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.ngayHoaDon?.toLowerCase().includes(this.ngaytokhaiSearch.trim().toLocaleLowerCase());
    });
    if(this.vandonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.vandonSearch.trim().toLocaleLowerCase());
    });
    if(this.mblSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.mawB_MBL?.toLowerCase().includes(this.mblSearch.trim().toLocaleLowerCase());
    });
    if(this.sobookingSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.sobookingSearch.trim().toLocaleLowerCase());
    });
    if(this.luonghangSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.luongHang?.toLowerCase().includes(this.luonghangSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.sotienSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.soTien?.toString().toLowerCase().includes(this.sotienSearch.trim().toLocaleLowerCase());
    });
    if(this.vatSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vat?.toString().toLowerCase().includes(this.vatSearch.trim().toLocaleLowerCase());
    });
    if(this.sotienvatSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.tongTien?.toString().toLowerCase().includes(this.sotienvatSearch.trim().toLocaleLowerCase());
    });
    if(this.sotienUsdSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.soTienUsd?.toString().toLowerCase().includes(this.sotienUsdSearch.trim().toLocaleLowerCase());
    });
    if(this.vatUsdSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vatUsd?.toString().toLowerCase().includes(this.vatUsdSearch.trim().toLocaleLowerCase());
    });
    if(this.sotienvatUsdSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.tongTienUsd?.toString().toLowerCase().includes(this.sotienvatUsdSearch.trim().toLocaleLowerCase());
    });
    this.calculate();
  }

  calculate(){
    this.soTien=0;
    this.tienVat=0;
    this.tongTien=0;
    this.soTienUsd=0;
    this.tienVatUsd=0;
    this.tongTienUsd=0;
    this.totalRows=this.listFilter.length;
    this.listFilter.forEach(it=>{
      this.soTien+=it.soTien??0;
      this.tienVat+=it.vat??0;
      this.tongTien+=it.tongTien??0;
      this.soTienUsd+=it.soTienUsd;
      this.tienVatUsd+=it.vatUsd;
      this.tongTienUsd+=it.tongTienUsd;
    })
  }
  changeType(){
    this.loadData();
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', this._type.toString())
      .set('datetype', this._dateType.toString());
    this.busy = this.reportsService.getStatement(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.spinner.hide();
        this.filter();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        this.spinner.hide();
      }
    });
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  showDebit(item: ReportViewModel): void {
    // let p={
    //   d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
    //   d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
    //   customerId:this._customerId,
    //   branchId:this._branchId,
    //   keyword:this.keyword,
    //   selectedType:this.selectedType,
    //   loaihinhSearch:this.loaihinhSearch,
    //   sobookingSearch:this.sobookingSearch, 
    //   vandonSearch :this.vandonSearch,
    //   tokhaiSearch:this.tokhaiSearch
    // }
    // UtilityService.setLocalParams(p,'STATEMENT');
    // let id=item.id;
    // this.router.navigateByUrl('/main/shipments/debit-notes/detail/' + id.toString() + '/' + true);
    this.debitnoteService.getDetail(item.id).subscribe((res: ResponseValue<DebitNotes>) => {
      if (res.code=='200'|| res.code=='201'){
        let t=res.data;
        this.viewDebitnote=true;
          setTimeout(() => {
            this.modalDebitNote.edit(t.id);
          }, 50);
      }
    });
  }

  exportExcel():void{
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', this._type.toString());
    this.busy = this.reportsService.exportStatement(params).subscribe((res: ResponseValue<string>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl  + res.data;
        a.download;
        a.click();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  closeModalDebit(): void {
    this.viewModalDebit = false;
  }
  closeModalExchangeRate(){
    this.viewModalExchangeRate=false;
  }

  saveOpenDebit(event: any): void {
    console.log(event);
  }

  closeDebitnote() {
    this.viewDebitnote = false;
  }
  saveDebit() {
    this.loadData();
  }
  
}
