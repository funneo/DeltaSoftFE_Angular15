import { ModalAdditionalInvoiceInformationComponent } from './../../../shared/components/advance-payment/modal-additional-invoice-information/modal-additional-invoice-information.component';
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { Customer, Pagination, PaymentDetail, ReportViewModel, ResponseValue } from '@app/shared/models';
import { AuthService, CustomerService, NotificationService, PaymentsService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-debt-invoice',
  templateUrl: './payment-debt-invoice.component.html',
  styleUrls: ['./payment-debt-invoice.component.css']
})
export class PaymentDebtInvoiceComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  soTien=0;
  tienVat=0;
  tongTien=0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  isSelected=false;
  listData: PaymentDetail[];
  listFilter:PaymentDetail[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  tongtien:number=0;
  //bien tim kiem
  IdSearch?:string;
  makhSearch?:string;
  jobIdSearch?:string;
  loaihinhSearch?:string;
  nccSearch?:string;
  tokhaiSearch?:string;
  ngaytokhaiSearch?:string;
  vandonSearch?:string;
  bookingSearch?:string;
  invoiceSearch?:string;
  sottSearch?:string;
  ngayttSearch?:string;
  maphiSearch?:string;
  nhomdtSearch?:string;
  nhomttSearch?:string;
  tenphiSearch?:string;
  diengiaiSearch?:string;
  sotienSearch?:string;
  vatSearch?:string;
  sotienvatSearch?:string;
  sohoadonSearch?:string;
  ngayhoadonSearch?:string;
  mauhoadonSearch?:string;
  ghichuphieuSearch?:string;
  tknoSearch?:string;
  tkcoSearch?:string;
  noidungSearch?:string;
  ghichuSearch?:string;
  loaittSearch?:string;
  nguoittSearch?:string;
  tenkhSearch?:string;
  dvttSearch?:string;
  selectedType?:number=0;
  phapnhanSearch='';

  _quyen=5;
  listStep:any[]=[{id:5,text:'Đã chi'},{id:1,text:'Đã duyệt'},{id:0,text:'Chưa duyệt'},{id:3,text:'Khởi tạo'},{id:4,text:'Từ chối'},{id:2,text:'Tất cả'}];
  _trangThai=2;

  @ViewChild(ModalAdditionalInvoiceInformationComponent, { static: false })  modalAdd: ModalAdditionalInvoiceInformationComponent;
  
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,private paymentService:PaymentsService,
     private authService: AuthService,private customerService:CustomerService,private exportService:ExportService,private spinner: NgxSpinnerService,
    private router: Router,public datepipe: DatePipe) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('001');
    localStorage.removeItem('001');
    if(p!=null){
      this._customerId=p.customerId;
      this._trangThai=p.trangthai;
      this.keyword=p.keyword;
      this._branchId=p.branchid;
    }
    this.loadCustomer();
    this.loadData();
  }


  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  clickRow(item: PaymentDetail): void {
    item.checked = !item.checked;
    this.icheck();
  }

  icheck() {
    let checks = this.listData.filter(x => x.checked);
    if (checks.length > 0) {
      this.isSelected = true;
      checks.forEach(it=>{
        if(it.a_RefNo?.length>0)this.isSelected=false;
      })
    }
    else {
      this.isSelected=false;
    }
  }

  updateInvoice(){
    let checks = this.listData.filter(x => x.checked);
    this.viewModal=true;
      setTimeout(() => {
      this.modalAdd.add(checks);
    }, 50);
  }


  loadData(): void {
    this.spinner.show();
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString())
    this.busy = this.paymentService.getDebtInvoice(params).subscribe((res: ResponseValue<PaymentDetail[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data;
        this.filter();
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        this.spinner.hide();
      }
    });
  }

  filter(){
    this.listFilter = Object.assign([], this.listData);

      if(this.jobIdSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
        return data.jobId?.toLowerCase().includes(this.jobIdSearch.trim().toLocaleLowerCase());
      })
    // if(this.tenkhSearch?.length>0)
    // this.listFilter=this.listFilter.filter((data)=>{
    //   return data.customerName?.toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
    // });

    if(this.tokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
    });
    if(this.nccSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.supplierName?.toLowerCase().includes(this.nccSearch.trim().toLocaleLowerCase());
    });
    if(this.vandonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.vandonSearch.trim().toLocaleLowerCase());
    });
    if(this.bookingSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.bookingSearch.trim().toLocaleLowerCase());
    });
    if(this.invoiceSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.a_RefNo?.toLowerCase().includes(this.invoiceSearch.trim().toLocaleLowerCase());
    });
    if(this.ngayhoadonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoiceDate?.toLowerCase().includes(this.ngayhoadonSearch.trim().toLocaleLowerCase());
    });
    if(this.mauhoadonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoicePattern?.toLowerCase().includes(this.mauhoadonSearch.trim().toLocaleLowerCase());
    });
    if(this.sottSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.refNo?.toLowerCase().includes(this.sottSearch.trim().toLocaleLowerCase());
    });
    
    if(this.maphiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.feeCode?.toLowerCase().includes(this.maphiSearch.trim().toLocaleLowerCase());
    })
    
    if(this.tenphiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.feeName?.toLowerCase().includes(this.tenphiSearch.trim().toLocaleLowerCase());
    })
    if(this.diengiaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.noiDung?.toLowerCase().includes(this.diengiaiSearch.trim().toLocaleLowerCase());
    })
    if(this.sotienSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.amount?.toString().toLowerCase().includes(this.sotienSearch.trim().toLocaleLowerCase());
    })
    if(this.vatSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vat?.toString().toLowerCase().includes(this.vatSearch.trim().toLocaleLowerCase());
    })
    if(this.sotienvatSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.amountAfterVAT?.toString().toLowerCase().includes(this.sotienvatSearch.trim().toLocaleLowerCase());
    })

    if(this.noidungSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.contents?.toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
    })
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.ghiChu?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    })
    if(this.loaittSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.type?.toString().toLowerCase().includes(this.loaittSearch.trim().toLocaleLowerCase());
    })
    if(this.nguoittSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.employeeName?.toLowerCase().includes(this.nguoittSearch.trim().toLocaleLowerCase());
    })
    this.tongtien=this.listFilter.reduce((total, obj) => total + (obj.amountAfterVAT || 0), 0);
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  export() {
    let printList= this.listFilter.map(({ id, customerId,step,status, ...item }) => item);
     this.exportService.exportExcel(printList, 'tt_no_hoadon');
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  showPayment(item: PaymentDetail): void {
    let p={
      customerId:this._customerId,
      branchid:this._branchId,
      trangthai:this._trangThai,
      keyword:this.keyword,
    }
    UtilityService.setLocalParams(p,'PAYMENTDETAIL');
    let id=item.paymentId;
    this.router.navigateByUrl('/main/advance-payment/payment/detail/' + id + '/' + true);
  }

  saveSuccess(event:any){
    this.loadData();
  }
  closeModal(){
    this.viewModal=false;
  }

  // exportExcel():void{
  //   let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
  //   let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
  //   const params = new HttpParams()
  //     .set('keyword', this.keyword)
  //     .set('pageIndex', this.pageIndex.toString())
  //     .set('pageSize', this.pageSize.toString())
  //     .set('fromDate', tuNgay)
  //     .set('toDate', denNgay)
  //     .set('customerId', this._customerId?.toString())
  //     .set('branchId', this._branchId?.toString())
  //     .set('type', this._type.toString());
  //   this.busy = this.reportsService.exportPaymentDetail(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
  //     if (res.code == '200' || res.code == '201') {
  //       var a = document.createElement("a");
  //       a.href = environment.apiUrl  + res.data;
  //       a.download;
  //       a.click();
  //     }
  //     else {
  //       this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
  //     }
  //   });
  // }

}
