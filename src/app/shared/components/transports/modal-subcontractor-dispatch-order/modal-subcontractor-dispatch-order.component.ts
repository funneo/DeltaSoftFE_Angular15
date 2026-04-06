import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { TollStation } from '@app/shared/models/toll-station.model';
import { DispatchOrderAttachfiles } from '@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { AuthService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';

@Component({
  selector: 'modal-subcontractor-dispatch-order',
  templateUrl: './modal-subcontractor-dispatch-order.component.html',
  styleUrls: ['./modal-subcontractor-dispatch-order.component.css']
})
export class ModalSubcontractorDispatchOrderComponent implements OnInit {
  public entity:Dispatchorder;
  public flagSave: boolean = false;
  public flagXem:boolean=false;
  public flagOk:boolean=false;
  public flagFinishProcedure:boolean=false;
  public viewAttachFiles:boolean=false;
  public userLoged:Profile;

  public listPod:DispatchOrderAttachfiles[]=[];
  public listAttachFile:DispatchOrderAttachfiles[]=[];
  maskNumber = UtilityService.maskNumber;
  public isOpMan=false;
  public busy: Subscription;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent

  constructor(private notificationService: NotificationService
,private _authService:AuthService
,private _utilityService:UtilityService
,private otherCategoryService :OtherCategoriesService
,private dispatchOrderService:DispatchordersService
  ) { }
  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
  }

  loadPod(){
    let p:DispatchOrderAttachfiles={
      refNo:this.entity.refNo,
      isPod:true
    }
    this.dispatchOrderService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPod = res.data;
      }
      else {
        this.listPod=[];
      }
    });
  }
  loadAttackFiles(){
    let p:DispatchOrderAttachfiles={
      refNo:this.entity.refNo,
      isPod:false
    }
    this.dispatchOrderService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listAttachFile = res.data;
      }
      else {
        this.listAttachFile=[];
      }
    });
  }
  clickLink(item:DispatchOrderAttachfiles){
    let url=environment.apiUrl+item.pathFile.replace('~','');
    window.open(url, "_blank");
  }

  edit(refNo: string) {
    this.dispatchOrderService.getDetail(refNo).subscribe((res: ResponseValue<Dispatchorder>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity=res.data;
        this.loadPod();
        this.loadAttackFiles();
        this.checkOk();
        this.checkValue();
        this.modalAddEdit.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  setFinish(form: NgForm,flag:boolean) {
    if (form.valid) {
      this.entity.finished=flag;
        this.dispatchOrderService.setFinish(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
    }
  }

  checkValue(){
    let tmpValue:boolean=true;
    this.entity.listDispatchOrderProcedure.forEach(element=>{
      tmpValue=element.isFinish || element.isPass;
    })
    if(tmpValue){
      tmpValue=this.entity.gradeCs>0 && this.entity.gradeOpMan>0 ;
    }
    this.flagFinishProcedure=tmpValue;
  }

  done(id:number,flag:boolean){
    const params = new HttpParams()
      .set('refno',this.entity.refNo)
      .set('procedureid', id.toString())
      .set('isfinish',flag?"1":"0")
      .set('latitude','0')
      .set('longtitude','0')
        this.dispatchOrderService.setDoneProcedure(params).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.checkValue();
            this.notificationService.printSuccessMessage(flag?MessageContstants.PROCEDURE_DONE:MessageContstants.PROCEDURE_PASS);
            this.entity.listDispatchOrderProcedure.forEach(value=>{
              if(value.procedureId==id){
                value.isFinish=flag;
                value.isPass=!flag;
              }
            });
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
          }
        }, () => {
          this.flagSave = false;
        });
  }


  attachFile(){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'DISPATCHORDERS',
      functionName:'DISPATCHORDERS',
      refNo:this.entity.refNo
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,true);
    }, 50);
  }
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      let p:DispatchOrderAttachfiles={
        refNo:this.entity.refNo,
        isPod:true
      }
      const file = event.target.files[0];
        this.busy = this.dispatchOrderService.addAttachFile(p,file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
                if (res.code == '200' || res.code == '201') {
                  this.listPod=res.data;
                }else{
                  this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
                }
              });
    }
  }
  deleteAttachFile(item:DispatchOrderAttachfiles) {
        this.busy = this.dispatchOrderService.deleteAttachFile(item).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
                if (res.code == '200' || res.code == '201') {
                  this.loadAttackFiles();
                }else{
                  this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
                }
              });
  }
  onAttachFileChanged(event) {
    if (event.target.files.length > 0) {
      let p:DispatchOrderAttachfiles={
        refNo:this.entity.refNo,
        isPod:false
      }
      const file = event.target.files[0];
        this.busy = this.dispatchOrderService.addAttachFile(p,file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
                if (res.code == '200' || res.code == '201') {
                  this.listAttachFile=res.data;
                }else{
                  this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
                }
              });
    }
  }
  updateState(type:number){
    let copy = Object.assign({}, this.entity)
    copy.status=type
      this.busy = this.dispatchOrderService.updateState(copy).subscribe((res: ResponseValue<Dispatchorder>) => {
        if (res.code == '200' || res.code == '201') {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
          this.modalAddEdit.hide();
        }else{
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      });
  }

  checkOk(){
    if(this.entity.listDispatchOrderRoutes.length>0){
      this.entity.listDispatchOrderRoutes.forEach(item=>{
        this.entity.kmQuota+=item.distance;
      })
    }
    if(this.entity.listDispatchOrderDetailed.length>0&&this.entity.listDispatchOrderRoutes.length>0)
    {
      this.flagOk=true;
    }else{this.flagOk=false}
  }
  saveSuccessTicket(value): void {
    if(value.flagNew){
      this.entity.listDispatchOrderTicket.push(value);
    }else{
      this.entity.listDispatchOrderTicket[value.index]=value;
    }
  }
  saveSuccessParkingTicket(value): void {
    if(value.flagNew){
      this.entity.listDispatchOrderParkingTicket.push(value);
    }else{
      this.entity.listDispatchOrderParkingTicket[value.index]=value;
    }
  }

  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
