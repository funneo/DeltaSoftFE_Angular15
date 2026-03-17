import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Customer, Employee, Handlinggroup, OtherCategories, Profile, ResponseValue, Shipment } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { TransportCategory } from '@app/shared/models/danhmuc/transport-category.model';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { NotificationService, HandlinggroupService, CustomerService, AuthService, OtherCategoriesService, UtilityService, ShipmentService, EmployeeService } from '@app/shared/services';
import { TransportCategoryService } from '@app/shared/services/danhmuc/transport-category.service';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalShipmentViewSearchComponent } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';

@Component({
  selector: 'modal-shipping-task-opman',
  templateUrl: './modal-shipping-task-opman.component.html',
  styleUrls: ['./modal-shipping-task-opman.component.css']
})
export class ModalShippingTaskOpmanComponent implements OnInit {
  public entity: ShippingTask;
  public flagXem: boolean = false;
  public flagNew: boolean = false;
  public flagOpMan = false;
  public flagSave: boolean = false;
  public userLoged: Profile;
  public startTime?: string;
  public endTime?: string;
  public checked?: boolean = false;
  public viewAttackFiles?: boolean = false;
  listTypeOfLiffingOrder:any[]=[{id:0,value:'Điện tử'},{id:1,value:'Giấy'}];
  listType:any[]=[{id:0,value:'FCL'},{id:1,value:'LCL'}];
  listShipmentType: OtherCategories[];
  listContTypes: OtherCategories[];
  listImportExports: OtherCategories[];
  listTransportCategoryType:TransportCategory[]=[];
  viewSearchJobId = false;

  customerName='';
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayCutOff = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  inquiryTimeToThePorts = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  inquiryTimeToTheFactory = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  public listToughness: OtherCategories[];
  public listCustomer: Customer[];
  public listHandlingGroup: Handlinggroup[];
  public listShipment: Shipment[];
  public handlingGroupId?: number;
  public listContype:OtherCategories[]=[];
  public customerId?: number;
  public customerCode?: string;
  public jobgroupId?: number;
  public busy: Subscription;
  public listShipBrand:TransportCategory[];
  public listPort:TransportCategory[];
  public listCFS:TransportCategory[];
  listEmployee: Employee[]=[];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  // @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttachFiles: ModalWorkflowAttackFilesComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent
  constructor(private notificationService: NotificationService, private jobGroupService: JobgroupService
    , private handlingGroupService: HandlinggroupService, private customerService: CustomerService
    , private service: ShippingTaskService, private _authService: AuthService
    , private otherCategoryService: OtherCategoriesService
    , private _utilityService: UtilityService
    , private shipmentService: ShipmentService
    , private _transportCategoryService:TransportCategoryService
    , private _employeeService:EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadCustomer();
    this.loadHandlingGroup();
    this.loadOtherCategory();
    this.loadtransportCategory();
    this.loadEmployee()
  }

  loadEmployee() {
    const params = new HttpParams()
    .set('branchId',this.userLoged.branchId?.toString());
    this._employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listContTypes = res.data.filter(x => x.type === 'SHIPMENT_T04');
        this.listShipmentType = res.data.filter(x => x.type === 'SHIPMENT_T02');
        this.listImportExports = res.data.filter(x => x.type === 'SHIPMENT_T03');
        this.listToughness = res.data.filter(x => x.type === 'TOUGH');
        this.listContTypes = res.data.filter(x => x.type === 'CONTTYPE');
    });
  }
  
  loadtransportCategory() {
    const params = new HttpParams()
      .set('branchid',this.userLoged.branchId.toString())
    this._transportCategoryService.getAll(params).subscribe((res: ResponseValue<TransportCategory[]>) => {
      this.listCFS = res.data.filter(x => x.type === 2);
      this.listShipBrand = res.data.filter(x => x.type === 0);
      this.listPort = res.data.filter(x => x.type === 1);
    });
  }
  
  loadCustomer(): void {
    const params = new HttpParams()
    this.busy = this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data
      }
    });
  }
  loadHandlingGroup(): void {
    this.busy = this.handlingGroupService.getAll().subscribe((res: ResponseValue<Handlinggroup[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listHandlingGroup = res.data;
      }
      else {
        if (res.code == "204") {
          this.listHandlingGroup = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }


  add(item:ShippingTask,flag:boolean) {
    this.entity=item;
    if(!flag){
      this.customerId = this.entity.customerId;
      this.customerCode = this.entity.customerCode;
      this.customerName=this.entity.customerName;
    }
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }
  assign(flag:boolean){
    
  }

  edit(id: string, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<ShippingTask>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.customerId = this.entity.customerId;
        this.customerCode = this.entity.customerCode;
        if (this.entity.estimatedStartTime) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)), true
          );
          this.entity.estimatedStartTime = moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.estimatedFinishTime) {
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)), true
          );
          this.entity.estimatedFinishTime = moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.pickupTime) {
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.pickupTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)), true
          );
          this.entity.pickupTime = moment(this.entity.pickupTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.deliveryTime) {
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.deliveryTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)), true
          );
          this.entity.deliveryTime = moment(this.entity.deliveryTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        this.modalAddEdit.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }


  saveChange(form: NgForm) {
    if (form.valid) {
      if (this.endTime < this.startTime) {
        this.notificationService.printErrorMessage(MessageContstants.ENDTIME_NOT_LARGER_THAN_STARTTIME);
        return;
      }

      this.flagSave = true;
      //Nếu là tạo mới công việc thì id chưa khởi tạo
      if (this.entity.id == undefined) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code +'\n'+res.message);
            this.flagSave = false;
          }
        });
      }
      else {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.updatedBy = this.userLoged.id;
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
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
  }

 
  attack() {
    this.viewAttackFiles = true;
    let item: Attachfiles = {
      frmName: 'SHIPPINGTASK',
      functionName: 'SHIPPINGTASK',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, this.entity.createdBy!=this.userLoged.id);
    }, 50);
  }
  closeAttackModal() {
    this.viewAttackFiles = false;
  }


  selectedNgaybatdau(event) {
    if (this.entity.estimatedStartTime == null)
      this.entity.estimatedStartTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdau(event) {
    if (this.entity.estimatedStartTime == null)
      this.entity.estimatedStartTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');

  }
  selectedNgayhoanthanh(event) {
    this.entity.estimatedFinishTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgayhoanthanh(event) {
    if (this.entity.estimatedFinishTime == null)
      this.entity.estimatedFinishTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selectedpickupTime(event) {
    this.entity.pickupTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedpickupTime(event) {
    if (this.entity.pickupTime == null)
      this.entity.pickupTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selecteddeliveryTime(event) {
    this.entity.deliveryTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closeddeliveryTime(event) {
    if (this.entity.deliveryTime == null)
      this.entity.deliveryTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedcontainerStoragePeriod(event) {
      this.entity.demurageTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
    }
    closedcontainerStoragePeriod(event) {
      if (this.entity.demurageTime == null)
        this.entity.demurageTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
    }
    selecteddetentionTime(event) {
      this.entity.detentionTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
    }
    closeddetentionTime(event) {
      if (this.entity.detentionTime == null)
        this.entity.detentionTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
    }
    
  
  selectedcutOffTime(event) {
    this.entity.cutOffTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedcutOffTime(event) {
    if (this.entity.cutOffTime == null)
      this.entity.cutOffTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  
  toughessChanged(event: OtherCategories) {
    this.entity.jobToughnessName = event?.categoryName;
  }

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.customerCode = event.customerCode;
    this.customerName=event.customerName;
    this.entity.jobId = null;
    this.entity.weight = null;
    this.entity.shipmentType=null;
    this.entity.shipmentId=null;
    this.entity.billBooking=null;
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

  getJobId() {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalListShipment.view(this.entity.customerId, Number.parseInt(this.userLoged.branchId),0);
    }, 50);
  }
  
  OnHidden() {
    this.CloseModal.emit();
  }
}
