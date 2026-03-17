import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { District, Locations, Province, ResponseValue } from '@app/shared/models';
import { NotificationService } from '@app/shared/services';
import { DistrictService } from '@app/shared/services/district.service';
import { LocationService } from '@app/shared/services/location.service';
import { ProvinceService } from '@app/shared/services/province.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-location',
  templateUrl: './modal-location.component.html',
  styleUrls: ['./modal-location.component.css']
})
export class ModalLocationComponent implements OnInit {
  public entity:Locations;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listProvince:Province[];
  public listDistrict:District[];
  public provinceCode?:string;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,private provinceService:ProvinceService
,private districtService:DistrictService,private locationService:LocationService
  ) { }

  ngOnInit(): void {
    this.loadProvince();
  }

  loadProvince(): void {
    const params = new HttpParams()
      this.busy = this.provinceService.getAll(params).subscribe((res: ResponseValue<Province[]>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listProvince = res.data
        }
      });
  }
  changedProvince(event:Province):void{
      this.busy = this.districtService.getbyProvinceCode(event.provinceCode).subscribe((res: ResponseValue<District[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDistrict = res.data
        }
      });
  }

  loadDistrict():void{
    this.busy = this.districtService.getbyProvinceCode(this.provinceCode).subscribe((res: ResponseValue<District[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDistrict = res.data
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
    this.locationService.getDetail(Number.parseInt(id)).subscribe((res: ResponseValue<Locations>) => {
      if (res.code == '200' || res.code == '201') {
        console.log(res.data);
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.provinceCode=this.entity.provinceCode;
        this.loadDistrict();
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
        this.locationService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.locationService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
