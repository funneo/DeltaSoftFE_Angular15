import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { DispatchOrderEtc, DispatchOrderMonthlyticket, DispatchOrderTicket, Fee, OtherCategories, Profile, ResponseValue, WorkflowJobOptionProcedure } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { TollStation } from '@app/shared/models/toll-station.model';
import { CancelDispatchOrder } from '@app/shared/models/transports/cancel-dispatch-order.model';
import { DispatchOrderAttachfiles } from '@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles';
import { DispatchOrderParkingticket } from '@app/shared/models/transports/dispatchorders/dispatch-order-parkingticket.model';
import { DispatchOrderProcedure } from '@app/shared/models/transports/dispatchorders/dispatch-order-procedure.model';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { AuthService, FeeService, NotificationService, OtherCategoriesService, UtilityService, WorkflowsService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalDispatchorderEtcComponent } from '../modal-dispatchorder-etc/modal-dispatchorder-etc.component';
import { ModalDispatchorderMonthlyTicketComponent } from '../modal-dispatchorder-monthly-ticket/modal-dispatchorder-monthly-ticket.component';
import { ModalDispatchorderParkingTicketComponent } from '../modal-dispatchorder-parking-ticket/modal-dispatchorder-parking-ticket.component';
import { ModalDispatchorderTicketComponent } from '../modal-dispatchorder-ticket/modal-dispatchorder-ticket.component';

@Component({
  selector: 'modal-perform-dispatch-order',
  templateUrl: './modal-perform-dispatch-order.component.html',
  styleUrls: ['./modal-perform-dispatch-order.component.css']
})
export class ModalPerformDispatchOrderComponent implements OnInit {
  public entity:Dispatchorder;
  public flagSave: boolean = false;
  public flagXem:boolean=false;
  public flagOk:boolean=false;
  public flagFinishProcedure:boolean=false;
  public viewAttachFiles:boolean=false;
  public userLoged:Profile;
  public listTollStation:TollStation[];
  public listcontType:OtherCategories[]=[];
  public viewTicket:boolean=false;
  public viewParkingTicket:boolean=false;
  public viewEtc:boolean=false;
  public viewMonthlyTicket:boolean=false;
  public listPod:DispatchOrderAttachfiles[]=[];
  public listAttachFile:DispatchOrderAttachfiles[]=[];
  maskNumber = UtilityService.maskNumber;
  listFee:Fee[]=[];
  public isOpMan=false;
  public busy: Subscription;
  latitue: number=0.0;
  longtitude: number=0.0;
  listShipmentType: OtherCategories[]=[];
  listContTypes: OtherCategories[];
  listImportExports: OtherCategories[]=[];
  listParking:DispatchOrderParkingticket[]=[];
  _flagContSeal:boolean=false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalDispatchorderTicketComponent, { static: false }) modalTicket: ModalDispatchorderTicketComponent
  @ViewChild(ModalDispatchorderParkingTicketComponent, { static: false }) modalParkingTicket: ModalDispatchorderParkingTicketComponent
  @ViewChild(ModalDispatchorderEtcComponent, { static: false }) modalEtc: ModalDispatchorderEtcComponent
  @ViewChild(ModalDispatchorderMonthlyTicketComponent, { static: false }) modalMonthlyTicket: ModalDispatchorderMonthlyTicketComponent

  constructor(private notificationService: NotificationService
,private _authService:AuthService
,private _utilityService:UtilityService
,private otherCategoryService :OtherCategoriesService
,private dispatchOrderService:DispatchordersService
,private workflowService:WorkflowsService
,private tollStationService:TollStationService
,private feeService:FeeService
  ) { }
  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.loadToolStation();
    this.loadOtherCategory();
    this.loadFee();
  }
  loadFee() {
    const params = new HttpParams()
      .set('groupFeeId', 'CP01')
    this.busy = this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFee = res.data;
      }
    });
  }
  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', '');
    this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.data) {
        this.listContTypes = res.data.filter(x => x.type === 'SHIPMENT_T04');
        this.listShipmentType = res.data.filter(x => x.type === 'SHIPMENT_T02');
        this.listImportExports = res.data.filter(x => x.type === 'SHIPMENT_T03');
      }
    });
  }

  loadToolStation(){
    const params = new HttpParams()
      this.busy = this.tollStationService.getAll().subscribe((res: ResponseValue<TollStation[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listTollStation = res.data
        }
      });
  }
  showContSealDetail() {
    this._flagContSeal = !this._flagContSeal;
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

  setCancelDispatchOrder(form: NgForm) {
    if (form.valid) {
        if(!this.entity.noteFinished){
          this.notificationService.printErrorMessage(MessageContstants.CANCEL_DISPATCH_ORDER_REQUIRED_MSG);
        }else{
          this.setFinish(form,false);
          let item:CancelDispatchOrder={
            refNo:this.entity.refNo,
            reason:this.entity.noteFinished,
            createdBy:this.userLoged.id,
            branchId:Number.parseInt(this.userLoged.branchId)
          }
          this.dispatchOrderService.CancelDispatchOrder_Create(item).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.CANCEL_ASSIGNING_OK_MSG);
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

  getLocation():void{
    if(!navigator.geolocation)return;
    navigator.geolocation.getCurrentPosition(position=>{
      this.latitue= position.coords.latitude;
      this.longtitude= position.coords.longitude;
    })
  }

  done(id:number,flag:boolean){
    this.getLocation();
    const params = new HttpParams()
      .set('refno',this.entity.refNo)
      .set('procedureid', id.toString())
      .set('latitude',this.latitue.toString())
      .set('longtitude',this.longtitude.toString())
      .set('isfinish',flag?"1":"0")
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
  newTicket(){
      this.viewTicket = true;
      setTimeout(() => {
        this.modalTicket.add();
      }, 50);
  }
  updateTicket(item:DispatchOrderTicket,index:number){
    let nItem:DispatchOrderTicket={
      index:index,
      cost:item.cost,
      flagNew:false,
      feeId:item.feeId,
      feeCode:item.feeCode,
      feeName:item.feeName,
      vat:item.vat,
      patternNumber:item.patternNumber,
      note:item.note,
      symbol:item.symbol,
      number:item.number,
      refNo:item.refNo,
      tollStationId:item.tollStationId,
      tollStationName:item.tollStationName
    } ;
    this.viewTicket = true;
    setTimeout(() => {
      this.modalTicket.edit(nItem);
    }, 50);
  }

  updateParkingTicket(item:DispatchOrderParkingticket,index:number){
    let nItem: DispatchOrderParkingticket={
      index:index,
      cost:item.cost,
      flagNew:false,
      feeId:item.feeId,
      vat:item.vat,
      note:item.note,
      refNo:item.refNo,
      parkingAddress:item.parkingAddress,
      parkingName:item.parkingName
    } ;
    this.viewParkingTicket = true;
    setTimeout(() => {
      this.modalParkingTicket.edit(nItem);
    }, 50);
  }

newEtc(){
    let item: DispatchOrderEtc={
      cost:0,
      vat:0
    }
    this.entity.listDispatchOrderEtc.push(item);
}
newParking(){
  this.viewParkingTicket = true;
  setTimeout(() => {
    this.modalParkingTicket.add();
  }, 50);
}
newMonthlyTicket(){
  let item: DispatchOrderMonthlyticket={}
  this.entity.listDispatchOrderMonthlyTicket.push(item);
}
feeCodeParkingChanged(item: DispatchOrderParkingticket, event: Fee) {
  item.feeId = event?.id;
}
feeCodeTicketChanged(item: DispatchOrderTicket, event: Fee) {
  item.feeId = event?.id;
}
  deleteMonthlyTicket(index:number){
    this.entity.listDispatchOrderMonthlyTicket.splice(index,1)
  }

  deleteEtc (index:number){
    this.entity.listDispatchOrderEtc.splice(index,1);
  }
  deleteParkingTicket(index:number){
    this.entity.listDispatchOrderParkingTicket.splice(index,1);
  }
  deleteTicket(index:number){
    this.entity.listDispatchOrderTicket.splice(index,1);
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
    this.entity.status=type
      this.busy = this.dispatchOrderService.updateState(this.entity).subscribe((res: ResponseValue<Dispatchorder>) => {
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
  closeModalTicket():void{
    this.viewTicket=false;
  }
  closeModalParkingTicket():void{
    this.viewParkingTicket=false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
