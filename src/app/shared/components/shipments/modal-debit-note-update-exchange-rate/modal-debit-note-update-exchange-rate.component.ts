import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Customer, DebitNotes, ResponseValue } from '@app/shared/models';
import { AuthService, CustomerService, DebitNotesService, NotificationService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-debit-note-update-exchange-rate',
  templateUrl: './modal-debit-note-update-exchange-rate.component.html',
  styleUrls: ['./modal-debit-note-update-exchange-rate.component.css']
})
export class ModalDebitNoteUpdateExchangeRateComponent implements OnInit {


  listId='';
  tygia=0;
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

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

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

  loadDebitnotes (){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
    .set('customerId', this.customerId?.toString())
    .set('branchId', this._branchId?.toString())
    .set('fromDate', tuNgay)
    .set('toDate', denNgay)
    this.busy = this.debitNotesService.getAllForUpdateExchangeRate(params).subscribe((res: ResponseValue<DebitNotes[]>) => {
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
    if(this.makhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if(this.loaihinhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitType?.toLowerCase().includes(this.loaihinhSearch.trim().toLocaleLowerCase());
    });
    if(this.sohoadonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.deltaInvoiceNo.toString().toLowerCase().includes(this.sohoadonSearch.trim().toLocaleLowerCase());
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
  }

  isAllChecked() {
    if (this.listFilter?.length>0)
      return this.listFilter.every(_ => _.checked);
  }
  clickRow(item: DebitNotes): void {
    item.checked = !item.checked;
  }
  saveChange(form: NgForm){
    if(form.valid){
      if(this.listFilter.length<1)return;
      if(this.tygia<1)return;
      let checks: number[] = [];
        for (let items of this.listFilter) {
          if(items.checked)checks.push(items.id)
        }
        if(checks.length<1){
          this.notificationService.printAlert(MessageContstants.TITLE_ERROR_INFO,"Chưa lựa chọn DebitNote để nhập thông tin tỷ giá!");
        }
        else{
          this.listId=checks.join(',');
          this.notificationService.printConfirmationDialog(MessageContstants.UPDATE_DEBIT_INVOICE, () => {
            this.busy = this.debitNotesService.updateExchangeRate(this.listId,this.tygia).subscribe((res: ResponseValue<DebitNotes[]>) => {
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
