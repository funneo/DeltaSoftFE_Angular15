import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalPaymentDetailComponent } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.component';
import { ModalDebitNotesComponent } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.component';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { ModalDispatchOrderAdditionalFeeComponent } from '@app/shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.component';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';
import { MessageContstants } from '@app/shared/constants';
import {
  Branch,
  Customer,
  DebitNotes,
  Pagination,
  Payments,
  ReportViewModel,
  ResponseValue,
} from '@app/shared/models';
import { R04Dt12 } from '@app/shared/models/reports/r04-dt12.model';
import {
  AuthService,
  BranchService,
  CustomerService,
  DebitNotesService,
  NotificationService,
  PaymentsService,
  ReportsService,
  UtilityService,
} from '@app/shared/services';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-bc01-filter',
  templateUrl: './report-bc01-filter.component.html',
  styleUrls: ['./report-bc01-filter.component.css'],
})
export class ReportBc01FilterComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  currentPage=1;
  sizeOfPage=100;
  totalRows = 0;
  soTien=0;
  tienVat=0;
  tongTien=0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: ReportViewModel[];
  listFilter: ReportViewModel[] = [];
  listCustomer: Customer[];
  _customerId?: number;
  _branchId: number;
  _dateType=0;
  busy: Subscription;
  viewModal = false;
  viewAddFee=false;
  viewDebitnote=false;
  viewPayment=false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  _type = 0;
  _quyen = 5;
  dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  listBranch: Branch[];
  viewModalJob = false;
  //Khai báo các biến search
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Chưa duyệt" }, { "value": 2, "text": "Duyệt" }];
  listTypes = [{ id: 0, text: 'Tất cả' }, { id: 1, text: 'Chi nhánh lên Debit' }, { id: 2, text: 'Chi nhánh ghi nhận DT' }];
  listTypes1 = [{ id: 0, text: 'Ngày doanh thu' }, { id: 1, text: 'Ngày vận hành' }];
  selectedType:number=0;
  makhSearch?: string = '';
  cnSearch?: string = '';
  lohangSearch?: string = '';
  ngaylapSearch?: string = '';
  tokhaiSearch?: string = '';
  ngaytokhaiSearch?: string = '';
  vandonSearch?: string = '';
  sobookingearch: string = '';
  soinvoiceSearch: string = '';
  loaihinhSearch: string = '';
  sophieuSearch: string = '';
  ngaySearch: string = '';
  maphiSearch: string = '';
  nhomdtSearch: string = '';
  nhomttSearch: string = '';
  tenphiSearch: string = '';
  motaSearch: string = '';
  luonghangSearch: string = '';
  luonghang1: string = '';
  sokhoiSearch: string = '';
  kienhangSearch: string = '';
  socontSearch: string = '';
  referCodeSearch: string = '';
  sohoadonSearch: string = '';
  ghichuSearch: string = '';
  tknoSearch: string = '';
  tkcoSearch: string = '';
  noidungSearch: string = '';
  tnkhSearch: string = '';
  nguoilapSearch: string = '';
  dongiaSearch: string = '';
  sotienSearch: string = '';
  vatSearch: string = '';
  sotienvatSearch: string = '';
  ngayvanhanhSearch: string = '';
  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent;
  @ViewChild(ModalDispatchOrderAdditionalFeeComponent, { static: false }) modalFeeAddEdit: ModalDispatchOrderAdditionalFeeComponent
  @ViewChild(ModalPaymentDetailComponent, { static: false }) modalPayment: ModalPaymentDetailComponent
  @ViewChild(ModalDebitNotesComponent, { static: false }) modalDebitNote: ModalDebitNotesComponent
  @ViewChild(ModalShipmentComponent, { static: false })
  modalJob: ModalShipmentComponent;
  constructor(
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private reportsService: ReportsService,
    private authService: AuthService,
    private customerService: CustomerService,
    private paymentsService:PaymentsService,
    private debitnoteService:DebitNotesService,
    private branchService: BranchService,private spinner: NgxSpinnerService,
    private router: Router
  ) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen = parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    var p = UtilityService.getLocalParams('REPORT01');
    localStorage.removeItem('REPORT01');
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this._customerId = p.customerId;
      this._branchId = p.branchId;
      this.keyword=p.keyword;
    } else {
      this.ngayBatDau = new Date(
        moment().hours(0).minutes(0).seconds(0).startOf('month').toString()
      );
      this.ngayKetThuc = new Date(
        moment().hours(23).minutes(59).seconds(59).endOf('month').toString()
      );
    }
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
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
    this.customerService
      .getAll(params)
      .subscribe((res: ResponseValue<Customer[]>) => {
        this.listCustomer = res.data;
      });
  }

  changedCustomer() {
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
  filter() {
    this.listFilter = Object.assign([], this.listData);
    if(this.selectedType>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType==1? !data.duyet:data.duyet;
      });
    }
    if (this.makhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerCode
          ?.toString()
          .toLowerCase()
          .includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if (this.cnSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.chiNhanh
          ?.toString()
          .toLowerCase()
          .includes(this.cnSearch.trim().toLocaleLowerCase());
      });

    if (this.lohangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId
          ?.toLowerCase()
          .includes(this.lohangSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaylapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobDate
          ?.toString()
          .toLowerCase()
          .includes(this.ngaylapSearch.trim().toLocaleLowerCase());
      });

    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode
          ?.toLowerCase()
          .includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaytokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsDate
          ?.toString()
          .toLowerCase()
          .includes(this.ngaytokhaiSearch.trim().toLocaleLowerCase());
      });

    if (this.vandonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL
          ?.toLowerCase()
          .includes(this.vandonSearch.trim().toLocaleLowerCase());
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
          ?.toString()
          .toLowerCase()
          .includes(this.loaihinhSearch.trim().toLocaleLowerCase());
      });
    if (this.sophieuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soPhieu
          ?.toString()
          .toLowerCase()
          .includes(this.sophieuSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ngay
          ?.toString()
          .toLowerCase()
          .includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.ngayvanhanhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.accountingDate
          ?.toString()
          .toLowerCase()
          .includes(this.ngayvanhanhSearch.trim().toLocaleLowerCase());
      });
    if (this.maphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.maPhi
          ?.toString()
          .toLowerCase()
          .includes(this.maphiSearch.trim().toLocaleLowerCase());
      });
    if (this.nhomdtSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.revenueGroupCode
          ?.toString()
          .toLowerCase()
          .includes(this.nhomdtSearch.trim().toLocaleLowerCase());
      });
    if (this.nhomttSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.paymentGroupCode
          ?.toString()
          .toLowerCase()
          .includes(this.nhomttSearch.trim().toLocaleLowerCase());
      });
    if (this.tenphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tenPhi
          ?.toString()
          .toLowerCase()
          .includes(this.tenphiSearch.trim().toLocaleLowerCase());
      });
    if (this.motaSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.noiDung
          ?.toString()
          .toLowerCase()
          .includes(this.motaSearch.trim().toLocaleLowerCase());
      });

    if (this.luonghangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cbm.toString()
          ?.toLowerCase()
          .includes(this.luonghangSearch.trim().toLocaleLowerCase());
      });
    if (this.luonghang1?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.package
          ?.toString()
          .toLowerCase()
          .includes(this.luonghang1.trim().toLocaleLowerCase());
      });
    if (this.sokhoiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.gw
          ?.toString()
          .toLowerCase()
          .includes(this.sokhoiSearch.trim().toLocaleLowerCase());
      });
    if (this.kienhangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.package
          ?.toString()
          .toLowerCase()
          .includes(this.kienhangSearch.trim().toLocaleLowerCase());
      });
    if (this.socontSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cont
          ?.toString()
          .toLowerCase()
          .includes(this.socontSearch.trim().toLocaleLowerCase());
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
    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soHoaDon
          ?.toString()
          .toLowerCase()
          .includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note
          ?.toString()
          .toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.tknoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.debitAccount
          ?.toString()
          .toLowerCase()
          .includes(this.tknoSearch.trim().toLocaleLowerCase());
      });

    if (this.tkcoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.creditAccount
          ?.toString()
          .toLowerCase()
          .includes(this.tkcoSearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ghiChu
          ?.toString()
          .toLowerCase()
          .includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.tnkhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName
          ?.toLowerCase()
          .includes(this.tnkhSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeName
          ?.toString()
          .toLowerCase()
          .includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
      this.calculate();
  }
  
  get visibleData(): any[] {
    const startIndex = (this.currentPage - 1) * this.sizeOfPage;
    const endIndex = startIndex + this.sizeOfPage;
    return this.listFilter.slice(startIndex, endIndex);
  }
  
  calculate(){
    this.soTien=0;
    this.tienVat=0;
    this.tongTien=0;
    this.totalRows=this.listFilter.length;
    this.listFilter.forEach(it=>{
      this.soTien+=it.soTien;
      this.tienVat+=it.vat;
      this.tongTien+=it.tongTien
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
    if(this._type==0){
      this.busy = this.reportsService
      .getReport01(params)
      .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          this.filter();
          this.spinner.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
          this.spinner.hide();
        }
      });
    }else if(this._type==1){
      this.busy = this.reportsService
      .getReport01_01(params)
      .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          this.filter();
          this.spinner.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
          this.spinner.hide();
        }
      });
    }else{
      this.busy = this.reportsService
      .getReport01_02(params)
      .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          this.filter();
          this.spinner.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
          this.spinner.hide();
        }
      });
    }
    let k=this.reportsService.getReport04(params).subscribe((res:ResponseValue<R04Dt12[]>)=>{
      console.log(res);
    })

  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.currentPage = event.page;
    this.calculate();
  }

  showDebit(item: ReportViewModel): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId: this._customerId,
      type: this._type,
      branchId: this._branchId,
      keyword:this.keyword,
    };
    UtilityService.setLocalParams(p, 'REPORT01');
    let id = item.id;
    if (item.n == 0)
      // this.router.navigateByUrl(
      //   '/main/shipments/debit-notes/detail/' + id.toString() + '/' + true
      // );
      {
        this.debitnoteService.getByRefNo(item.soPhieu).subscribe((res: ResponseValue<DebitNotes>) => {
          if (res.code=='200'|| res.code=='201'){
            let t=res.data;
            this.viewDebitnote=true;
              setTimeout(() => {
                this.modalDebitNote.edit(t.id);
              }, 50);
          }
        });
      }
    else if (item.n == 1)
      // this.router.navigateByUrl(
      //   '/main/advance-payment/payment/detail/' + id + '/' + true
      // );
      {
        this.paymentsService.getByRefNo(item.soPhieu).subscribe((res: ResponseValue<Payments>) => {
          if (res.code=='200'|| res.code=='201'){
            let t=res.data;
            this.viewPayment=true;
              setTimeout(() => {
                this.modalPayment.edit(t.id,true);
              }, 50);
            // this.router.navigateByUrl(
            //   '/main/advance-payment/payment/detail/' + t.id.toString() + '/' + true
            // );
          }
        });
      }
    else if (item.n == 2) //Nếu là lệnh vận chuyển thì view lên thôi
      {
        this.viewModal = true;
        setTimeout(() => {
        this.modalDispatchOrderAddEdit.edit(item.soPhieu, true );
        }, 50);
      }
      else if (item.n == 3) //Nếu là lệnh vận chuyển thì view lên thôi
      {
        this.viewAddFee = true;
        setTimeout(() => {
        this.modalFeeAddEdit.edit(Number.parseInt(item.id), true );
        }, 50);
      }
    else alert('Chưa có thông tin!');
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
  closeModal() {
    this.viewModal = false;
  }
  closeAddFeeModal() {
    this.viewAddFee = false;
  }
  closeDebitnote() {
    this.viewDebitnote = false;
  }
  closePaymentModal() {
    this.viewPayment = false;
  }

  exportExcel(): void {
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
    this.busy = this.reportsService
      .exportReport01(params)
      .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
        if (res.code == '200' || res.code == '201') {
          var a = document.createElement('a');
          a.href = environment.apiUrl + res.data;
          a.download;
          a.click();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
        }
      });
  }
}
