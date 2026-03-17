import { ModalAttachfileComponent } from './../../systems/modal-attachfile/modal-attachfile.component';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Customer, Handlinggroup, OtherCategories, ResponseValue, Shipment, Workflow, WorkflowJobOption } from '@app/shared/models';
import { Jobgroup } from '@app/shared/models/jobgroup';
import { Jobgroupoption } from '@app/shared/models/jobgroupoption';
import { AuthService, CustomerService, HandlinggroupService, NotificationService, OtherCategoriesService, ShipmentService, UtilityService, WorkflowsService } from '@app/shared/services';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { JobgroupoptionService } from '@app/shared/services/jobgroupoption.service';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalWorkflowAttackFilesComponent } from '../modal-workflow-attack-files/modal-workflow-attack-files.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-view-workflows',
  templateUrl: './modal-view-workflows.component.html',
  styleUrls: ['./modal-view-workflows.component.css']
})
export class ModalViewWorkflowsComponent implements OnInit {
  public entity:Workflow;
  public listToughness:OtherCategories[];
  public listCustomer:Customer[];
  public listHandlingGroup:Handlinggroup[];
  public listJobGroup:Jobgroup[];
  public listJobGroupOption:Jobgroupoption[];
  public handlingGroupId?:number;
  listShipmentType: OtherCategories[];
  listContTypes: OtherCategories[];
  listImportExports: OtherCategories[];
  public customerId?:number;
  public customerCode?:string;
  public jobgroupId?:number;
  public busy: Subscription;
  viewAttackFiles=false;
  _flagContSeal = false;

  @ViewChild('modalViewWorkflows', { static: false }) modalViewWorkflows: ModalDirective;
  // @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttachFiles: ModalWorkflowAttackFilesComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  constructor(private notificationService: NotificationService,private jobGroupService:JobgroupService,private jobGroupOptionService:JobgroupoptionService
,private handlingGroupService:HandlinggroupService, private customerService:CustomerService
,private workflowService:WorkflowsService
,private otherCategoryService:OtherCategoriesService
,private otherService:OtherCategoriesService
  ) { }

  ngOnInit(): void {
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

  loadCustomer():void{
    const params = new HttpParams()
    this.busy = this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data
      }
    });
  }

  loadToughness():void{
    const params = new HttpParams()
    .set('type', 'TOUGH')
  this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
    if (res.code == '200' || res.code == '201') {
      this.listToughness = res.data;
    }
    else {if(res.code=="204"){
      this.listToughness =[];
    }else{
      this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
    }}
  });
  }

  loadHandlingGroup():void{
  this.busy = this.handlingGroupService.getAll().subscribe((res: ResponseValue<Handlinggroup[]>) => {
    if (res.code == '200' || res.code == '201') {
      this.listHandlingGroup = res.data;
    }
    else {if(res.code=="204"){
      this.listHandlingGroup =[];
    }else{
      this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
    }}
  });
  }

  loadJobGroup(): void {
    const params = new HttpParams()
      this.busy = this.jobGroupService.getAll().subscribe((res: ResponseValue<Jobgroup[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listJobGroup = res.data
        }else {if(res.code=="204"){
          this.listJobGroup =[];
        }else{
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }}
      });
  }
  
  loadJobGroupOption() {
    if(this.jobgroupId==null)return;
    const params = new HttpParams()
      .set('jobGroupId', this.jobgroupId.toString())
      .set('includeProcedure', "0")
    this.busy = this.jobGroupOptionService.getByJobGroup(params).subscribe((res: ResponseValue<Jobgroupoption[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listJobGroupOption = res.data
        this.editcheck();
      }else {if(res.code=="204"){
        this.listJobGroupOption =[];
      }else{
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }
  showContSealDetail() {
    this._flagContSeal = !this._flagContSeal;
  }

  edit(id: string) {
    this.workflowService.getDetail(id).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.jobgroupId=this.entity.jobGroupId;
        this.customerId=this.entity.customerId;
        this.customerCode=this.entity.customerCode;
        this.loadJobGroupOption();
        this.modalViewWorkflows.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  changedJobGroup(event:Jobgroup){
    this.jobgroupId=event?.id;
    this.loadJobGroupOption();
  }
  toughessChanged(event:OtherCategories){
    this.entity.jobToughnessName=event?.categoryName;
  }

  editcheck():void {
    this.entity.workflowJobOptions.forEach(item=>
      {
        this.listJobGroupOption.forEach(obj=>{
        if(item.jobOptionId==obj.id) obj.checked=true;
      });
    }) 
   }
  getJobGroupOption():void{
    this.entity.workflowJobOptions=[];
    let checks = this.listJobGroupOption.filter(x => x.checked);
  if (checks.length > 0) {
      checks.forEach(element => {
        let item: WorkflowJobOption={
          workflowId: 0,
          jobOptionId: element.jobGroupId,
          jobOptionName:element.jobGroupName
        };
        this.entity.workflowJobOptions.push(item);
      });
    }
  }

  listJobGroupChanged(event:Jobgroupoption){
    this.jobgroupId=event?.id;
    this.loadJobGroupOption();
  }

  attack(){
    this.viewAttackFiles = true;
    let item: Attachfiles = {
      frmName: 'WORKFLOW',
      functionName: 'WORKFLOW',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, true);
    }, 50);
  }

  closeAttackModal(){
    this.viewAttackFiles=false;
  }
}
