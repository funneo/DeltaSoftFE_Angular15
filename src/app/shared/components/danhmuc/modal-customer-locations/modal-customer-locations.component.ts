import { CustomerLocations } from '@app/shared/models/danhmuc/customer-locations.model';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Profile, ResponseValue } from '@app/shared/models';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { CustomerLocationsService } from '@app/shared/services/danhmuc/customer-locations.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'modal-customer-locations',
  templateUrl: './modal-customer-locations.component.html',
  styleUrls: ['./modal-customer-locations.component.css']
})
export class ModalCustomerLocationsComponent implements OnInit {
  public entity:CustomerLocations;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public provinceCode?:string;
  public busy: Subscription;
  public userLoged?:Profile;
  mask0=UtilityService.mask0;
  _accept=false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,private service:CustomerLocationsService,private _authService: AuthService,
  ) { }

  ngOnInit(): void {
   this.userLoged= this._authService.getLoggedInUser();
   this._accept=this._authService.hasPermission('CUSTOMER_ACCEPT')|| this.userLoged.isAdmin; 
  }

  
  add(customerId:number) {
    this.entity={
      checked:false,
      customerId:customerId,
      status:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<CustomerLocations>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.entity.checked=this.entity.status>0;
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
      this.entity.status=this.entity.checked?1:0
      if (this.entity.id == undefined) {
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(1);
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
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code +'\n'+res.message);
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
