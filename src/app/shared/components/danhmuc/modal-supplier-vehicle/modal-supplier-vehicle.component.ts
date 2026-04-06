import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OtherCategories, ResponseValue } from '@app/shared/models';
import { SupplierVehicles } from '@app/shared/models/danhmuc/supplier-vehicles.model';
import { NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { SupplierVehiclesService } from '@app/shared/services/danhmuc/supplier-vehicles.service';

import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-supplier-vehicle',
  templateUrl: './modal-supplier-vehicle.component.html',
  styleUrls: ['./modal-supplier-vehicle.component.css']
})
export class ModalSupplierVehicleComponent implements OnInit {
  public entity: SupplierVehicles;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listType:any = [];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  public vihicleTypeId?: number = 0;
  public listVihicleType: OtherCategories[] = [];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private service: SupplierVehiclesService
    ,private _utilityService:UtilityService, private otherCategoryService:OtherCategoriesService
  ) { }

  ngOnInit(): void {
    this.loadVihicleType();
  }

  loadVihicleType() {
    const params = new HttpParams().set("type", "VIHITYPE");
    this.busy = this.otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listVihicleType = res.data;
        }
      });
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
    this.service.getDetail(id).subscribe((res: ResponseValue<SupplierVehicles>) => {
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
