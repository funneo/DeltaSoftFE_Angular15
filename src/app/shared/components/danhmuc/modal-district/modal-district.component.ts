import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { District, Province, ResponseValue } from '@app/shared/models';
import { NotificationService } from '@app/shared/services';
import { DistrictService } from '@app/shared/services/district.service';
import { ProvinceService } from '@app/shared/services/province.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-district',
  templateUrl: './modal-district.component.html',
  styleUrls: ['./modal-district.component.css']
})
export class ModalDistrictComponent implements OnInit {
  public entity:District;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew:boolean=true;
  public listProvince:Province[];
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,private provinceService:ProvinceService
    ,private districtService:DistrictService
  ) { }

  ngOnInit(): void {
    this.loadProvince();
  }

  loadProvince():void{
    const params = new HttpParams()

    this.busy = this.provinceService.getAll(params).subscribe((res: ResponseValue<Province[]>) => {
      console.log(res);
      if (res.code == '200' || res.code == '201') {
        this.listProvince = res.data
      }
      else {
        if(res.code == '204')
        {
          this.listProvince=[];
        }
        else
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  add() {
    this.entity={
      checked:false
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.districtService.getDetail(id).subscribe((res: ResponseValue<District>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
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
      this.flagSave = true;
      if (this.flagNew) {
        this.provinceService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.provinceService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
