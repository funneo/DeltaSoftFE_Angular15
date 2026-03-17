import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalJobCanonComponent } from '@app/shared/components/canon/modal-job-canon/modal-job-canon.component';
import { ModalWorkflowCanonComponent } from '@app/shared/components/canon/modal-workflow-canon/modal-workflow-canon.component';
import { ModalOpenShipmentComponent } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.component';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { ModalWorkflowAttackFilesComponent } from '@app/shared/components/workflows/modal-workflow-attack-files/modal-workflow-attack-files.component';
import { ModalWorkflowAttackFilesModule } from '@app/shared/components/workflows/modal-workflow-attack-files/modal-workflow-attack-files.module';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Customer, OpenShipment, Pagination, PermissionCS, ResponseValue, Shipment, Workflow } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ShipmentService, NotificationService, UtilityService, CustomerService, OpenShipmentService, PermissionCSService, BranchService, AuthService, WorkflowsService } from '@app/shared/services';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workflow-canon',
  templateUrl: './workflow-canon.component.html',
  styleUrls: ['./workflow-canon.component.css']
})
export class WorkflowCanonComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: Workflow[];
  listCustomer:Customer[];
  customerId?: number;
  busy: Subscription;
  viewModal = false;
  viewOpenJob=false;
  listBranch:Branch[];
  _branchId:number;
  listPermissionCS: PermissionCS[];
  _auth=5;
  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalWorkflowCanonComponent, { static: false }) modalAddEdit: ModalWorkflowCanonComponent;
  @ViewChild(ModalJobCanonComponent, { static: false }) modalShipmentAddEdit: ModalJobCanonComponent;
  @ViewChild(ModalOpenShipmentComponent, { static: false }) modalOpenJob: ModalOpenShipmentComponent;
  @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttackFiles: ModalWorkflowAttackFilesComponent;
  constructor(private shipmentService: WorkflowsService, private notificationService: NotificationService, private _utilityService: UtilityService, private customerService:CustomerService,
   private openJobService: OpenShipmentService,permissionCSService: PermissionCSService,private router:Router,private branchService:BranchService, private authService: AuthService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
    this.listPermissionCS = permissionCSService.getPermissionCS();
   }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('CANON-PAYMENT');
    localStorage.removeItem('CANON-PAYMENT');
    if(p!=null){
      this.ngayBatDau =new Date(p.d1);
      this.ngayKetThuc =new Date(p.d2);
      this.customerId=p.customerId;
    }
    else{
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    }
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadChiNhanh()
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event:Customer){
    this.customerId=event?.id;
    this.timKiem();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    this.timKiem();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId',this._branchId?.toString());
      this.busy = this.shipmentService.getCanon(params).subscribe((res: ResponseValue<Pagination<Workflow>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: Workflow): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listData.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.shipmentService.delete(id,true).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  


  icheck() {
    let checks = this.listData.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true
      this.flagEdit = true
    }

    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showModal(item: Workflow) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }
  viewShipmentModal=false;
  showJobModal(id:number) {
    this.viewShipmentModal = true;
    setTimeout(() => {
      this.modalShipmentAddEdit.edit(id.toString(), true);
    }, 50);
  }

  showPayment(id:number,type:number): void {
    this.router.navigateByUrl('/main/advance-payment/payment/create/' +type.toString()+'/'+id.toString());
  }

  saveOpenJob(event: any): void {
    console.log(event);
  }

  closeOpenJob(): void {
    this.viewOpenJob = false;
  }


  viewAttackFiles:boolean;
  showFiles(job:Workflow){
    this.viewAttackFiles=true;
    setTimeout(() => {
      this.modalAttackFiles.edit(job,true);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttackFiles=false;
  }

}
