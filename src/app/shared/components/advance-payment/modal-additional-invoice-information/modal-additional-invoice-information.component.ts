
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { PaymentDetail, Profile, ResponseValue } from '@app/shared/models';
import { AdditionalInvoiceInformationDetail } from '@app/shared/models/advance-payments/additional-invoice-information-detail.model';
import { AdditionalInvoiceInformation } from '@app/shared/models/advance-payments/additional-invoice-information.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { AdditionalInvoiceInformationService } from '@app/shared/services/advance-payment/additional-invoice-information.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalPaymentDetailComponent } from '../modal-payment-detail/modal-payment-detail.component';
import { Router } from '@angular/router';

@Component({
  selector: 'modal-additional-invoice-information',
  templateUrl: './modal-additional-invoice-information.component.html',
  styleUrls: ['./modal-additional-invoice-information.component.css']
})

export class ModalAdditionalInvoiceInformationComponent implements OnInit {
  entity: AdditionalInvoiceInformation;
  flagXem: boolean = false;
  flagSave: boolean = false;
  flagNew:boolean=false;
  busy: Subscription;
  maskNumber = UtilityService.maskNumber;
  _branchId: number;
  isChecked=false;
  _employeeId: number;
  _ngayLap:string=moment(new Date()).format('DD/MM/YYYY');
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  flagLink: boolean = false;
  selectedItem=false;
  isAdmin=false;
  hasPermissionApproved=false;
  userLoged:Profile;
  viewModal=false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalPaymentDetailComponent, { static: false })  modalPaymentDetail: ModalPaymentDetailComponent;
  constructor(private _notificationService: NotificationService, private service: AdditionalInvoiceInformationService,private router: Router,
     private authService: AuthService,
    private _utilityService: UtilityService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this.hasPermissionApproved = this.authService.hasPermission('F002_ACCEPT') || this.userLoged.isAdmin;
    this.isAdmin=this.userLoged.isAdmin;
  }

  ngOnInit(): void {

  }

  add(list:PaymentDetail[]) {
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew=true;
    this.entity={
      status:0,details:[],contents:'',branchId:this._branchId
    }
    list.forEach(it=>{
      let item:AdditionalInvoiceInformationDetail ={
        additionalInvoiceInformationId:null,
        paymentDetailId:it.id,paymentRefNo:it.refNo,paymentId:it.paymentId,
        feeCode:it.feeCode,
        feeName:it.feeName,
        contents:it?.contents,
        amount:it.amount,
        vat:it.vat,
        amountAfterVAT:it.amountAfterVAT,
        notes:it.notes
      }
      this.entity.details.push(item);
    })
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<AdditionalInvoiceInformation>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        console.log(this.entity);
        
        this._branchId=this.entity.branchId;
        this.flagXem = flag;
        if(this.entity.status>0) this.flagXem=true;
        this.flagSave = false;
        this.flagNew=false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

 
  saveChange(form: NgForm) {
    if (form.valid) {
      let copiedObject = Object.assign({}, this.entity);
      this.flagSave = true;
      if(this.isChecked)copiedObject.status=1;
      if (this.entity.id == undefined || this.entity.id<1) {
        this.service.add(copiedObject).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.entity.id=res.data;
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.modalAddEdit.hide();
            form.resetForm();
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG  + res.code+ res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.service.update(copiedObject).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.modalAddEdit.hide();
            form.resetForm();
            this.SaveSuccess.emit(1);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code+ res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }
  showPayment(item:AdditionalInvoiceInformationDetail){
    console.log(item);
    
    this.viewModal = true;
    setTimeout(() => {
      this.modalPaymentDetail.edit(item.paymentId,true);
    }, 50);
  }
  
  approved(flag:boolean){
    this.service.accept(this.entity.id, this.entity.note,flag).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.modalAddEdit.hide();
            this.SaveSuccess.emit(1);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code+ res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
  }
  selectedNgaybatdau(event) {
    this.entity.invoiceDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaybatdau(event) {
    if (this.entity.invoiceDate == null || this.entity.invoiceDate?.length<1)
      this.entity.invoiceDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModal(){
    this.viewModal=false;
  }

  onHidden() {
    this.CloseModal.emit();
  }

}
