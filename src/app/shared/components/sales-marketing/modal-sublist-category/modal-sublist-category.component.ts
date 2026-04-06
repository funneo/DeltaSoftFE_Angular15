import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { TransportCategory } from '@app/shared/models/danhmuc/transport-category.model';
import { SalesMarketingSublist } from '@app/shared/models/sales-marketing/sales-marketing-sublist.model';
import { UtilityService, NotificationService } from '@app/shared/services';
import { TransportCategoryService } from '@app/shared/services/danhmuc/transport-category.service';
import { SalesSublistService } from '@app/shared/services/sales-marketing/sales-sublist.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-sublist-category',
  templateUrl: './modal-sublist-category.component.html',
  styleUrls: ['./modal-sublist-category.component.css']
})
export class ModalSublistCategoryComponent implements OnInit {
  public entity: SalesMarketingSublist;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listType:any[]=UtilityService.listQuotationSublist();
  listLanguages:any[]=UtilityService.listLanguages();

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private service: SalesSublistService) { }

  ngOnInit(): void {
    this.listType=this.listType.filter(item=>item.id>0);
    this.listLanguages=this.listLanguages.filter(item=>item.id!="ALL")
  }

  add() {
    this.entity = {};
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id.toString()).subscribe((res: ResponseValue<SalesMarketingSublist>) => {
      if (res.code == '200' || res.code == '201') {  
        this.entity = res.data;
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
      if (this.entity.id == undefined) {
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
