import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { DispatchOrderEtc, DispatchOrderMonthlyticket, DispatchOrderTicket, Employee, Fee, OtherCategories, Profile, ResponseValue, Route, Workflow } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { Supplier } from '@app/shared/models/supplier';
import { Vihicle } from '@app/shared/models/vihicle';
import { AuthService, EmployeeService, FeeService, NotificationService, OtherCategoriesService, UtilityService, WorkflowsService } from '@app/shared/services';
import { RouteService } from '@app/shared/services/route.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Tollroute } from '@app/shared/models/tollroute.model';
import { Quotationsubcontractors } from '@app/shared/models/transports/quotationsubcontractors.model';
import { Dispatchorderdetailed } from '@app/shared/models/transports/dispatchorders/dispatchorderdetailed';
import { QuotationsubcontractorsService } from '@app/shared/services/quotationsubcontractors.service';
import { ModalDispatchorderWorkflowComponent } from '../modal-dispatchorder-workflow/modal-dispatchorder-workflow.component';
import { ModalDispatchorderRouteComponent } from '../modal-dispatchorder-route/modal-dispatchorder-route.component';
import { TollrouteService } from '@app/shared/services/tollroute.service';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { Quotationsubcontractorsdetailed } from '@app/shared/models/transports/quotationsubcontractorsdetailed.model';
import { DispatchOrderPurchasePrice } from '@app/shared/models/transports/dispatchorders/dispatch-order-purchase-price';
import { DispatchOrderFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-fee';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalDispatchorderTicketComponent } from '../modal-dispatchorder-ticket/modal-dispatchorder-ticket.component';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { TollStation } from '@app/shared/models/toll-station.model';
import { DispatchOrderAttachfiles } from '@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles';
import { environment } from '@environments/environment';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ModalViewWorkflowsComponent } from '../../workflows/modal-view-workflows/modal-view-workflows.component';
import { DispatchOrderSurcharge } from '@app/shared/models/transports/dispatchorders/dispatch-order-surcharge.model';
import { DispatchOrderParkingticket } from '@app/shared/models/transports/dispatchorders/dispatch-order-parkingticket.model';
import Permissions from "@app/shared/models/permissions.model";
import { GasManagement } from '@app/shared/models/transports/gas-management.model';
import { CancelDispatchOrder } from '@app/shared/models/transports/cancel-dispatch-order.model';

@Component({
  selector: 'modal-cancel-dispatch-order-approved',
  templateUrl: './modal-cancel-dispatch-order-approved.component.html',
  styleUrls: ['./modal-cancel-dispatch-order-approved.component.css']
})
export class ModalCancelDispatchOrderApprovedComponent implements OnInit {
  public entity: Dispatchorder;
  public mainItem:CancelDispatchOrder;
  public flagXem: boolean = false;
  public flagOpMan = false;
  public flagSave: boolean = false;
  public flagOption: boolean = false;
  public viewWorkflow: boolean = false;
  public viewRoute: boolean = false;
  public viewAttachFiles: boolean = false;
  public viewTicket: boolean = false;
  public viewModalWorkflows: boolean = false;
  public userLoged: Profile;
  public startTime?: string;
  public endTime?: string;
  public supplierId?: number = 0;
  public listTollRoute: Tollroute[] = [];
  public listPod: DispatchOrderAttachfiles[] = [];
  public listAttachFile: DispatchOrderAttachfiles[] = [];
  public listFee: Fee[]
  public listQuotation: Quotationsubcontractors[] = [];
  public selectedItem: Dispatchorderdetailed = {};
  public listParking:DispatchOrderParkingticket[]=[];
  public flagOk: boolean = false;
  public selectdTicketIndex?: number;
  public selectdEtcIndex?: number;
  public selectdMonthlyTicketIndex?: number;
  public quotationDetailed: Quotationsubcontractorsdetailed;
  closing_permission:boolean=false;
  accept_permission:boolean=false;
  job_locked:boolean=false;
  public type?:number;
  public listSupplier: Supplier[];
  public listVihicle: Vihicle[];
  public listMooc: Vihicle[];
  public listEmployee: Employee[];
  public listRoute: Route[];
  public listcontType: OtherCategories[] = [];
  public listdocumentType: OtherCategories[] = [];
  public listVihicleType: OtherCategories[] = [];
  public listSurcharge: OtherCategories[] = [];
  public vihicleTypeId?: number = 0;
  public driverId?: string;
  public secondDriverId?: string;
  public vihicleId?: number;
  public moocId?: number;
  public tollRouteCode?: string = '';
  maskNumber = UtilityService.maskNumber;
  gasValue:GasManagement;
  public busy: Subscription;
  km:number=0;
  public listTollStation: TollStation[] = [];

  public listDieuchinh = [
    { id: 5 }, { id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }, { id: 0 }, { id: -1 }, { id: -2 }, { id: -3 }, { id: -4 }, { id: -5 }];

  @Input() appFuncion: any;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalDispatchOrderAddEdit', { static: false }) modalDispatchOrderAddEdit: ModalDirective;
  @ViewChild('staticTabs', { static: false }) staticTabs?: TabsetComponent;
  @ViewChild(ModalViewWorkflowsComponent, { static: false }) modalViewWorkflows: ModalViewWorkflowsComponent
  @ViewChild(ModalDispatchorderWorkflowComponent, { static: false }) modalWorkflow: ModalDispatchorderWorkflowComponent
  @ViewChild(ModalDispatchorderRouteComponent, { static: false }) modalRoute: ModalDispatchorderRouteComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalDispatchorderTicketComponent, { static: false }) modalTicket: ModalDispatchorderTicketComponent
  constructor(private notificationService: NotificationService, private vihicleService: VihicleService
    , private employeeService: EmployeeService, private routeService: RouteService
    , private suppliertSerive: SupplierService, private workflowService: WorkflowsService
    , private _authService: AuthService
    , private otherCategoryService: OtherCategoriesService
    , private _utilityService: UtilityService
    , private otherService: OtherCategoriesService
    , private quotationsubService: QuotationsubcontractorsService
    , private tollRouteService: TollrouteService
    , private dispatchOrderService: DispatchordersService
    , private feeService: FeeService
    , private tollStationService: TollStationService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.accept_permission= this._authService.hasPermission('DISPATCHORDER_ACCEPT') ;
    this.closing_permission = this._authService.hasPermission('DISPATCHORDER_CLOSING');
    this.loadSupplier();
    this.loadEmployee();
    this.loadVihicleType();
    this.loadTollRoute();
    this.loadContType();
    this.loadFee();
    this.loadMooc();
    this.loadSurcharge();
    this.loadTollStation();
  }

  loadTollStation() {
    this.tollStationService.getAll().subscribe((res: ResponseValue<TollStation[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTollStation = res.data;
      }
    });
  }
  loadFee() {
    const params = new HttpParams()
      .set('groupFeeId', 'CP01')
    this.busy = this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFee = res.data
      }
    });
  }
  loadSurcharge() {
    const params = new HttpParams()
      .set('type', 'SURCHARGE')
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<DispatchOrderSurcharge[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSurcharge = res.data
      }
    });
  }
  feeCodeChanged(item: DispatchOrderPurchasePrice, event: Fee) {
    item.feeId = event?.id;
  }

  feeCodeParkingChanged(item: DispatchOrderParkingticket, event: Fee) {
    item.feeId = event?.id;
  }
  feeCodeTicketChanged(item: DispatchOrderTicket, event: Fee) {
    item.feeId = event?.id;
  }

  feeCodeMonthlyChanged(item: DispatchOrderMonthlyticket, event: Fee) {
    item.feeId = event?.id;
  }

  feeCodeEtcChanged(item: DispatchOrderEtc, event: Fee) {
    item.feeId = event?.id;
  }

  feeCode2Changed(item: DispatchOrderFee, event: Fee) {
    item.feeId = event?.id;
  }

  loadVihicleType() {
    const params = new HttpParams()
      .set('type', 'VIHITYPE')
    this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVihicleType = res.data
      }
    });
  }
  loadContType() {
    const params = new HttpParams()
      .set('type', 'CONTTYPE')
    this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listcontType = res.data
      }
    });
  }
  loadMooc() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
    this.busy = this.vihicleService.getAllMooc(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listMooc = res.data
      } else {
        if (res.code == "204") {
          this.listMooc = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadTollRoute(): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId)
    this.busy = this.tollRouteService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTollRoute = res.data;
      }
      else {
        if (res.code == "204") {
          this.listTollRoute = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadEmployee(): void {
    const params = new HttpParams()
      // .set('usergroupid')
      .set('branchId', this.userLoged.branchId.toString())
    this.busy = this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listEmployee = res.data;
      }
      else {
        if (res.code == "204") {
          this.listEmployee = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }
  loadVihicle(vihicletype: number): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', vihicletype.toString());
    this.busy = this.vihicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVihicle = res.data
      } else {
        if (res.code == "204") {
          this.listVihicle = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadDocumentType() {
    const params = new HttpParams()
      .set('includeProcedure', "0")
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listdocumentType = res.data
      } else {
        if (res.code == "204") {
          this.listdocumentType = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }


  changedKmQuota(){
    this.entity.listDispatchOrderFee.forEach(item=>{
      if(item.feeId==environment.fuelFeeId && this.entity.oilQuota>0) {
        item.quantity=Math.round((this.entity.kmQuota *100 *(this.entity.oilQuota+this.entity.quotaAdjusted))/10000);
        item.vat=Math.round((this.entity.oilPrice/11)*item.quantity);
        item.totalCost=item.quantity *(this.entity.oilPrice);
        item.cost=item.totalCost-item.vat;
    }});
  }

  edit(item:CancelDispatchOrder) {
    this.mainItem=item;
    this.dispatchOrderService.getDetail(this.mainItem.refNo).subscribe((res: ResponseValue<Dispatchorder>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.entity.listDispatchOrderDetailed.forEach(item=>{
          if(item.jobLocked) this.job_locked=true;
        })
        this.vihicleTypeId = this.entity.vihicleType;
        if(this.entity.isSubcontractors){
          this.supplierId=this.entity.shippingUnitId
          this.tollRouteCode=this.entity.subcontractorsQuoteRouteCode
        };
        this.loadVihicle(this.vihicleTypeId);
        this.flagSave = false;
        this.modalDispatchOrderAddEdit.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  changedSurcharge(item:DispatchOrderSurcharge, event:OtherCategories){
    item.surchargeName=event?.categoryName;
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      //Kiểm tra nếu có thông tin phí thuê ngoài và chi phí thì phải có thông tin về mã phí, tiền>0
      if (this.entity.listDispatchOrderPurchasePrice.length > 0) {
        if (this.entity.listDispatchOrderPurchasePrice[0].feeId < 1) {
          this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
          return;
        }
      }
      if (this.entity.listDispatchOrderFee.length > 0) {
        for (let i = 0; i < this.entity.listDispatchOrderFee.length; i++)
          if (this.entity.listDispatchOrderFee[i].cost < 1) {
            this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
            return;
          }
      }
      //Kiểm tra nếu là lệnh thì phải có giá dầu
      if(!this.entity.isSubcontractors && this.entity.oilPrice<1){
        this.notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR);
        return;
      }
      //Kiểm tra xem định mức xe có chưa, nếu =0 thì báo lỗi
      if(!this.entity.isSubcontractors && this.entity.oilQuota<1){
        this.notificationService.printErrorMessage(MessageContstants.FUEL_QUOTA_ERROR);
        return;
      }
      this.flagSave = true;
        //Kiểm tra xem phụ phí có không, nếu có thì phải có mã phụ phí và tiền
        if (this.entity.listDispatchOrderSurcharge.length > 0) {
          for (let i = 0; i < this.entity.listDispatchOrderSurcharge.length; i++)
            if (this.entity.listDispatchOrderSurcharge[i].cost < 1) {
              this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
              return;
            }
        }
        this.dispatchOrderService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalDispatchOrderAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
    }
  }


  newTicket() {
    this.viewTicket = true;
    setTimeout(() => {
      this.modalTicket.add();
    }, 50);
  }
  updateTicket(item: DispatchOrderTicket, index: number) {
    let nItem: DispatchOrderTicket = {
      index: index,
      cost: item.cost,
      flagNew: false,
      vat: item.vat,
      patternNumber: item.patternNumber,
      note: item.note,
      symbol: item.symbol,
      number: item.number,
      refNo: item.refNo,
      tollStationId: item.tollStationId,
      tollStationName: item.tollStationName,
      feeId:item.feeId
    };
    this.viewTicket = true;
    setTimeout(() => {
      this.modalTicket.edit(nItem);
    }, 50);
  }
  newEtc() {
    let item: DispatchOrderEtc = {
      cost: 0,
      vat: 0,feeId:environment.tollFeeId
    }
    this.entity.listDispatchOrderEtc.push(item);
  }
  newParking(){
    let item: DispatchOrderParkingticket={
      cost:0,
      vat:0,feeId:environment.parkingFeeId
    }
    this.entity.listDispatchOrderParkingTicket.push(item);
  }
  newSurcharge() {
    let item: DispatchOrderSurcharge = {
      cost: 0,
    }
    this.entity.listDispatchOrderSurcharge.push(item);
  }
  newMonthlyTicket() {
    let item: DispatchOrderMonthlyticket = {
      feeId:environment.tollFeeId
    }
    this.entity.listDispatchOrderMonthlyTicket.push(item);
  }
  deleteMonthlyTicket(index:number){
    this.entity.listDispatchOrderMonthlyTicket.splice(index,1);
  }

  deleteParkingTicket(index: number) {
    this.entity.listDispatchOrderMonthlyTicket.splice(index, 1);
  }

  deleteEtc(index: number) {
    this.entity.listDispatchOrderEtc.splice(index, 1);
  }
  deleteTicket(index: number) {
    this.entity.listDispatchOrderTicket.splice(index, 1);
  }

  deleteSurcharge(index: number) {
    this.entity.listDispatchOrderSurcharge.splice(index, 1);
  }
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      let p: DispatchOrderAttachfiles = {
        refNo: this.entity.refNo,
        isPod: true
      }
      const file = event.target.files[0];
      this.busy = this.dispatchOrderService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPod = res.data;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
        }
      });
    }
  }

  updateState(type: number) {
      this.mainItem.status=type;
      this.mainItem.acceptedBy=this.userLoged.id;
      this.busy = this.dispatchOrderService.CancelDispatchOrder_Accept(this.mainItem).subscribe((res: ResponseValue<CancelDispatchOrder[]>) => {
       if (res.code == '200' || res.code == '201') {
         this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
         this.SaveSuccess.emit(res.data);
       }
       else {
           this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
       }
     });
  }

  chotlenh() {
    this.notificationService.printConfirmationYesNo("Chốt dừng lệnh vận chuyển hay không?", () => {
      //Kiểm tra nếu có thông tin phí thuê ngoài và chi phí thì phải có thông tin về mã phí, tiền>0
      if (this.entity.listDispatchOrderPurchasePrice.length > 0) {
        if (this.entity.listDispatchOrderPurchasePrice[0].feeId < 1) {
          this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
          return;
        }
      }
      if (this.entity.listDispatchOrderFee.length > 0) {
        for (let i = 0; i < this.entity.listDispatchOrderFee.length; i++)
          if (this.entity.listDispatchOrderFee[i].cost < 1) {
            this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
            return;
          }
      }
      //Kiểm tra nếu là lệnh thì phải có giá dầu
      if(!this.entity.isSubcontractors && this.entity.oilPrice<1){
        this.notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR);
        return;
      }
      if (this.entity.listDispatchOrderSurcharge.length > 0) {
        for (let i = 0; i < this.entity.listDispatchOrderSurcharge.length; i++)
          if (this.entity.listDispatchOrderSurcharge[i].cost < 1) {
            this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
            return;
          }
      }
      this.dispatchOrderService.update(this.entity).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.updateState(1);
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
          this.flagSave = false;
        }
      }, () => {});
    }, () => { });
  }
  
  duyetchotlenh(){
    this.notificationService.printConfirmationYesNo("Duyệt dừng lệnh vận chuyển hay không?", () => {
      this.updateState(2);
    },() => { });
  }
  huychotlenh(){
    this.notificationService.printConfirmationYesNo("Từ chối dừng lệnh vận chuyển?", () => {
      this.updateState(0);
    },() => { });
  }

  newFee() {
    let item: DispatchOrderFee = {
      cost: 0,
      vat: 0,totalCost:0
    }
    this.entity.listDispatchOrderFee.push(item);
  }


  editWorkflow(item: Dispatchorderdetailed) {
    //Không dùng trực tiếp set giá trị = index của list vì khi update item sẽ update ngược lại list
    this.selectedItem = {
      workflowId: item.workflowId,
      jobId: item.jobId,
      contSeal: item.contSeal,
      note: item.note
    }
    this.viewWorkflow = true;
    setTimeout(() => {
      this.modalWorkflow.edit();
    }, 50);
  }

  deleteFee(item: DispatchOrderFee) {
    let index = this.entity.listDispatchOrderFee.indexOf(item);
    if (index !== -1) {
      this.entity.listDispatchOrderFee.splice(index, 1);
    }
  }
  changeCost(item:DispatchOrderFee){
    item.totalCost=item.cost!+item.vat;
  }

  saveSuccessTicket(value): void {
    if (value.flagNew) {
      this.entity.listDispatchOrderTicket.push(value);
    } else {
      this.entity.listDispatchOrderTicket[value.index] = value;
    }
  }
  closeModal(): void {
    this.viewWorkflow = false;
  }
  closeModalRoute(): void {
    this.viewRoute = false;
  }
  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }
  closeModalTicket() {
    this.viewTicket = false;
  }
  closeModalWorkflows() {
    this.viewModalWorkflows = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }

}

