import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalOpWorkflowComponent } from '@app/shared/components/workflows/modal-op-workflow/modal-op-workflow.component';
import { ModalViewWorkflowsComponent } from '@app/shared/components/workflows/modal-view-workflows/modal-view-workflows.component';
import { ModalWorkflowAttackFilesComponent } from '@app/shared/components/workflows/modal-workflow-attack-files/modal-workflow-attack-files.component';
import { MessageContstants } from '@app/shared/constants';
import { Customer, Pagination, Profile, ResponseValue, Workflow } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AuthService, CustomerService, NotificationService, UtilityService, WorkflowsService } from '@app/shared/services';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assignedjob',
  templateUrl: './assignedjob.component.html',
  styleUrls: ['./assignedjob.component.css']
})
export class AssignedjobComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  totalRowsHT=0;
  flagEdit = false;
  keyword = '';
  keywordHT= '';
  listCongviec: Workflow[];
  listHoanthanh: Workflow[];
  userLoged?: Profile;
  busy: Subscription;
  isPayment = true;
  viewModalWorkflows=false;
  viewOpAction=false;
  adminPermission?:boolean=false;
  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalOpWorkflowComponent, { static: false }) modalOpAction: ModalOpWorkflowComponent
  @ViewChild(ModalViewWorkflowsComponent, { static: false }) modalViewWorkflows: ModalViewWorkflowsComponent
  @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttachFiles: ModalWorkflowAttackFilesComponent

  constructor(private workflowService: WorkflowsService,
    private notificationService: NotificationService, private _utilityService: UtilityService, private customerService: CustomerService
    , private _authService: AuthService,private router:Router,
  ) { }


  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.ngayBatDau = new Date(moment().subtract(7,'d').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    
    this.isPayment = this._authService.hasPermission('PAYMENT_CREATE');
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadHoanthanh();
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadHoanthanh();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('isCs', "0")
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('userid', this.userLoged.id)
      .set('isFinish', "0")
      .set('keyword',this.keyword)
      .set('isleader', "0")
      .set('branchId', "0")
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCongviec = res.data?.items;
        console.log(this.listCongviec);
        
        this.totalRows = res.data?.totalRows;
      }
      else {
        if (res.code == '204') {
          this.listCongviec = [];
          this.totalRows=0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }

  loadHoanthanh(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('isCs', "0")
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('userid', this.userLoged.id)
      .set('isFinish', "1")
      .set('isleader', "0")
      .set('branchId', "0")
      .set('keyword',this.keywordHT)
    this.busy = this.workflowService.getPaging(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listHoanthanh = res.data?.items;
        this.totalRowsHT = res.data?.totalRows;
      }
      else {
        if (res.code == '204') {
          this.listHoanthanh = [];
          this.totalRowsHT=0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }
  viewAttackFiles:boolean;
  showFiles(job:Workflow){
    this.viewAttackFiles=true;
    setTimeout(() => {
      this.modalAttachFiles.edit(job,true);
    }, 50);
  }
  closeAttackModal() {
    this.viewAttackFiles = false;
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  timKiemHoanthanh(): void {
    this.pageIndex = 1;
    this.loadHoanthanh();
  }

  viewNhanviec(id:number):void{
    this.viewModalWorkflows = true;
    setTimeout(() => {
      this.modalViewWorkflows.edit(id.toString());
    }, 0);
  }

  procedure(item:Workflow){
    if(item.jobGroupId==environment.transportGroupId)return;
    this.viewOpAction = true;
    setTimeout(() => {
      this.modalOpAction.edit(item.id.toString());
    }, 50);
  }
  comment(id: number) {


  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  pageHoanthanhChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadHoanthanh();
  }


  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewOpAction = false;
    this.loadData();
  }

  showPayment(id:number,type:number): void {
    this.router.navigateByUrl('/main/advance-payment/payment/create/' +type.toString()+'/'+id.toString());
  }
}
