import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, DebitNotes, Pagination, ReportViewModel, ResponseValue, AccountingDebitCredit } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, DebitNotesService, NotificationService, ReportsService, UtilityService } from '@app/shared/services';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common'
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalDebitNotesComponent } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.component';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-report-debitnote-detail-filter',
  templateUrl: './report-debitnote-detail-filter.component.html',
  styleUrls: ['./report-debitnote-detail-filter.component.css']
})
export class ReportDebitnoteDetailFilterComponent implements OnInit {

  pageIndex = 1;
  pageSize = 9999999;
  currentPage=1;
  sizeOfPage=100;
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
  listData: ReportViewModel[];
  listFilter:ReportViewModel[]=[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  _type=0;
  _dateType=0;
  _quyen=5;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  viewModalJob = false;
  viewDebitnote=false;
  //Khai báo các biến search
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Chưa duyệt" }, { "value": 2, "text": "Duyệt" }];
    listTypes1 = [{ id: 0, text: 'Tất cả' }, { id: 1, text: 'Chi nhánh lên Debit' }, { id: 2, text: 'Chi nhánh ghi nhận DT' }];
    listTypes = [{ id: 0, text: 'Ngày doanh thu' }, { id: 1, text: 'Ngày vận hành' }];
  selectedType:number=0;
  makhSearch?: string = '';
  lohangSearch?: string = '';
  tokhaiSearch?: string = '';
  ngaytokhaiSearch?: string = '';
  vandonSearch?: string = '';
  sobookingearch: string = '';
  soinvoiceSearch: string = '';
  sodebitSearch:string='';
  loaihinhSearch: string = '';
  ngaySearch: string = '';
  ngayDoanhthuSearch: string = '';
  ngayHachtoanSearch: string = '';
  referCodeSearch: string = '';
  maphiSearch: string = '';
  nhomdtSearch: string = '';
  nhomttSearch: string = '';
  tenphiSearch: string = '';
  motaSearch: string = '';
  diengiaiSearch:string='';
  luonghangSearch: string = '';
  sohoadonSearch: string = '';
  ngayhoadonSearch?:string='';
  ghichuSearch: string = '';
  tknoSearch: string = '';
  tkcoSearch: string = '';
  mblSearch:string='';
  noidungSearch: string = '';
  tnkhSearch: string = '';
  nguoilapSearch: string = '';
  sotienSearch: string = '';
  vatSearch: string = '';
  sotienvatSearch: string = '';
  tienteSearch:string='';
  hoadonDelta='';
  @ViewChild(ModalDebitNotesComponent, { static: false }) modalDebitNote: ModalDebitNotesComponent
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,private spinner: NgxSpinnerService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService, private exportExcelService: ExportService,
    private branchService:BranchService,private debitnoteService:DebitNotesService, public datepipe: DatePipe,private cdr: ChangeDetectorRef) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('RDEBITDETAIL');
    localStorage.removeItem('RDEBITDETAIL');
    if(p!=null){
      this.ngayBatDau =new Date(p.d1);
      this.ngayKetThuc =new Date(p.d2);
      this._customerId=p.customerId;
      this._branchId=p.branchId;
      this.keyword=p.keyword;
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
  changedDateType(): void {
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
    this.busy = this.reportsService.getDebitNoteDetail(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.listFilter=res.data?.items;
        this.soTien=res.data?.totalAmount;
        this.tienVat=res.data?.totalVat;
        this.tongTien=res.data?.totalAmountVat;
        this.calculate();
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        this.spinner.hide();
      }
    });
  }
  filter() {
    this.listFilter = Object.assign([], this.listData);
    this.cdr.detectChanges();
    if(this.selectedType>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType==1? !data.duyet:data.duyet;
      });
    }
    if (this.makhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerCode
          .toString()
          .toLowerCase()
          .includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if (this.sodebitSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.chiNhanh
          .toString()
          .toLowerCase()
          .includes(this.sodebitSearch.trim().toLocaleLowerCase());
      });

    if (this.lohangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId
          ?.toLowerCase()
          .includes(this.lohangSearch.trim().toLocaleLowerCase());
      });
    if (this.diengiaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobDate
          .toString()
          .toLowerCase()
          .includes(this.diengiaiSearch.trim().toLocaleLowerCase());
      });

    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaytokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {if(data.cdsDate)
        return this.datepipe.transform(data.cdsDate, 'dd/MM/yyyy')
          .toString()
          .toLowerCase()
          .includes(this.ngaytokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayHachtoanSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {if(data.accountingDate)
        return this.datepipe.transform(data.accountingDate, 'dd/MM/yyyy')
          .toString()
          .toLowerCase()
          .includes(this.ngayHachtoanSearch.trim().toLocaleLowerCase());
      });

    if (this.vandonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL
          ?.toLowerCase()
          .includes(this.vandonSearch.trim().toLocaleLowerCase());
      });

    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode
          ?.toLowerCase()
          .includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });
    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode
          ?.toLowerCase()
          .includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });
      if (this.mblSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.mawB_MBL
          ?.toLowerCase()
          .includes(this.mblSearch.trim().toLocaleLowerCase());
      });
    if (this.sobookingearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo
          ?.toLowerCase()
          .includes(this.sobookingearch.trim().toLocaleLowerCase());
      });
      if (this.soinvoiceSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo
          ?.toLowerCase()
          .includes(this.soinvoiceSearch.trim().toLocaleLowerCase());
      });
    if (this.loaihinhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.loaiHinh
          .toString()
          .toLowerCase()
          .includes(this.loaihinhSearch.trim().toLocaleLowerCase());
      });

    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.ngay, 'dd/MM/yyyy')
          .toString()
          .toLowerCase()
          .includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.maphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.maPhi
          .toString()
          .toLowerCase()
          .includes(this.maphiSearch.trim().toLocaleLowerCase());
      });
    if (this.nhomdtSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.revenueGroupCode
          .toString()
          .toLowerCase()
          .includes(this.nhomdtSearch.trim().toLocaleLowerCase());
      });
    if (this.nhomttSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.paymentGroupCode?.toString()
          .toLowerCase()
          .includes(this.nhomttSearch.trim().toLocaleLowerCase());
      });
    if (this.tenphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tenPhi?.toString()
          .toLowerCase()
          .includes(this.tenphiSearch.trim().toLocaleLowerCase());
      });
    if (this.motaSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.noiDung?.toString()
          .toLowerCase()
          .includes(this.motaSearch.trim().toLocaleLowerCase());
      });

    if (this.luonghangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cbm?.toString()
          ?.toLowerCase()
          .includes(this.luonghangSearch.trim().toLocaleLowerCase());
      });
    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soHoaDon?.toString()
          .toLowerCase()
          .includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note?.toString()
          .toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.tknoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.debitAccount?.toString()
          .toLowerCase()
          .includes(this.tknoSearch.trim().toLocaleLowerCase());
      });

    if (this.tkcoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.creditAccount?.toString()
          .toLowerCase()
          .includes(this.tkcoSearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ghiChu?.toString()
          .toLowerCase()
          .includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.tnkhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName?.toString()
          .toLowerCase()
          .includes(this.tnkhSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeName?.toString()
          .toLowerCase()
          .includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
      if (this.sotienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soTien
          ?.toString()
          .toLowerCase()
          .includes(this.sotienSearch.trim().toLocaleLowerCase());
      });
      if (this.vatSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.vat
          ?.toString()
          .toLowerCase()
          .includes(this.vatSearch.trim().toLocaleLowerCase());
      });
      if (this.sotienvatSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tongTien
          ?.toString()
          .toLowerCase()
          .includes(this.sotienvatSearch.trim().toLocaleLowerCase());
      });
      if (this.tienteSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tienTe?.toString()
          .toLowerCase()
          .includes(this.tienteSearch.trim().toLocaleLowerCase());
      });
      if (this.hoadonDelta?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soHoaDonDelta?.toString()
          .toLowerCase()
          .includes(this.hoadonDelta.trim().toLocaleLowerCase());
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
      this.soTien+=(it.currency=='USD'?0:it.soTien);
      this.tienVat+=(it.currency=='USD'?0:it.vat);
      this.tongTien+=(it.currency=='USD'?0:it.tongTien);
      this.soTienUsd+=it.soTienUsd;
      this.tienVatUsd+=it.vatUsd;
      this.tongTienUsd+=it.tongTienUsd;
    })
  }

  get visibleData(): any[] {
    const startIndex = (this.currentPage - 1) * this.sizeOfPage;
    const endIndex = startIndex + this.sizeOfPage;
    return this.listFilter.slice(startIndex, endIndex);
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.currentPage = event.page;
  }

  showDebit(item: ReportViewModel): void {
    // let p={
    //   d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
    //   d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
    //   customerId:this._customerId,
    //   branchId:this._branchId,
    //   keyword:this.keyword,
    // }
    // UtilityService.setLocalParams(p,'RDEBITDETAIL');
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

  showJob(item: ReportViewModel): void {
    if (item.shipmentId) {
      this.viewModalJob = true;
      setTimeout(() => {
        this.modalJob.edit(item?.shipmentId?.toString(), true);
      }, 50);
    }
  }
  closeModalJob() {
    this.viewModalJob = false;
  }

  exporttoMisa(type:number):void{
    if (this.listFilter?.length) {
      this.exportExcelService[type === 1 ? 'exportMisaTotal' : 'exportMisa'](this.listFilter);
    }
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
      .set('datetype',this._dateType.toString())
      .set('type', this._type.toString())
    this.busy = this.reportsService.exportDebitNoteDetail(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
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
  closeDebitnote() {
    this.viewDebitnote = false;
  }
}
