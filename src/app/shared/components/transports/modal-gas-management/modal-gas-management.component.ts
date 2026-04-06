import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { GasManagement } from '@app/shared/models/transports/gas-management.model';
import { AuthService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { GasManagementService } from '@app/shared/services/transports/gas-management.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-gas-management',
  templateUrl: './modal-gas-management.component.html',
  styleUrls: ['./modal-gas-management.component.css']
})
export class ModalGasManagementComponent implements OnInit {

  public entity: GasManagement;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  userLoged:Profile;

  maskNumber = UtilityService.maskNumber;
  listGasType:OtherCategories[];

  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  // _listAll: EmployeeLimit[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    , private gasManagementService: GasManagementService
    , private _utilityService: UtilityService
    , private categoryService:OtherCategoriesService
    ,  private authService: AuthService) {

  }

  ngOnInit(): void {
    this.userLoged=this.authService.getLoggedInUser();
    this.loadGasType();
  }

  loadGasType(){
    const params = new HttpParams()
    .set('type','GAS')
      this.busy = this.categoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listGasType = res.data
        }
      });
  }

  changeCost(){
    this.entity.changed=this.entity.cost!-this.entity.oldCost;
    this.entity.rate=this.entity.oldCost!=0?this.entity.changed!*100/this.entity.oldCost:0;
  }
  add() {
    this.gasManagementService.getOldValue(this.userLoged.branchId).subscribe((res: ResponseValue<GasManagement>) => {   
      if (res.code == '200' || res.code == '201') {
        let rval = res.data;
        this.entity = {
          cost:0,
          oldCost:rval.cost,
          changed:0,
          rate:0,
          gasName:this.listGasType.find(x=>x.id==1127).categoryName
        }; 
        this.modalAddEdit.show();
      }
      else if (res.code == '204'){
        let rval = res.data;
        this.entity = {
          cost:0,
          oldCost:0,
          changed:0,
          rate:0,
          gasName:this.listGasType.find(x=>x.id==1127).categoryName
        }; 
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  edit(id: number, flag: boolean) {
    this.gasManagementService.getDetail(id).subscribe((res: ResponseValue<GasManagement>) => {   
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        if(this.entity.updatedBy!=this.userLoged.id) this.flagXem=true;
        this.flagSave = false;
        if (this.entity.effectiveDate) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.effectiveDate, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)), true
          );
          this.entity.effectiveDate = moment(this.entity.effectiveDate, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
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
      this.entity.updatedBy=this.userLoged.id;
      if (this.entity.id == undefined) {
        this.gasManagementService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.gasManagementService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  selectedNgaybatdau(event) {
    this.entity.effectiveDate = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdau(event) {
    if (this.entity.effectiveDate == null)
      this.entity.effectiveDate = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
