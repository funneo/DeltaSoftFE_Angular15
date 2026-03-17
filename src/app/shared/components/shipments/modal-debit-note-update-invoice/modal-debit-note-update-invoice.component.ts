import { AuthService, CustomerService, DebitNotesService, NotificationService, UtilityService } from '@app/shared/services';
import { NgForm } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Customer, DebitNotes, ResponseValue } from '@app/shared/models';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'modal-debit-note-update-invoice',
  templateUrl: './modal-debit-note-update-invoice.component.html',
  styleUrls: ['./modal-debit-note-update-invoice.component.css']
})
export class ModalDebitNoteUpdateInvoiceComponent implements OnInit {
  
  listId='';
  invoiceNo='';
  invoiceNotes='';
  customerId=0;
  listCustomer:Customer[]=[]
  listDebitNotes:DebitNotes[]=[];
  listFilter:DebitNotes[]=[];
  makhSearch?:string;
  loaihinhSearch?:string;
  sodebitSearch?:string;
  jobIdSearch?:string;
  tokhaiSearch?:string;
  vandonSearch?:string;
  sobookingSearch?:string;
  invoiceSearch?:string;
  ghichuSearch?:string;
  sohoadonSearch='';
  _branchId:number;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  debitType=0;
  array=[{id:0,value:"Tất cả"},{id:1,value:'Chưa nhập số hóa đơn'},{id:2,value:'Đã nhập số hóa đơn'}];
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  dateTimeOptions2 = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  _ngayHD='';
  _ngayHT='';
  tongtien=0;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor( private notificationService:NotificationService
    ,private debitNoteService:DebitNotesService
    ,private authService: AuthService
    ,private customerService: CustomerService
    ,private debitNotesService:DebitNotesService
    ,private _utilityService:UtilityService
    )
   { 
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
   }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    if(this.customerId>>0)this.loadDebitnotes();
  }

  selectedNgayDoanhThu(event) {
    var d=new Date();
    this._ngayHD = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayDoanhThu(event) {
    if (this._ngayHD == null || this._ngayHD?.length<1)
      this._ngayHD = '';
  }
  selectedNgayhachtoan(event) {
    var d=new Date();
    this._ngayHT = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayhachtoan(event) {
    if (this._ngayHT == null || this._ngayHT?.length<1)
      this._ngayHT = '';
  }

  loadDebitnotes (){
    if(this.customerId==null || this.customerId==0)return;
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
    .set('customerId', this.customerId?.toString())
    .set('branchId', this._branchId?.toString())
    .set('fromDate', tuNgay)
    .set('toDate', denNgay)
    this.busy = this.debitNotesService.getAllForInvoice(params).subscribe((res: ResponseValue<DebitNotes[]>) => {
    if (res.code == '200' || res.code == '201') {
      this.listDebitNotes = res.data;
      this.filter();
    }
    else {
      if(res.code=='204'){
        this.listDebitNotes=[];
        this.filter();
        this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE);
      }else
      this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
    }
  });
  }

  view (){
    this.modalAddEdit.show();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }
  changeTypeDebit(){
    this.filter();
  }

  filter(){
    this.listFilter = Object.assign([], this.listDebitNotes);
    if(this.debitType>0){
      this.listFilter=this.listFilter.filter((data)=>{
        return this.debitType==1? data.deltaInvoiceNo?.length==0 || data.deltaInvoiceNo==null : data.deltaInvoiceNo?.length>0;
      });
    }
    if(this.makhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
      if(this.sohoadonSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
          return data.deltaInvoiceNo.toString().toLowerCase().includes(this.sohoadonSearch.trim().toLocaleLowerCase());
        });
    if(this.loaihinhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitType?.toLowerCase().includes(this.loaihinhSearch.trim().toLocaleLowerCase());
    });
    if(this.sodebitSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitNo?.toLowerCase().includes(this.sodebitSearch.trim().toLocaleLowerCase());
    });
    if(this.jobIdSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.shipmentNo?.toLowerCase().includes(this.jobIdSearch.trim().toLocaleLowerCase());
    });
    if(this.vandonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.vandonSearch.trim().toLocaleLowerCase());
    });
    if(this.tokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
    });
    if(this.sobookingSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.sobookingSearch.trim().toLocaleLowerCase());
    });
    if(this.invoiceSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoiceNo?.toLowerCase().includes(this.invoiceSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
  }

  changedCustomer(event:Customer){
    this.customerId=event?.id;
    this.loadDebitnotes();
  }

  checkAll(ev) {
    this.listFilter.forEach(x => x.checked = ev.target.checked)
    if (this.listFilter) {
      if(ev.target.checked)this.tongtien=this.listFilter.reduce((sum,curentObj)=>sum+curentObj.totalAmount,0);
      else this.tongtien=0;
    }
  }

  isAllChecked() {
    if (this.listFilter?.length>0){
      return this.listFilter.every(_ => _.checked);
    }
}

  clickRow(item: DebitNotes): void {
    item.checked = !item.checked;
    this.tongtien = 0;
    this.listFilter.forEach(it => {
      if (it.checked) this.tongtien += it.totalAmount;
    })
  }

  saveChange(form: NgForm){
    if(form.valid){
      if(this.listFilter.length<1)return;
      let checks: number[] = [];
        for (let items of this.listFilter) {
          if(items.checked)checks.push(items.id)
        }
        if(checks.length<1){
          this.notificationService.printAlert(MessageContstants.TITLE_ERROR_INFO,"Chưa lựa chọn DebitNote để nhập thông tin hóa đơn!");
        }
        else{
          this.listId=checks.join(',');
          let accountinDate='';
          if (moment(this._ngayHT, FormatContstants.DATEVN).isValid()) {
              accountinDate = moment(
                      this._ngayHT,
                      FormatContstants.DATEVN
                    ).format(FormatContstants.CLIENTDATE);
                  } else {
                    this.notificationService.printErrorMessage(
                      "Ngày doanh thu không hợp lệ"
                    );
                    this._ngayHT = "";
                    return;
                  }
          this.notificationService.printConfirmationDialog(MessageContstants.UPDATE_DEBIT_INVOICE, () => {
            this.busy = this.debitNotesService.updateInvoice(this.listId,this.invoiceNo,this.invoiceNotes,this._ngayHD,accountinDate).subscribe((res: ResponseValue<DebitNotes[]>) => {
              if (res.code == '200') {
                this.modalAddEdit.hide();
                form.resetForm();
                this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
                this.SaveSuccess.emit(res);
              }
              else {
                this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
              }
            });
          });
        }
    }
  }
  onHidden() {
    this.CloseModal.emit();
  }
}
