import { TransportCategory } from './../../../models/danhmuc/transport-category.model';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Customer, Employee, Handlinggroup, OtherCategories, Profile, ResponseValue, Shipment, ShipmentContSeal } from '@app/shared/models';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalShipmentViewSearchComponent } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { AuthService, CustomerService, EmployeeService, HandlinggroupService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import { HttpParams } from '@angular/common/http';
import { MessageContstants } from '@app/shared/constants';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { NgForm } from '@angular/forms';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { TransportCategoryService } from '@app/shared/services/danhmuc/transport-category.service';
import { CustomerLocationsService } from '@app/shared/services/danhmuc/customer-locations.service';
import { CustomerLocations } from '@app/shared/models/danhmuc/customer-locations.model';
import { ModalListContSealComponent } from '../../shipments/modal-list-cont-seal/modal-list-cont-seal.component';
import { PortsService } from '@app/shared/services/danhmuc/ports.service';
import { Ports } from '@app/shared/models/danhmuc/ports.model';


@Component({
  selector: 'modal-shipping-task-cs',
  templateUrl: './modal-shipping-task-cs.component.html',
  styleUrls: ['./modal-shipping-task-cs.component.css']
})
export class ModalShippingTaskCsComponent implements OnInit {
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
  shipmentSelected:Shipment = {};
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
  public listShipBrand:OtherCategories[];
  public listCFS:Ports[]=[];
  listEmployee: Employee[]=[];
  listLocations:CustomerLocations[]=[];
  viewContSeals:boolean=false;
  maskNumber = UtilityService.maskNumber;
  isEport=false;
  public dateFields = [
    { field: 'estimatedStartTime', optionField: 'ngaybatdauOption' },
    { field: 'estimatedFinishTime', optionField: 'ngayhoanthanhOption' },
    { field: 'pickupTime', optionField: 'ngayhoanthanhOption' },
    { field: 'deliveryTime', optionField: 'ngayhoanthanhOption' },
    { field: 'demurageTime', optionField: 'ngaybatdauOption' },
    { field: 'detentionTime', optionField: 'ngaybatdauOption' },
    { field: 'cutOffTime', optionField: 'ngaybatdauOption' }
  ];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  // @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttachFiles: ModalWorkflowAttackFilesComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent
  @ViewChild(ModalListContSealComponent, { static: false }) modalListContSeals: ModalListContSealComponent
  constructor(private notificationService: NotificationService 
    , private handlingGroupService: HandlinggroupService, private customerService: CustomerService
    , private service: ShippingTaskService, private _authService: AuthService
    , private otherCategoryService: OtherCategoriesService
    , private _utilityService: UtilityService
    , private _transportCategoryService:TransportCategoryService
    , private _employeeService:EmployeeService
    , private _customerLocationService:CustomerLocationsService
    , private _portsService:PortsService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadCustomer();
    this.loadHandlingGroup();
    this.loadOtherCategory();
    this.loadEmployee()
    this.loadPorts();
    //List danh sách các trường ngày tháng trong form
    
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
        this.listShipBrand = res.data.filter(x => x.type === 'HANGTAU');
    });

  }
  
  listPorts: Ports[] = [];
  loadPorts(): void {
    this.busy = this._portsService.getAll().subscribe((res: ResponseValue<Ports[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPorts = res.data;
      }
    });
  }

  loadLocations(customerId:number){
    this.busy = this._customerLocationService.getAll(customerId,true).subscribe((res: ResponseValue<CustomerLocations[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listLocations = res.data
      }else this.listLocations=[];
    });
  }
  
  loadCustomer(): void {
    const params = new HttpParams()
    this.busy = this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data.filter(x => x.locked === false);
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
    this.entity.status=0;
    if(!flag){
      this.customerId = item.customerId;
      this.customerCode = item.customerCode;
      this.customerName=item.customerName;
      this.loadLocations(this.customerId);
      this.isEport=this.entity.shipmentType==1174;
      this.checked=this.entity.status>0;
      this.dateFields.forEach(({ field, optionField }) => {
        this._utilityService.formatAndSetDateTime(this.entity, field, optionField);
      });
    }else{
      this.entity.jobToughness=3
    }
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<ShippingTask>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        //this.flagSave = this.entity.status === 1;
        this.customerId = this.entity.customerId;
        this.loadLocations(this.customerId);
        this.customerCode = this.entity.customerCode;  
        this.isEport=this.entity.shipmentType==1174;
        this.checked=this.entity.status>0;
        //Nếu lập lệnh VC rồi thì ko cho sửa nữa
        if(this.entity.refNo?.length>0)this.flagXem=true;
        this.dateFields.forEach(({ field, optionField }) => {
          this._utilityService.formatAndSetDateTime(this.entity, field, optionField);
        });
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
      this.entity.status=this.checked?1:0;
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

  saveAndNew(form:NgForm){
    if (form.valid) {
      if (this.endTime < this.startTime) {
        this.notificationService.printErrorMessage(MessageContstants.ENDTIME_NOT_LARGER_THAN_STARTTIME);
        return;
      }
      this.flagSave = true;
      this.entity.status=this.checked?1:0;
      //Nếu là tạo mới công việc thì id chưa khởi tạo
      if (this.entity.id == undefined) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Đoạn này xóa hết các dữ liệu hiện có sau khi thêm mới thành công
            this.entity.id=undefined;
            this.entity.handlingGroupId=null;
            this.entity.estimatedStartTime=null;
            this.entity.estimatedFinishTime=null;
            this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.flagNew=true;
            this.flagSave=false;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code +'\n'+res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.updatedBy = this.userLoged.id;
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Update xong thì xóa hết entity đi để tạo mới
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.entity.id=undefined;
            this.entity.customerId=null;
            this.entity.jobId=null;
            this.entity.handlingGroupId=null;
            this.entity.jobToughness=null;
            this.entity.estimatedStartTime=null;
            this.entity.estimatedFinishTime=null;
            this.customerCode=null
            this.flagNew=true;
            this.flagSave=false;
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

  changepickupLocationExport(event:CustomerLocations){
    this.entity.pickupLocation=event?.address;
  }
  changepickupLocationImport (event:Ports){
    this.entity.pickupLocation=event.name;
  }
  changedeliveryLocationImport(event:CustomerLocations){
    this.entity.deliveryLocation=event?.address;
  }
  changedeliveryLocationExport (event:Ports){
    this.entity.deliveryLocation=event.name;
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

  viewShipmentContSeal() {
    this.viewContSeals = true;
    setTimeout(() => {
      this.modalListContSeals.view(this.entity.shipmentId);
    }, 50);
  }
  saveSuccessContSeal(event:ShipmentContSeal){
    this.entity.containerNumber=event?.contNo;
    this.entity.sealNumber=event?.sealNo;
    this.entity.contType=event?.contType;
    this.entity.weight=event?.gw?.toString();
  } 
  closeShipmentContSealsModal() {
    this.viewContSeals = false;
  }

  selectedNgaybatdau(event) {
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
    this.loadLocations(this.customerId);
    this.entity.informationOfSurchargeInvoice=event?.informationOfSurchargeInvoice;
    this.entity.informationOnContainerLiffInvoice=event?.informationOnContainerLiffInvoice;
    this.entity.externalInformationOnContainerLiffInvoice=event?.externalInformationOnContainerLiffInvoice;
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

  changedTaskType(event:any){
    if(event?.id==0)this.entity.weight=null
    else this.entity.contType=null; 
  }

  selectedContNo(event:ShipmentContSeal){
    this.entity.sealNumber=event?.sealNo;
    let contType=event?.contType;
    let index=this.listContype.find(it=>{
      it.categoryName===contType;
    })
    if(index)this.entity.contType=index.categoryCode;
  }
  saveSuccessJobId(event: Shipment) {
    this.shipmentSelected=event;
    const allowedShipmentTypes = [1174, 1175, 1177,46];
    if(allowedShipmentTypes.includes(this.shipmentSelected.shipmentType)){
      this.entity.jobId = event.jobId;
      this.entity.weight = event.weight?.toString();
      this.entity.shipmentType=event.shipmentType;
      this.entity.shipmentId=event.id;
      this.entity.billBooking=event.bookingNo;
      this.isEport=this.shipmentSelected.shipmentType==1174;
    }
      else{
        this.shipmentSelected=null;
        this.notificationService.printAlert(MessageContstants.TITLE_INFO,"Loại hình Job không phải là SE,SI,DS, kiểm tra lại!");
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
