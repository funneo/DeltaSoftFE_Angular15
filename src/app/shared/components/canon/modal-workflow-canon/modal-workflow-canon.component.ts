import { ModalShipmentViewSearchComponent } from './../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import {  CanonRoad,  Customer, OtherCategories, Profile,  ResponseValue,  Shipment,  ShipmentContSeal, ShipmentPackage, ShipmentServiceDetail, Workflow } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { UtilityService, NotificationService,  BranchService, CustomerService, AuthService, OtherCategoriesService, ContractCustomerService, CanonRoadService, WorkflowsService, ShipmentService } from '@app/shared/services';
import { QuotationCustomerService } from '@app/shared/services/sales-marketing/quotation-customer.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';

@Component({
  selector: 'modal-workflow-canon',
  templateUrl: './modal-workflow-canon.component.html',
  styleUrls: ['./modal-workflow-canon.component.css']
})
export class ModalWorkflowCanonComponent implements OnInit {
public entity: Workflow;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  // listUser: User[];
  userName: string;
  listCustomer: Customer[];
  listWorkflow: Workflow[];
  branchId: number;
  _shipmentType = SystemContstants.CANON_TRUCKING;
  userLoged?: Profile;
  listRoad: CanonRoad[];

  _cdsDate: string;
  ngayToKhaiOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );

  _customerId: number;
  viewAttachFiles: boolean;
  listConts: ShipmentContSeal[];
  _flagContSeal: boolean = false;
  listPakages: ShipmentPackage[];
  maskNumber = UtilityService.maskNumber;

  _isBaoGiaSoHoa = false;
  listDichVuSoHoa: ShipmentServiceDetail[];
  _hasPermissionContract = false;

  listLoaiDichVus: OtherCategories[];
  listDVTs: OtherCategories[];
  listTienTes: OtherCategories[];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  constructor(private _notificationService: NotificationService, private _service: WorkflowsService,
    private shipmentService: ShipmentService, private customerService: CustomerService, private authService: AuthService,
    private _utilityService: UtilityService, private otherCategoriesService: OtherCategoriesService,
    private contractCustomerService: ContractCustomerService, private quotationCustomerService: QuotationCustomerService,
    private canonRoadService: CanonRoadService) {
    let user = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(user.branchId);
    this.userName = user.userName;
    this._hasPermissionContract = this.authService.hasPermission('CONTRACTCUSTOMER_VIEW');
  }


  ngOnInit(): void {
    this.userLoged = this.authService.getLoggedInUser();
    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == 'CANON_TRUCKING');
    if (i != -1) {
      this._shipmentType = list[i].value;
    }
    this.loadCustomer();
    this.loadOtherCategory();
  }



  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }
  loadWorkflow() {
    const params = new HttpParams()
      .set('shipmentType', this._shipmentType.toString());
    this._service.getAll(params).subscribe((res: ResponseValue<Workflow[]>) => {
      this.listWorkflow = res.data;
    });
  }

  loadRoad(): void {
    const params = new HttpParams()
      .set('customerId', this.customerId?.toString());
    this.canonRoadService.getAll(params).subscribe((res: ResponseValue<CanonRoad[]>) => {
      this.listRoad = res.data;
    });
  }

  attack() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'WORKFLOW',
      functionName: 'WORKFLOW',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, this.entity.createdBy!=this.userLoged.id);
    }, 50);
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listLoaiDichVus = res.data.filter(x => x.type === 'SERVICE');
        this.listDVTs = res.data.filter(x => x.type === 'UNIT');
        this.listTienTes = res.data.filter(x => x.type === 'CURRENCY');
    });
  }


  selectedNgayToKhai(event) {
    this._cdsDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayToKhai(event) {
    if (this._cdsDate == null)
      this._cdsDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add() {
    let today =moment(new Date()).format(FormatContstants.DATETIMEVN);
    this.entity = {
      status: 0,shipmentId:0,
      branchId: this.branchId,handlingGroupId:0,listHandlingGroupId:[0],estimatedStartTime:today,estimatedFinishTime:today,
      isCanon:true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }
  customerId: number;
  customerCode: string;
  customerName:string;
  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.customerCode = event.customerCode;
    this.customerName=event.customerName;
    this.loadRoad();
  }
  searchCustomer() {
    let value = this.listCustomer.findIndex(item => item.customerCode.indexOf(this.customerCode) !== -1);
    if (value !== -1) {
      this.entity.customerId = this.listCustomer[value].id;
      this.customerId = this.listCustomer[value].id;
      this.customerCode = this.listCustomer[value].customerCode;
      this.customerName=this.listCustomer[value].customerName;
    } else {
      this.entity.customerId = 0;
      this.customerCode = '';
      this.customerId = 0;
      this.customerName='';
    }
  }

  saveSuccessJobId(event: Shipment) {
      this.shipmentService.getDetail(event.id.toString()).subscribe((res: ResponseValue<Shipment>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity.item=res.data  
          this.entity.jobId = this.entity.item.jobId;
          this.entity.shipmentId=this.entity.item.id;
        }
      });
    }
  viewSearchJobId: boolean = false;
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent
  getJobId() {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalListShipment.view(this.entity.customerId, Number.parseInt(this.userLoged.branchId),0);
    }, 50);
  }
  edit(id: string, flag: boolean) {
    this._service.getDetail(id).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this._cdsDate
        if (this.entity.pickupTime) {
          this.ngayToKhaiOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.pickupTime, FormatContstants.DATEEN).format(FormatContstants.DATEEN)),
            true
          );
          this._cdsDate = moment(this.entity.pickupTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        this._customerId = this.entity.customerId;
        this.customerCode = this.entity.customerCode;
        this.customerName=this.entity.customerName;
        this.loadRoad();
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this._cdsDate)
        this.entity.pickupTime = moment(this._cdsDate, FormatContstants.DATEVN).format(
          FormatContstants.DATETIMEVN
        );
      if (this.entity.id == undefined) {
        this._service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {

            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data.id);
            this.entity.id = undefined;
            this.entity.numberOfPallet = null;
            this.entity.jobName = null
            this.entity.jobDescription = null;
            this.flagSave = false;
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
        this._service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data.id);
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

  OnHidden() {
    this.CloseModal.emit();
  }

  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'WORKFLOW',
      functionName: 'WORKFLOW',
      refNo: this.entity.id.toString(),
      jobId:this.entity.jobId
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }


}
