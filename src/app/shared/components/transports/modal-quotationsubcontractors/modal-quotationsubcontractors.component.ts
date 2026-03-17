import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Profile, ResponseValue, Supplier } from '@app/shared/models';
import { Tollroute } from '@app/shared/models/tollroute.model';
import { Quotationsubcontractors } from '@app/shared/models/transports/quotationsubcontractors.model';
import { Quotationsubcontractorsdetailed } from '@app/shared/models/transports/quotationsubcontractorsdetailed.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { QuotationsubcontractorsService } from '@app/shared/services/quotationsubcontractors.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { TollrouteService } from '@app/shared/services/tollroute.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Permissions from "@app/shared/models/permissions.model";
import { ModalQuotationsubdetailedComponent } from '../modal-quotationsubdetailed/modal-quotationsubdetailed.component';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'modal-quotationsubcontractors',
  templateUrl: './modal-quotationsubcontractors.component.html',
  styleUrls: ['./modal-quotationsubcontractors.component.css']
})
export class ModalQuotationsubcontractorsComponent implements OnInit {
  public entity:Quotationsubcontractors;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew:boolean=false;
  public listSupplier:Supplier[]=[];
  public listTollroute:Tollroute[]=[];
  public listDetailed:Quotationsubcontractorsdetailed[]=[];
  public provinceCode?:string;
  public userLoged:Profile;
  public busy: Subscription;
  public branchId?:number;
  public viewModal?:boolean=false;
  hasPermissionApproved=false;
  acceptPermission=false;
  adminPermission=false;
  permission:Permissions;
  mask0 = UtilityService.mask0;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), false);
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalQuotationsubdetailedComponent, { static: false }) modalDetailed: ModalQuotationsubdetailedComponent
  constructor(private _notificationService: NotificationService
    ,private supplierService:SupplierService
    ,private quotationService:QuotationsubcontractorsService
    ,private _authService:AuthService
    ,private branchService:BranchService
    ,private tollrouteService:TollrouteService
    ,private _utilityService :UtilityService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    const permiss: string[] = typeof(this.userLoged.permissions) == "string"? JSON.parse(this.userLoged.permissions): this.userLoged.permissions;
    this.acceptPermission= permiss.findIndex(x => x === 'QUOTATIONSUB_ACCEPT') != -1;
    this.adminPermission=this.userLoged.isAdmin??false;
    this.loadSupplier();
    this.loadTollRoute();
  }
  selectedNgaybatdau(event) {
    this.entity.validUntil = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaybatdau(event) {
    if (this.entity.validUntil == null)
      this.entity.validUntil = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  loadSupplier(){
  const params = new HttpParams()
    .set('branchid',this.userLoged.branchId.toString());
      this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listSupplier = res.data
        }
      });
  }
  loadTollRoute(){
    const params = new HttpParams()
        this.busy = this.tollrouteService.getAll(params).subscribe((res: ResponseValue<Tollroute[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listTollroute = res.data
          }
        });
    }
    clickRow(item: Quotationsubcontractorsdetailed): void {

    }

  add() {
    this.entity={
      checked:false,status:0,quotationSubcontractorsDetaileds:[],isApproved:false,isActived:false
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew=true;
    this.modalAddEdit.show();
  }
  addDetailed(){
    this.viewModal = true;
    setTimeout(() => {
      this.modalDetailed.add(this.listDetailed);
    }, 50);
  }
  editDetailed(item:Quotationsubcontractorsdetailed){
    this.viewModal = true;
    setTimeout(() => {
      this.modalDetailed.edit(item);
    }, 50);
  }

  delete(item:Quotationsubcontractorsdetailed){

  }

  edit(id: number,flag:boolean,permission:boolean) {
    this.quotationService.getDetail(id).subscribe((res: ResponseValue<Supplier>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        if(this.entity.isApproved)this.flagXem=true;
        this.flagSave = false;
        this.hasPermissionApproved=permission;
        this.listDetailed=this.entity.quotationSubcontractorsDetaileds;
        if (this.entity.validUntil) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(
              moment(
                this.entity.validUntil,
                FormatContstants.DATEEN
              ).format(FormatContstants.DATEEN)
            ),
            true
          );
          this.entity.validUntil = moment(
            this.entity.validUntil,
            FormatContstants.DATEEN
          ).format(FormatContstants.DATEVN);
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
      this.entity.branchId=Number.parseInt(this.userLoged.branchId);
      this.entity.createdBy=this.userLoged.id;
      this.entity.quotationSubcontractorsDetaileds=this.listDetailed;
      if (this.entity.id == undefined) {
        this.quotationService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(true);
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
        this.quotationService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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

  //Cập nhật trạng thái duyêt/từ chối
  changedAccept(flag:boolean){
    this.quotationService.setApproved(this.entity,flag?1:2).subscribe((res: ResponseValue<Supplier>) => {
      if (res.code == '200' || res.code == '201') {
        this.SaveSuccess.emit(true);
        this.modalAddEdit.hide();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  //Chuyển duyệt
  changedStatus(){
    this.quotationService.setApproved(this.entity,0).subscribe((res: ResponseValue<Supplier>) => {
      if (res.code == '200' || res.code == '201') {
        this.SaveSuccess.emit(true);
        this.modalAddEdit.hide();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  closeModal(): void {
    this.viewModal = false;
  }

  saveSuccess(value): void {
    let index = this.listDetailed.findIndex(x => x.vihicleTypeId == value.vihicleTypeId);
    if (index >= 0) {
      this.listDetailed[index] = value;
    } else {
        this.listDetailed.push(value);
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
