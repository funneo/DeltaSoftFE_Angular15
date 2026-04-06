import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { SupplierDrivers } from '@app/shared/models/danhmuc/supplier-drivers.model';
import { NotificationService, UtilityService } from '@app/shared/services';
import { SupplierDriversService } from '@app/shared/services/danhmuc/supplier-drivers.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'modal-supplier-driver',
  templateUrl: './modal-supplier-driver.component.html',
  styleUrls: ['./modal-supplier-driver.component.css']
})
export class ModalSupplierDriverComponent implements OnInit {
  public entity: SupplierDrivers;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listType:any = [];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private service: SupplierDriversService
    ,private _utilityService:UtilityService
  ) { }

  ngOnInit(): void {

  }

  selectedNgaysinh(event) {
    this.entity.dateOfBirth = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaysinh(event) {
    if (this.entity.dateOfBirth == null)
      this.entity.dateOfBirth = moment(event.oldStartDate).format('DD/MM/YYYY');
  }
  selectedissuedDate(event) {
    this.entity.issuedDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedissuedDate(event) {
    if (this.entity.issuedDate == null)
      this.entity.issuedDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }
  selectedexpiredDate(event) {
    this.entity.expiredDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedexpiredDate(event) {
    if (this.entity.expiredDate == null)
      this.entity.expiredDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(supplierId:number) {
    
    this.entity = {
      supplierId:supplierId,
      status:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<SupplierDrivers>) => {
      if (res.code == '200' || res.code == '201') {  
        this.entity = res.data;
        if (this.entity.dateOfBirth) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.dateOfBirth, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.dateOfBirth = moment(this.entity.dateOfBirth, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.issuedDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.issuedDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.issuedDate = moment(this.entity.issuedDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.expiredDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.expiredDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.expiredDate = moment(this.entity.expiredDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      var clone = Object.assign({}, this.entity);
      if(this.entity.checked && clone.status<1)clone.status=1;
      if (this.entity.id == undefined) {
        this.service.add(clone).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.service.update(clone).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
