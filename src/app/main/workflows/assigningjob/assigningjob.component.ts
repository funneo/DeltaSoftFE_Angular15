import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalGradeWorkflowComponent } from '@app/shared/components/workflows/modal-grade-workflow/modal-grade-workflow.component';
import { ModalOpmanAssigningWorkflowComponent } from '@app/shared/components/workflows/modal-opman-assigning-workflow/modal-opman-assigning-workflow.component';
import { ModalOpmanChangeWorkflowComponent } from '@app/shared/components/workflows/modal-opman-change-workflow/modal-opman-change-workflow.component';
import { ModalWorkflowImagesComponent } from '@app/shared/components/workflows/modal-workflow-images/modal-workflow-images.component';
import { ModalWorkflowComponent } from '@app/shared/components/workflows/modal-workflow/modal-workflow.component';
import { MessageContstants } from '@app/shared/constants';
import { listContants } from '@app/shared/constants/list-type.constants';
import { Pagination, Profile, ResponseValue, Workflow } from '@app/shared/models';
import { AuthService, NotificationService, UtilityService, WorkflowsService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assigningjob',
  templateUrl: './assigningjob.component.html',
  styleUrls: ['./assigningjob.component.css']
})
export class AssigningjobComponent implements OnInit {

  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  totalRowsGiaoviec=0;
  totalRowsHoanthanh=0;
  flagEdit = false;
  flagNhanviec = false;
  flagGiaoviec = false;
  flagHuyGiaoviec = false;
  flagHuyNhanviec = false;
  flagSelectItem = false;
  keyword = '';
  keywordGiaoviec='';
  keywordHoanthanh='';
  listNhanviec: Workflow[];
  listGiaoviec: Workflow[];
  listHoanthanh: Workflow[];
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  viewModalView = false;
  viewModalOpMan = false;
  viewGrade = false;
  viewImagePod = false;
  selectedType=0;
  listType=listContants.LIST_TYPEOF_FINISH_WORKFLOW;
  selectedTypeOp=0;
  selectedTypeOpView=0;
  selectedTypeOpViewReceiving=0;
  nhanviecDate= moment(new Date()).format('DD/MM/YYYY');
  giaoviecDate= moment(new Date()).format('DD/MM/YYYY');
  listTypeOp=listContants.LIST_TYPEOF_OP_WORKFLOW;
  listTypeView=listContants.LIST_TYPEOF_OP_VIEW;
  public flagLinkEdit: boolean = false;
  public ngayHientai:Date;
  public ngayHientaiGiaoviec:Date;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public ngayBatDauHoanthanh: Date = this._utilityService.ngayBanDau;
  public ngayKetThucHoanthanh: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  public dateSingleOptions= this._utilityService.dateTimeOptionDays(this.ngayBatDau, false);
  @ViewChild(ModalOpmanChangeWorkflowComponent, { static: false }) modalOpManChange: ModalOpmanChangeWorkflowComponent
  @ViewChild(ModalOpmanAssigningWorkflowComponent, { static: false }) modalOpManAssigning: ModalOpmanAssigningWorkflowComponent
  @ViewChild(ModalWorkflowComponent, { static: false }) modalAddEdit: ModalWorkflowComponent
  @ViewChild(ModalGradeWorkflowComponent, { static: false }) modalGrade: ModalGradeWorkflowComponent
  @ViewChild(ModalWorkflowImagesComponent, { static: false }) modalImagePod: ModalWorkflowImagesComponent

  constructor(private workflowService: WorkflowsService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    , private _authService: AuthService,private exportService:ExportService, private spinner:NgxSpinnerService
  ) { }


  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.ngayHientai=new Date();
    this.ngayBatDau = new Date(moment().subtract(7,'d').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.ngayBatDauHoanthanh = new Date(moment().subtract(7,'d').toString());
    this.ngayKetThucHoanthanh = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadNhanviec();
    this.loadGiaoviec();
    this.loadHoanthanh();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadGiaoviec();
  }

  
  selectedNhanviecDate(event) {
    this.ngayHientai = new Date(event.start);
    this.nhanviecDate= moment(this.ngayHientai).format('DD/MM/YYYY');
    this.loadGiaoviecByDelivery(0);
  }

  selectedGiaoviecDate(event) {
    this.ngayHientaiGiaoviec = new Date(event.start);
    this.giaoviecDate= moment(this.ngayHientaiGiaoviec).format('DD/MM/YYYY');
    this.loadGiaoviecByDelivery(1);
  }



  selectedDateHoanthanh(event) {
    this.ngayBatDauHoanthanh = new Date(event.start);
    this.ngayKetThucHoanthanh = new Date(event.end);
    this.loadHoanthanh();
  }

  loadNhanviec(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('userid', this.userLoged.id)
      .set('listHandlinggroupid', '1')
      .set('keyword',this.keyword)
    // .set('usergroupid')
    this.busy = this.workflowService.getReceiving(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listNhanviec = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.flagEdit = false;
        this.flagNhanviec = false;
        this.flagGiaoviec = false;
        this.flagHuyGiaoviec = false;
        this.flagHuyNhanviec = false;
        this.flagSelectItem = false;
      }
      else {
        if (res.code == '204') {
          this.listNhanviec = [];
          this.totalRows = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }
  loadGiaoviec(): void {
    this.spinner.show();
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('userid', this.userLoged.id)
      .set('isCs', "0")
      .set('isFinish', "0")
      // .set('isjobdone', "0")
      .set('isleader', "1")
      // .set('listid', '1')
      .set('type',this.selectedTypeOp.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keywordGiaoviec)
      .set('branchId',this.userLoged.branchId)
    // .set('usergroupid')
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listGiaoviec = res.data?.items;
        this.totalRowsGiaoviec = res.data?.totalRows;
        this.flagEdit = false;
        this.flagNhanviec = false;
        this.flagGiaoviec = false;
        this.flagHuyGiaoviec = false;
        this.flagHuyNhanviec = false;
        this.flagSelectItem = false;
        this.spinner.hide();
      }
      else {
        if (res.code == '204') {
          this.spinner.hide();
          this.listGiaoviec = [];
          this.totalRowsGiaoviec = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        this.spinner.hide();
      }
    });
  }
  loadGiaoviecByDelivery(type:number): void {
    this.spinner.show();
    let tuNgay =type==0? moment(this.ngayHientai).format('YYYYMMDD') :moment(this.ngayHientaiGiaoviec).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('userid', this.userLoged.id)
      //.set('type',this.selectedTypeOp.toString())
      .set('fromDate',tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keywordGiaoviec)
      .set('branchId',this.userLoged.branchId)
      .set('type',type.toString())
    // .set('usergroupid')
    this.busy = this.workflowService.getPagingByDelivery(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        if(type==1)
        {
          this.listGiaoviec = res.data?.items;
          this.totalRowsGiaoviec = res.data?.totalRows;
        }
        else  
        {
          this.listNhanviec= res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
          
        this.flagEdit = false;
        this.flagNhanviec = false;
        this.flagGiaoviec = false;
        this.flagHuyGiaoviec = false;
        this.flagHuyNhanviec = false;
        this.flagSelectItem = false;
        this.spinner.hide();
      }
      else {
        if (res.code == '204') {
          this.spinner.hide();
          this.listGiaoviec = [];
          this.totalRowsGiaoviec = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        this.spinner.hide();
      }
    });
  }
  loadHoanthanh(): void {
    let tuNgay = moment(this.ngayBatDauHoanthanh).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThucHoanthanh).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('userid', this.userLoged.id)
      .set('isCs', "0")
      .set('isFinish', "1")
      // .set('isjobdone', "0")
      .set('isleader', "1")
      // .set('listid', '1')
      .set('type',this.selectedType.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keywordHoanthanh)
      .set('branchId',this.userLoged.branchId)
    // .set('usergroupid')
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listHoanthanh = res.data?.items;
        this.totalRowsHoanthanh = res.data?.totalRows;
      }
      else {
        if (res.code == '204') {
          this.listHoanthanh = [];
          this.totalRowsHoanthanh = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }

  exportGiaoviec() {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', '1')
      .set('pageSize','9999')
      .set('userid', this.userLoged.id)
      .set('isCs', "0")
      .set('isFinish', "0")
      // .set('isjobdone', "0")
      .set('isleader', "1")
      // .set('listid', '1')
      .set('type',this.selectedTypeOp.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keywordGiaoviec)
      .set('branchId',this.userLoged.branchId)
    // .set('usergroupid')
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        let listPrint = res.data?.items;
        let printList= listPrint.map(({ csGradeByOp,opManGradeByCS,opManGradeByOp,isJobDone,jobGroupId,
          jobAssignedUserId,jobAssigningUserId,jobDoneTime,jobFinishTime,jobReceivingUserId,jobReceivingTime,jobToughness,jobToughnessName,createdBy,createdByTel,createdDate,deleted,
          opGradeByCS,opManEvaluationByCS,opManEvaluationByOp,opEvaluationByCS,csEvaluationByOp,branchId,totalRows,shipmentId
          ,updatedBy,updatedByFullName,updatedDate,listHandlingGroupId,listWorkflowAttackFiles,listWorkflowImages,listWorkflowPod
          ,...item }) => item);
         this.exportService.exportExcel(printList, 'danh-sach-giao-viec');
      }
      else {
        if (res.code == '204') {
          this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE + '\n' + res.code)
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
    
  }
  exportHoanthanh() {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', '1')
      .set('pageSize','9999')
      .set('userid', this.userLoged.id)
      .set('isCs', "0")
      .set('isFinish', "1")
      // .set('isjobdone', "0")
      .set('isleader', "1")
      // .set('listid', '1')
      .set('type',this.selectedTypeOp.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keywordGiaoviec)
      .set('branchId',this.userLoged.branchId)
    // .set('usergroupid')
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        let listPrint = res.data?.items;
        let printList= listPrint.map(({ csGradeByOp,opManGradeByCS,opManGradeByOp,isJobDone,jobGroupId,
          jobAssignedUserId,jobAssigningUserId,jobDoneTime,jobFinishTime,jobReceivingUserId,jobReceivingTime,jobToughness,jobToughnessName,createdBy,createdByTel,createdDate,deleted,
          opGradeByCS,opManEvaluationByCS,opManEvaluationByOp,opEvaluationByCS,csEvaluationByOp,branchId,totalRows,shipmentId
          ,updatedBy,updatedByFullName,updatedDate,listHandlingGroupId,listWorkflowAttackFiles,listWorkflowImages,listWorkflowPod
          ,...item }) => item);
         this.exportService.exportExcel(printList, 'danh-sach-congviec-hoanthanh');
      }
      else {
        if (res.code == '204') {
          this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE + '\n' + res.code)
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }

  chageType(event):void{
    this.selectedType=event.id;
    this.loadHoanthanh();
  }

  chageTypeOp(event):void{
    //Nếu là theo ngày tạo thì mới lọc theo phân việc hay chưa, còn không thì thôi
    if(this.selectedTypeOpView==0){
      this.selectedTypeOp=event.id;
      this.loadGiaoviec();
    }

  }
  chageTypeOpView(event):void{
    this.selectedTypeOpView=event.id;
    if(this.selectedTypeOpView==0){
      this.loadGiaoviec();
    }else this.loadGiaoviecByDelivery(1);
  }
  chageTypeOpViewReceiving(event):void{
    this.selectedTypeOpViewReceiving=event.id;
    if(this.selectedTypeOpViewReceiving==0)this.loadNhanviec()
      else this.loadGiaoviecByDelivery(0);
  }

  clickRowNhanviec(item: Workflow): void {
    item.checked = !item.checked;
    this.icheck();
  }
  clickRowGiaoviec(item: Workflow): void {
    item.checked = !item.checked;
    this.giaoviecCheck();
  }

  timKiemNhanviec(): void {
    this.pageIndex = 1;
    if(this.selectedTypeOpViewReceiving==0)this.loadNhanviec();
    else this.loadGiaoviecByDelivery(0);
  }
  timKiemGiaoviec(): void {
    this.pageIndex = 1;
    if(this.selectedTypeOpView==0)this.loadGiaoviec();
    else this.loadGiaoviecByDelivery(1);
  }
  timKiemHoanthanh(): void {
    this.pageIndex = 1;
    this.loadHoanthanh();
  }

  pageNhanviecChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadNhanviec();
  }
  pageGiaoviecChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadGiaoviec();
  }
  pageHoanthanhChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadHoanthanh();
  }


  edit(flag: boolean): void {
    const index = this.listNhanviec.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      //  this.modalAddEdit.edit(this.listWorkflow[index].id.toString(), flag);
    }, 0);
  }
  viewNhanviec(id: number): void {
    this.viewModalView = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id.toString(), true, true);
    }, 0);
  }
  viewGiaoviec(): void {
    const index = this.listGiaoviec.findIndex(x => x.checked);
    this.viewModalView = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listNhanviec[index].id.toString(), true, false);
    }, 50);
  }

  refresh(): void {
    window.location.reload();
  }

  upload(id: number) {
    this.viewImagePod = true;
    setTimeout(() => {
      this.modalImagePod.edit(id.toString(), true);
    }, 50);
  }
  grade(item: Workflow) {
    //if(item.jobGroupId==environment.transportGroupId)return;
    this.viewGrade = true;
    setTimeout(() => {
      this.modalGrade.edit(item.id, false);
    }, 50);
  }
  comment(id: number) {

  }

  checkHandlingGroup():boolean{
    let hS=0;
    let checks = this.listGiaoviec.filter(x => x.checked);
    let rVal = false;
    for (let index = 0; index < checks.length; index++) {
      if (hS>0) {
        if(hS!==checks[index].handlingGroupId){
          rVal=true;
          break;
        }
      }else{
        hS=checks[index].handlingGroupId;
      }
    }
    return rVal;
  }

  assigning(isassigning: boolean): void {
    const index = this.listGiaoviec.findIndex(x => x.checked);
    let checks = this.listGiaoviec.filter(x => x.checked);
    let listId = '';
    checks.forEach(element=>{
      listId=listId+element.id.toString() + ',';
    })
    if (isassigning) {
      if (this.checkHandlingGroup()){
        this.notificationService.printErrorMessage(MessageContstants.CHOOSE_SAME_HANDLINGGROUP);
      }else{
        this.viewModal=true;
        setTimeout(()=>{
          this.modalOpManAssigning.assigning(listId,checks[0].handlingGroupId)
        },50);
      }
    } else {
      const params = new HttpParams()
        .set('assigninguserid', this.userLoged.id)
        .set('assigneduserid', this.userLoged.id)
        .set('note', '')
        .set('listid', listId)
        .set('isAssigning', "0")
      this.workflowService.setAssigning(params).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.notificationService.printSuccessMessage(MessageContstants.CANCEL_ASSIGNING_OK_MSG);
          this.loadNhanviec();
          this.loadGiaoviec();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
    }

  }

  receiving(isReceiving: boolean): void {
    if (isReceiving) {
      this.listNhanviec.forEach(item => {
        if (item.checked) {
          const params = new HttpParams()
            .set('userId', this.userLoged.id)
            .set('id', item.id.toString())
            .set('isReceiving', "1")
          this.busy = this.workflowService.setReceiving(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
            if (res.code == '200' || res.code == '201') {
              this.loadNhanviec();
              this.loadGiaoviec();
            }
            else {
              this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
            }
          });
        }
      })
    } else {
      this.listGiaoviec.forEach(item => {
        if (item.checked) {
          const params = new HttpParams()
            .set('userId', this.userLoged.id)
            .set('id', item.id.toString())
            .set('isReceiving', "0")
          this.busy = this.workflowService.setReceiving(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
            if (res.code == '200' || res.code == '201') {
              this.loadNhanviec();
              this.loadGiaoviec();
            }
            else {
              this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
            }
          });
        }
      })
    }

  }

  checkAll(ev) {
    this.listNhanviec.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }
  checkAllGiaoviec(ev) {
    this.listGiaoviec.forEach(x => x.checked = ev.target.checked)
    this.giaoviecCheck();
  }
  isAllChecked() {
    if (this.listNhanviec)
      return this.listNhanviec.every(_ => _.checked);
  }
  isAllCheckedGiaoviec() {
    if (this.listGiaoviec)
      return this.listGiaoviec.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listNhanviec.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagNhanviec = true;
      this.flagEdit = true;
      this.flagSelectItem = true;
    }
    else if (checks.length > 1) {
      this.flagNhanviec = true;
      this.flagEdit = false;
      this.flagSelectItem = true;
    }
    else {
      this.flagNhanviec = false;
      this.flagEdit = false;
      this.flagSelectItem = false;
    }
  }
  giaoviecCheck(): void {
    let checks = this.listGiaoviec.filter(x => x.checked);
    if (checks.length > 0) {
      this.flagGiaoviec = true;
      this.flagHuyGiaoviec = true;
      this.flagHuyNhanviec = true;
      this.flagSelectItem = true;
      checks.forEach(element => {
        if (element.jobAssignedUserId != '00000000-0000-0000-0000-000000000000') {
          this.flagGiaoviec = false;
          this.flagHuyNhanviec = false;
        } else {
          this.flagHuyGiaoviec = false;
        }
      })
    } else {
      this.flagGiaoviec = false;
      this.flagHuyGiaoviec = false;
      this.flagHuyNhanviec = false;
      this.flagSelectItem = false;
    }
    this.flagEdit = checks.length == 1;
  }

  opmanchange(): void {
    const index = this.listGiaoviec.findIndex(x => x.checked);
    this.viewModalOpMan = true;
    setTimeout(() => {
      this.modalOpManChange.edit(this.listGiaoviec[index].id.toString());
    }, 50);
  }

  saveAssigningSuccess(): void {
    this.loadNhanviec();
    this.loadGiaoviec();
  }
  saveOpmanChangeSuccess(): void {
    this.loadNhanviec();
    this.loadGiaoviec();
  }
  saveSuccess(event: boolean): void {
    if (!event) return;
    this.loadNhanviec();
    this.loadGiaoviec();
  }
  gradeSuccess(event: Workflow): void {
    let index = this.listHoanthanh.findIndex(item => item.id == event.id);
    this.listHoanthanh[index] = event;
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeModalView(): void {
    this.viewModalView = false;
  }
  closeModalOpMan(): void {
    this.viewModalOpMan = false;
  }
  closeGradeModal(): void {
    this.viewGrade = false;
  }
  closeImagePodModal(): void {
    this.viewImagePod = false;
  }
}
