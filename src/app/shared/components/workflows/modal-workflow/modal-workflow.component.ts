import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Customer, Handlinggroup, OtherCategories, Profile, ResponseValue, Shipment, Workflow, WorkflowJobOption, } from '@app/shared/models';
import { Jobgroup } from '@app/shared/models/jobgroup';
import { Jobgroupoption } from '@app/shared/models/jobgroupoption';
import { WorkflowContSeal } from '@app/shared/models/workflows/workflow-cont-seal.model';
import { AuthService, CustomerService, NotificationService, OtherCategoriesService, ShipmentService, UtilityService, WorkflowsService } from '@app/shared/services';
import { HandlinggroupService } from '@app/shared/services/handlinggroup.service';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { JobgroupoptionService } from '@app/shared/services/jobgroupoption.service';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { element } from 'protractor';
import { Subscription } from 'rxjs';
import { ModalShipmentViewSearchComponent } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { ModalMultiplyWorkflowComponent } from '../modal-multiply-workflow/modal-multiply-workflow.component';
import { ModalWorkflowAttackFilesComponent } from '../modal-workflow-attack-files/modal-workflow-attack-files.component';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-workflow',
  templateUrl: './modal-workflow.component.html',
  styleUrls: ['./modal-workflow.component.css']
})
export class ModalWorkflowComponent implements OnInit {
  public entity: Workflow;
  public flagXem: boolean = false;
  public flagNew: boolean = false;
  // Chế độ xem nháp (draft.DraftEntries) — read-only, nền vàng, nút "Xác nhận chuyển sang ERP".
  public _isDraftView: boolean = false;
  public _draftId: number;
  public flagOpMan = false;
  public flagSave: boolean = false;
  public flagOption: boolean = false;
  public userLoged: Profile;
  public startTime?: string;
  public endTime?: string;
  public isTransport?: boolean = false;
  public isOpMan?: boolean = false;
  public isRemovable?: boolean = false;
  public viewAttackFiles?: boolean = false;

  listShipmentType: OtherCategories[];
  listContTypes: OtherCategories[];
  listImportExports: OtherCategories[];
  listGroup: number[] = [];
  viewSearchJobId = false;
  viewModalMultiply = false;
  jobName='';
  _flagContSeal = false;
  listType: object[] = [{ value: 'Hàng nhập' }, { value: 'Hàng xuất' }];
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
  public listJobGroup: Jobgroup[];
  public listJobGroupOption: Jobgroupoption[];
  public handlingGroupId?: number;
  public customerId?: number;
  public customerCode?: string;
  public jobgroupId?: number;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @Output() ApproveDraft: EventEmitter<number> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  // @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttachFiles: ModalWorkflowAttackFilesComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalMultiplyWorkflowComponent, { static: false }) modalMultiply: ModalMultiplyWorkflowComponent
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent
  constructor(private notificationService: NotificationService, private jobGroupService: JobgroupService, private jobGroupOptionService: JobgroupoptionService
    , private handlingGroupService: HandlinggroupService, private customerService: CustomerService
    , private shipmentSerive: ShipmentService, private workflowService: WorkflowsService, private _authService: AuthService
    , private otherCategoryService: OtherCategoriesService
    , private _utilityService: UtilityService
    , private otherService: OtherCategoriesService
    , private shipmentService: ShipmentService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadCustomer();
    this.loadJobGroup();
    this.loadToughness();
    this.loadHandlingGroup();
    this.loadOtherCategory();
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listContTypes = res.data.filter(x => x.type === 'SHIPMENT_T04');
        this.listShipmentType = res.data.filter(x => x.type === 'SHIPMENT_T02');
        this.listImportExports = res.data.filter(x => x.type === 'SHIPMENT_T03');
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

  loadToughness(): void {
    const params = new HttpParams()
      .set('type', 'TOUGH')
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listToughness = res.data;
      }
      else {
        if (res.code == "204") {
          this.listToughness = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
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

  loadJobGroup(): void {
    const params = new HttpParams()
    this.busy = this.jobGroupService.getAll().subscribe((res: ResponseValue<Jobgroup[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listJobGroup = res.data
      } else {
        if (res.code == "204") {
          this.listJobGroup = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadJobGroupOption() {
    if (this.jobgroupId == null) return;
    const params = new HttpParams()
      .set('jobGroupId', this.jobgroupId.toString())
      .set('includeProcedure', "0")
    this.busy = this.jobGroupOptionService.getByJobGroup(params).subscribe((res: ResponseValue<Jobgroupoption[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listJobGroupOption = res.data
        this.editcheck();
        this.icheck();
      } else {
        if (res.code == "204") {
          this.listJobGroupOption = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  add(item:Workflow,flag:boolean) {
    this.entity=item;
    if(!flag){
      this.listGroup.push(this.entity.handlingGroupId);
      this.jobgroupId = this.entity.jobGroupId;
      this.customerId = this.entity.customerId;
      this.customerCode = this.entity.customerCode;
      this.customerName=this.entity.customerName;
      this.isTransport = this.entity.jobGroupId == environment.transportGroupId;
      if (this.entity.estimatedStartTime) {
        this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
          new Date(moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
        );
        this.entity.estimatedStartTime = moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(
          FormatContstants.DATETIMEVN
        );
      }
      if (this.entity.estimatedFinishTime) {
        this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
          new Date(moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
        );
        this.entity.estimatedFinishTime = moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(
          FormatContstants.DATETIMEVN
        );
      }
      if (this.entity.closingTime) {
        this.ngayCutOff = this._utilityService.dateTimeOptionDays(
          new Date(moment(this.entity.closingTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
        );
        this.entity.closingTime = moment(this.entity.closingTime, FormatContstants.DATETIMEEN).format(
          FormatContstants.DATETIMEVN
        );
      }
      if (this.entity.inquiryTimeToTheFactory) {
        this.inquiryTimeToTheFactory = this._utilityService.dateTimeOptionDays(
          new Date(moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
        );
        this.entity.inquiryTimeToTheFactory = moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(
          FormatContstants.DATETIMEVN
        );
      }
      if (this.entity.inquiryTimeToThePorts) {
        this.inquiryTimeToThePorts = this._utilityService.dateTimeOptionDays(
          new Date(moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
        );
        this.entity.inquiryTimeToThePorts = moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(
          FormatContstants.DATETIMEVN
        );
      }
      this.loadJobGroupOption();
    }
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this._isDraftView = false;
    this.modalAddEdit.show();
  }

  /**
   * Xem 1 công việc NHÁP (draft.DraftEntries.Payload) read-only — REUSE form modal-workflow.
   * flagXem=true (khóa nhập) + nền vàng + nút "Xác nhận chuyển sang ERP". KHÔNG gọi BE lưu.
   * Payload là DTO tạo-thật site nháp gửi (date đã dạng VN dd/MM/yyyy HH:mm:ss).
   */
  viewDraft(payload: any, draftId: number) {
    let p: any = payload;
    if (typeof payload === 'string') { try { p = JSON.parse(payload || '{}'); } catch { p = {}; } }
    this.entity = p || {};
    this._draftId = draftId;
    this._isDraftView = true;
    this.flagXem = true;
    this.flagNew = false;
    this.flagSave = false;
    this.isOpMan = false;
    this.jobgroupId = this.entity.jobGroupId;
    this.customerId = this.entity.customerId;
    this.customerCode = this.entity.customerCode;
    this.customerName = this.entity.customerName;
    this.isTransport = this.entity.jobGroupId == environment.transportGroupId;
    this.loadJobGroupOption();
    this.modalAddEdit.show();
  }

  /** Nút "Xác nhận chuyển sang ERP" — tạo công việc THẬT từ nháp + ghi ngược draft. */
  approveDraft() {
    if (this.flagSave) return;
    // Đảm bảo listHandlingGroupId (BE loop theo nhóm); rỗng → suy từ handlingGroupId.
    if (!this.entity.listHandlingGroupId || this.entity.listHandlingGroupId.length === 0) {
      this.entity.listHandlingGroupId = this.entity.handlingGroupId ? [this.entity.handlingGroupId] : [];
    }
    this.flagSave = true;
    this.workflowService.promoteFromDraft(this.entity, this._draftId).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(
          res.data?.alreadyPromoted
            ? 'Nháp đã được duyệt trước đó (Job ' + (res.data?.jobId || '') + ')'
            : 'Đã duyệt thành Công việc thật ' + (res.data?.jobId || ''));
        this.modalAddEdit.hide();
        this.ApproveDraft.emit(this._draftId);
      } else {
        this.notificationService.printErrorMessage(res.message || MessageContstants.UPDATED_ERR_MSG);
        this.flagSave = false;
      }
    });
  }

  edit(id: string, flag: boolean, isOpMan: boolean) {
    this._isDraftView = false;
    this.workflowService.getDetail(id).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.isOpMan = isOpMan;
        this.flagXem = flag;
        this.flagSave = false;
        this.jobgroupId = this.entity.jobGroupId;
        this.customerId = this.entity.customerId;
        this.customerCode = this.entity.customerCode;
        this.isRemovable = (!this.entity.isMainJob && (this.entity.jobAssignedUserId == null || this.entity.jobAssignedUserId == '00000000-0000-0000-0000-000000000000'));
        this.isTransport = this.entity.jobGroupId == environment.transportGroupId;
        if (this.entity.estimatedStartTime) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.estimatedStartTime = moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.estimatedFinishTime) {
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.estimatedFinishTime = moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.closingTime) {
          this.ngayCutOff = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.closingTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.closingTime = moment(this.entity.closingTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.inquiryTimeToTheFactory) {
          this.inquiryTimeToTheFactory = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.inquiryTimeToTheFactory = moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.inquiryTimeToThePorts) {
          this.inquiryTimeToThePorts = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.inquiryTimeToThePorts = moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.pickupTime) {
          this.entity.pickupTime = moment(this.entity.pickupTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.deliveryTime) {
          this.entity.deliveryTime = moment(this.entity.deliveryTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        this.loadJobGroupOption();
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
      this.getJobGroupOption();
      this.flagSave = true;
      //Nếu là tạo mới công việc thì id chưa khởi tạo
      if (this.entity.id == undefined) {
        this.entity.loadingUnloadingTypeId = 0;
        this.entity.deliveryTimeId = 0;
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.entity.isMainJob = true;
        let wfOtion: WorkflowJobOption[] = [];
        this.entity.shipmentId = this.entity.item.id;
        this.listJobGroupOption.forEach(element => {
          if (element.checked) {
            let item: WorkflowJobOption = {
              jobOptionName: element.jobGroupName,
              jobOptionId: element.id,
              workflowId: 0
            }
            wfOtion.push(item);
          }
        });
        this.entity.workflowJobOptions = wfOtion;
        this.entity.listHandlingGroupId = this.listGroup;
        this.workflowService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        });
      }
      else {
        this.entity.loadingUnloadingTypeId = 0;
        this.entity.deliveryTimeId = 0;
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.updatedBy = this.userLoged.id;
        this.entity.isMainJob = true;
        let wfOtion: WorkflowJobOption[] = [];
        this.listJobGroupOption.forEach(element => {
          if (element.checked) {
            let item: WorkflowJobOption = {
              jobOptionName: element.jobGroupName,
              jobOptionId: element.id,
              workflowId: 0
            }
            wfOtion.push(item);
          }
        });
        this.entity.workflowJobOptions = wfOtion;
        this.workflowService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
      this.getJobGroupOption();
      this.flagSave = true;
      //Nếu là tạo mới công việc thì id chưa khởi tạo
      if (this.entity.id == undefined) {
        this.entity.loadingUnloadingTypeId = 0;
        this.entity.deliveryTimeId = 0;
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.entity.isMainJob = true;
        let wfOtion: WorkflowJobOption[] = [];
        this.entity.shipmentId = this.entity.item.id;
        this.entity.numberOfCont=this.entity.item.containers;
        this.entity.numberOfPackage=this.entity.item.cartons;
        this.entity.numberOfPallet=this.entity.item.pallets;
        this.entity.weight=this.entity.item.weight;
        this.entity.volume=this.entity.item.volume;
        this.listJobGroupOption.forEach(element => {
          if (element.checked) {
            let item: WorkflowJobOption = {
              jobOptionName: element.jobGroupName,
              jobOptionId: element.id,
              workflowId: 0
            }
            wfOtion.push(item);
          }
        });
        this.entity.workflowJobOptions = wfOtion;
        this.entity.listHandlingGroupId = this.listGroup;
        this.workflowService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Đoạn này xóa hết các dữ liệu hiện có sau khi thêm mới thành công
            this.entity.id=undefined;
            this.entity.customerId=null;
            this.entity.jobId=null;
            this.entity.handlingGroupId=null;
            this.listGroup=null;
            this.entity.jobToughness=null;
            this.entity.estimatedStartTime=null;
            this.entity.estimatedFinishTime=null;
            this.entity.jobGroupId=null;
            this.listJobGroupOption=[];
            this.entity.item={};
            this.entity.jobDescription=null;
            this.entity.listHandlingGroupId=[];
            this.entity.workflowJobOptions=[];
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.flagNew=true;
            this.flagSave=false;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        });
      }
      else {
        this.entity.loadingUnloadingTypeId = 0;
        this.entity.deliveryTimeId = 0;
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.updatedBy = this.userLoged.id;
        this.entity.isMainJob = true;
        this.entity.numberOfCont=this.entity.item.containers;
        this.entity.numberOfPackage=this.entity.item.cartons;
        this.entity.numberOfPallet=this.entity.item.pallets;
        this.entity.weight=this.entity.item.weight;
        this.entity.volume=this.entity.item.volume;
        let wfOtion: WorkflowJobOption[] = [];
        this.listJobGroupOption.forEach(element => {
          if (element.checked) {
            let item: WorkflowJobOption = {
              jobOptionName: element.jobGroupName,
              jobOptionId: element.id,
              workflowId: 0
            }
            wfOtion.push(item);
          }
        });
        this.entity.workflowJobOptions = wfOtion;
        this.workflowService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Update xong thì xóa hết entity đi để tạo mới
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.entity.id=undefined;
            this.entity.customerId=null;
            this.entity.jobId=null;
            this.entity.handlingGroupId=null;
            this.listGroup=null;
            this.entity.jobToughness=null;
            this.entity.estimatedStartTime=null;
            this.entity.estimatedFinishTime=null;
            this.entity.jobGroupId=null;
            this.listJobGroupOption=[];
            this.entity.item={};
            this.entity.jobDescription=null;
            this.entity.listHandlingGroupId=[];
            this.entity.workflowJobOptions=[];
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

  nhanviec() {
    const params = new HttpParams()
      .set('userId', this.userLoged.id)
      .set('id', this.entity.id.toString())
      .set('isReceiving', "1")
    this.busy = this.workflowService.setReceiving(params).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this.SaveSuccess.emit(true);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  remove() {
    this.workflowService.delete(this.entity.id, true).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this.notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
        this.SaveSuccess.emit(true);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
        this.flagSave = false;
      }
    }, () => {
      this.flagSave = false;
    });
  }
  attachFile() {
    
  }
  attack() {
    this.viewAttackFiles = true;
    let item: Attachfiles = {
      frmName: 'WORKFLOW',
      functionName: 'WORKFLOW',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, this.entity.createdBy!=this.userLoged.id);
    }, 50);
  }
  closeAttackModal() {
    this.viewAttackFiles = false;
  }
  closeMultiplyModal() {
    this.viewModalMultiply = false;
  }

  viewMultiply() {
    this.viewModalMultiply = true;
    setTimeout(() => {
      this.modalMultiply.edit(this.entity);
    }, 50);
  }
  saveSuccessMultiply(event: boolean) {
    if (!event) return
    this.modalAddEdit.hide();
    this.SaveSuccess.emit(true);
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
  selectedngayCutOff(event) {
    if (this.entity.closingTime == null)
      this.entity.closingTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedngayCutOff(event) {
    if (this.entity.closingTime == null)
      this.entity.closingTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selectedinquiryTimeToTheFactory(event) {
    this.entity.inquiryTimeToTheFactory = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedinquiryTimeToTheFactory(event) {
    if (this.entity.estimatedFinishTime == null)
      this.entity.inquiryTimeToTheFactory = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selectedinquiryTimeToThePorts(event) {
    this.entity.inquiryTimeToThePorts = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedinquiryTimeToThePorts(event) {
    if (this.entity.inquiryTimeToThePorts == null)
      this.entity.inquiryTimeToThePorts = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
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
  changedJobGroup(event: Jobgroup) {
    this.jobgroupId = event?.id;
    this.loadJobGroupOption();
  }
  toughessChanged(event: OtherCategories) {
    this.entity.jobToughnessName = event?.categoryName;
  }

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.customerCode = event.customerCode;
    this.customerName=event.customerName;
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

  getJobGroupOption(): void {
    this.entity.workflowJobOptions = [];
    let checks = this.listJobGroupOption.filter(x => x.checked);
    if (checks.length > 0) {
      checks.forEach(element => {
        let item: WorkflowJobOption = {
          workflowId: 0,
          jobOptionId: element.jobGroupId,
          jobOptionName: element.jobGroupName
        };
        this.entity.workflowJobOptions.push(item);
      });
    }
  }

  saveSuccessJobId(event: Shipment) {
    this.shipmentService.getDetail(event.id.toString()).subscribe((res: ResponseValue<Shipment>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity.item=res.data
        this.entity.workflowContSeals = res.data.shipmentContSeals;

    this.entity.jobId = event.jobId;
    this.entity.numberOfPallet = event.pallets??0;
    this.entity.volume = event.volume??0;
    this.entity.weight = event.weight??0;
    this.entity.numberOfCont = event.containers??0;
    this.entity.numberOfPackage = event.cartons??0;
    this.entity.placeOfDelivery = event.deliveryPlace + ' - ' + event.pickupPlace || '';
    if(event.pickupTime)this.entity.inquiryTimeToTheFactory = moment(event.pickupTime).format('MM/DD/YYYY HH:mm:ss');
    if(event.deliveryTime)this.entity.inquiryTimeToThePorts = moment(event.deliveryTime).format('MM/DD/YYYY HH:mm:ss');
    if(event.cutoffTime)this.entity.closingTime = moment(event.cutoffTime).format('MM/DD/YYYY HH:mm:ss');
    if (this.entity.closingTime) {
      this.ngayCutOff = this._utilityService.dateTimeOptionDays(
        new Date(moment(this.entity.closingTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
      );
      this.entity.closingTime = moment(this.entity.closingTime, FormatContstants.DATETIMEEN).format(
        FormatContstants.DATETIMEVN
      );
    }
    if (this.entity.inquiryTimeToTheFactory) {
      this.inquiryTimeToTheFactory = this._utilityService.dateTimeOptionDays(
        new Date(moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
      );
      this.entity.inquiryTimeToTheFactory = moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(
        FormatContstants.DATETIMEVN
      );
    }
    if (this.entity.inquiryTimeToThePorts) {
      this.inquiryTimeToThePorts = this._utilityService.dateTimeOptionDays(
        new Date(moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
      );
      this.entity.inquiryTimeToThePorts = moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(
        FormatContstants.DATETIMEVN
      );
    }
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
        return;
      }
    });
  }
  removeItem(i: number) {
    this.entity.workflowContSeals.splice(i, 1)
  }

  getJobId() {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalListShipment.view(this.entity.customerId, Number.parseInt(this.userLoged.branchId),0);
    }, 50);
  }
  showContSealDetail() {
    this._flagContSeal = !this._flagContSeal;
  }

  listJobGroupChanged(event: Jobgroupoption) {
    this.jobgroupId = event?.id;
    this.isTransport = event.id == environment.transportGroupId;
    this.jobName=event.jobGroupName;
    // if(this.customerName.length<1)return;
    var content="KH: " +this.customerName + "\nTên CV: " + this.jobName;
    if(this.entity.item.bookingNo) content+="\nBookingNo: " + this.entity.item.bookingNo;
    else content+="\nBookingNo: ";
    if(this.entity.item.invoiceNo) content+="\nInvoice: " + this.entity.item.invoiceNo;
    else content+="\nInvoice: ";
    if(this.entity.item.hawB_HBL) content+="\nSTK: " + this.entity.item.hawB_HBL;
    else content+="\nSTK: ";
    if(this.entity.item.containers) content+="\nSố lượng Cont: " + this.entity.item.containers.toString();
    else content+="\nSố lượng Cont: ";
    content+=+ "\nLoại cont: ";
    this.entity.jobDescription = content;
    this.loadJobGroupOption();
  }
  clickRow(item: Jobgroupoption): void {
    if (this.flagXem) return;
    item.checked = !item.checked;
    this.icheck();
  }
  icheck() {
    let checks = this.listJobGroupOption.filter(x => x.checked);
    if (checks.length > 0) {
      this.flagOption = true;
    }
    else {
      this.flagOption = false;
    }
  }

  editcheck(): void {
    this.entity.workflowJobOptions.forEach(item => {
      this.listJobGroupOption.forEach(obj => {
        if (item.jobOptionId == obj.id) obj.checked = true;
      });
    })
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
