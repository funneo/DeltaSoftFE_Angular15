import { Component, OnInit, ViewChild } from '@angular/core';
import { Branch, Customer, Pagination, Profile, Shipment, Workflow } from '@app/shared/models';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { MessageContstants } from '@app/shared/constants';
import { CustomerService, NotificationService, ShipmentService, UtilityService, WorkflowsService, AuthService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { HttpParams } from '@angular/common/http';
import { ResponseValue } from '@app/shared/models';
import { ModalWorkflowComponent } from '@app/shared/components/workflows/modal-workflow/modal-workflow.component';
import { ModalGradeWorkflowComponent } from '@app/shared/components/workflows/modal-grade-workflow/modal-grade-workflow.component';
import { ModalWorkflowImagesComponent } from '@app/shared/components/workflows/modal-workflow-images/modal-workflow-images.component';
import { listContants } from '@app/shared/constants/list-type.constants';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  totalRowsFinish = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  keywordFinish = '';
  listWorkflow: Workflow[];
  listWorkflowFinish: Workflow[];
  listCustomer: Customer[];
  listBranch:Branch[]=[];
  customerId?: number;
  customerIdFinish?: number;
  branchId?:number;
  branchIdKetthuc?:number;
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  viewGrade: boolean = false;
  viewImagePod = false;
  selectedType=0;
  listType=listContants.LIST_TYPEOF_FINISH_WORKFLOW;
  selectedTypeCs=0;
  listTypeCs=listContants.LIST_TYPEOF_CS_WORKFLOW;
  adminPermission?:boolean=false;
  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public ngayBatDauFinish: Date = this._utilityService.ngayBanDau;
  public ngayKetThucFinish: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalWorkflowComponent, { static: false }) modalAddEdit: ModalWorkflowComponent
  @ViewChild(ModalGradeWorkflowComponent, { static: false }) modalGrade: ModalGradeWorkflowComponent
  @ViewChild(ModalWorkflowImagesComponent, { static: false }) modalImagePod: ModalWorkflowImagesComponent
  constructor(private workflowService: WorkflowsService,private spinner: NgxSpinnerService,
    private notificationService: NotificationService, private _utilityService: UtilityService, private customerService: CustomerService
    , private _authService: AuthService
    , private branchService:BranchService,
  ) { }


  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.branchIdKetthuc=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.ngayBatDau = new Date(moment().subtract(7,'d').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.ngayBatDauFinish = new Date(moment().subtract(7,'d').toString());
    this.ngayKetThucFinish = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadData();
    this.loadDataFinish();
    this.loadBranch();
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  selectedDateFinish(event) {
    this.ngayBatDauFinish = new Date(event.start);
    this.ngayKetThucFinish = new Date(event.end);
    this.loadDataFinish();
  }

  loadCustomer() {
    const params = new HttpParams()
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }
  changedBranchKetthuc(event:Branch){
    this.branchIdKetthuc=event?.id;
    this.loadDataFinish();
  }
  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.loadData();
  }

  changedCustomerFinish(event: Customer) {
    this.customerIdFinish = event?.id;
    this.loadDataFinish();
  }


  loadData(): void {
    this.spinner.show('spinner1');
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('isCs', "1")
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('userid', this.userLoged.id)
      .set('branchId', this.branchId?this.branchId.toString():'0')
      .set('handlinggroupid', '0')
      .set('isFinish', '0')
      // .set('usergroupid')
      .set('customerId', this.customerId?.toString())
      .set('keyword',this.keyword)
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listWorkflow = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.spinner.hide('spinner1');
      }
      else {
        if (res.code == '204') {
          this.listWorkflow = [];
          this.totalRows = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        this.spinner.hide('spinner1');
      }
    });
  }

  loadDataFinish(): void {
    this.spinner.show('spinner2');
    let tuNgay = moment(this.ngayBatDauFinish).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThucFinish).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('isCs', "1")
      .set('fromDate', tuNgay)
      .set('type',this.selectedType.toString())
      .set('toDate', denNgay)
      .set('userid', this.userLoged.id)
      .set('handlinggroupid', '0')
      .set('branchId', this.branchIdKetthuc?this.branchIdKetthuc.toString():'0')
      .set('isFinish', '1')
      .set('keyword',this.keywordFinish)
      // .set('usergroupid')
      .set('customerId', this.customerIdFinish?.toString())
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listWorkflowFinish = res.data?.items;
        this.totalRowsFinish = res.data?.totalRows;
        this.spinner.hide('spinner2');
      }
      else {
        this.spinner.hide('spinner2');
        if (res.code == '204') {
          this.listWorkflowFinish = [];
          this.totalRowsFinish = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }

  changedType(event):void{
    this.selectedType=event.id;
    this.loadDataFinish();
  }

  clickRow(item: Workflow): void {
    if (item.isDraft) return;   // dòng nháp xem qua nút "Xem nháp", không tick chọn/sửa thật
    item.checked = !item.checked;
    this.listWorkflow.forEach(it=>{
      if(it.id!=item.id)it.checked=false;
    })
    this.icheck();
  }

  // ============ NHÁP — REUSE modal-workflow thật (chế độ xem nháp) ============
  showDraft(item: Workflow): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.viewDraft(item.draftPayload, item.draftId);
    }, 50);
  }
  // Duyệt nháp xong → reload: dòng nháp biến mất, công việc thật hiện lên.
  onConfirmPromote(_draftId: number): void {
    this.loadData();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  timKiemFinish(): void {
    this.pageIndex = 1;
    this.loadDataFinish();
  }


  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  pageChangedFinish(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadDataFinish();
  }

  add(): void {
    let item:Workflow = {
      checked: false,
      status: 0,
      workflowJobOptions: []
    };
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(item,true);
    }, 50);
  }

  copy(item:Workflow): void {
    let copy = Object.assign({}, item);
    copy.status=0;
    copy.id=undefined;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(copy,false);
    }, 50);
  }


  edit(flag: boolean): void {
    const index = this.listWorkflow.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listWorkflow[index].id.toString(), flag || (this.userLoged.id != this.listWorkflow[index].createdBy), false);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listWorkflow.filter(x => x.checked);
    let item=listChecks[0];
    if(this.userLoged.id!=item.createdBy)return;
    if(item.status>0)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(item.id));
  }

  delete(id: number): void {
    this.workflowService.delete(id,true).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listWorkflow.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  icheck() {
    let checks = this.listWorkflow.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  grade(id: number) {
    this.viewGrade = true;
    setTimeout(() => {
      this.modalGrade.edit(id, true);
    }, 50);
  }
  viewimage(id: number) {
    this.viewImagePod = true;
    setTimeout(() => {
      this.modalImagePod.edit(id.toString(), false);
    }, 50);
  }

  saveSuccess(): void {
    this.loadData();
  }

  gradeSuccess(event:Workflow): void {
    let index=this.listWorkflowFinish.findIndex(item=>item.id==event.id);
    this.listWorkflowFinish[index]=event;
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeGradeModal(): void {
    this.viewGrade = false;
  }
  closeImagePodModal(): void {
    this.viewImagePod = false;
  }
}
