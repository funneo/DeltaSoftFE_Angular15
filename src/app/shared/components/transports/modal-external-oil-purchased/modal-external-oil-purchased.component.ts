import { ModalAttachfileComponent } from './../../systems/modal-attachfile/modal-attachfile.component';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Profile, ResponseValue, Vihicle } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ExternalOilPurchased } from '@app/shared/models/transports/external-oil-purchased.model';
import { GasManagement } from '@app/shared/models/transports/gas-management.model';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { ExternalOilPurchasedService } from '@app/shared/services/transports/external-oil-purchased.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { GasManagementService } from '@app/shared/services/transports/gas-management.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-external-oil-purchased',
  templateUrl: './modal-external-oil-purchased.component.html',
  styleUrls: ['./modal-external-oil-purchased.component.css']
})
export class ModalExternalOilPurchasedComponent implements OnInit {
  public entity:ExternalOilPurchased;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew:boolean=false;


  listVihicle:Vihicle[]=[];
  listEmployee:Employee[]=[];
  listSupplier: any[] = [];
  public userLoged:Profile;
  public busy: Subscription;
  public viewModal?:boolean=false;
  maskNumber = UtilityService.maskNumber;
  mask3Number = UtilityService.mask3Number;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  hasPermissionApproved=false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService
    ,private vihicleService:VihicleService
    ,private externalService:ExternalOilPurchasedService
    ,private _authService:AuthService
    ,private _utilityService:UtilityService
    ,private employeeService:EmployeeService
    ,private gasManagementService:GasManagementService
    ,private supplierService: SupplierService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.loadVihicle();
    this.loadEmployee();
    this.loadSupplier();
  }

  viewAttachFiles:boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'EXOILDPURCHASED',
      functionName:'EXOILDPURCHASED',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttachFiles=false;
  }

  loadEmployee(){
    const params=new HttpParams()
    .set('branchId',this.userLoged.branchId.toString());
    this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listEmployee = res.data
      }else{

      }
    });
  }

  loadSupplier() {
    const params = new HttpParams().set('branchid', this.userLoged.branchId.toString());
    this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<any[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data;
      }
    });
  }
  loadGasValue(){
        this.busy = this.gasManagementService.getValue(Number.parseInt(this.userLoged.branchId)).subscribe((res: ResponseValue<GasManagement>) => {
          if (res.code == '200' || res.code == '201') {
            this.entity.unitPrice = res.data.cost
          }
        });
  }
  loadVihicle(){
    const params = new HttpParams()
      .set('vihicletype','0')
      .set('branchid',this.userLoged.branchId.toString());
        this.busy = this.vihicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listVihicle = res.data
          }
        });
    }

    add(iscbt:boolean,refno:string,vehicleId:number,employeeId:number) {
      this.entity={vihicleId:vehicleId,isCbt:iscbt,refNoCbt:refno,
        checked:false,quantity:0,unitPrice:0,employeeId:(employeeId!=null?employeeId: Number.parseInt(this.userLoged.employeeId))
      };
      this.flagNew=true;
      this.flagXem = false;
      this.flagSave = false;
      this.loadGasValue();
      this.modalAddEdit.show();
    }

    edit(id: number,flag:boolean,permission:boolean) {
      this.externalService.getDetail(id).subscribe((res: ResponseValue<ExternalOilPurchased>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = res.data;
          this.flagXem = flag;
          if(this.entity.status>0 ||!permission)this.flagXem=true;
          this.flagSave = false;
          this.hasPermissionApproved=permission;
          this.modalAddEdit.show();
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
        }
      });
    }
    selectedNgaybatdau(event) {
      this.entity.invoiceDate = moment(event.start).format('DD/MM/YYYY');
    }
    closedNgaybatdau(event) {
      if (this.entity.invoiceDate == null || this.entity.invoiceDate?.length<1)
      this.entity.invoiceDate = moment(event.oldStartDate).format('DD/MM/YYYY');
    }

    calculate(){
      if(this.entity.quantity && this.entity.unitPrice)
      {
        this.entity.vat=Math.round(this.entity.quantity*this.entity.unitPrice/10);
        this.entity.amountAfterVat=Math.round(this.entity.quantity*this.entity.unitPrice);
        this.entity.amount=this.entity.amountAfterVat-this.entity.vat;
      }else{
        this.entity.amount=0;
        this.entity.vat=0;
        this.entity.amountAfterVat=0;
      }
    }

    saveChange(form: NgForm) {
      if (form.valid) {
        if(this.entity.unitPrice<1){
          this._notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR);
          return;
        }
        this.flagSave = true;
        this.entity.branchId=Number.parseInt(this.userLoged.branchId);
        if (this.entity.id == undefined) {
          this.externalService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
          this.externalService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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

    //Chuyển duyệt
    changeStatus(type:number){
      this.entity.acceptedBy=this.userLoged.id;
      if(type==1)//Nếu chuyển duyệt thì save trước rồi chuyển duyệt
      {
        this.externalService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.externalService.updateState(this.entity,type).subscribe((res: ResponseValue<ExternalOilPurchased>) => {
              if (res.code == '200' || res.code == '201') {
                this.SaveSuccess.emit(true);
                this.modalAddEdit.hide();
              }
              else {
                this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
              }
            });
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }else{
        this.externalService.updateState(this.entity,type).subscribe((res: ResponseValue<ExternalOilPurchased>) => {
        if (res.code == '200' || res.code == '201') {
          this.SaveSuccess.emit(true);
          this.modalAddEdit.hide();
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
        }
      });
      }

    }
    closeModal(): void {
      this.viewModal = false;
    }

    OnHidden() {
      this.CloseModal.emit();
    }

}
