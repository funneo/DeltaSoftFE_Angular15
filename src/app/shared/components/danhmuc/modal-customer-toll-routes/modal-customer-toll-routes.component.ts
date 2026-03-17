import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { CustomerTollRoutes } from '@app/shared/models/danhmuc/customer-toll-routes';
import { NotificationService } from '@app/shared/services';
import { CustomerTollRoutesService } from '@app/shared/services/danhmuc/customer-toll-routes.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-customer-toll-routes',
  templateUrl: './modal-customer-toll-routes.component.html',
  styleUrls: ['./modal-customer-toll-routes.component.css']
})
export class ModalCustomerTollRoutesComponent implements OnInit {
public entity:CustomerTollRoutes;
  public flagXem: boolean = false;
  public flagSave: boolean = false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    ,private service:CustomerTollRoutesService

  ) { }

  ngOnInit(): void {
  }

  

  add(customerId:number) {
    this.entity={
      customerId:customerId,status:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getById(id).subscribe((res: ResponseValue<CustomerTollRoutes>) => {
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
      this.entity.status=this.entity.checked?1:0;
      if (this.entity.id == undefined) {
        this.service.create(this.entity).subscribe((res: ResponseValue<any>) => {
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
