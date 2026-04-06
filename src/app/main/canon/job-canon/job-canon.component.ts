import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Shipment, Pagination, Customer, ResponseValue, OpenShipment, Branch, PermissionCS } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, NotificationService, OpenShipmentService, PermissionCSService, ShipmentService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalOpenShipmentComponent } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { Router } from '@angular/router';
import { ModalJobCanonComponent } from '@app/shared/components/canon/modal-job-canon/modal-job-canon.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-job-canon',
  templateUrl: './job-canon.component.html',
  styleUrls: ['./job-canon.component.css']
})
export class JobCanonComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listShipment: Shipment[];
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
  @ViewChild(ModalJobCanonComponent, { static: false }) modalAddEdit: ModalJobCanonComponent;
  @ViewChild(ModalOpenShipmentComponent, { static: false }) modalOpenJob: ModalOpenShipmentComponent;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  constructor(private shipmentService: ShipmentService, private notificationService: NotificationService, private _utilityService: UtilityService, private customerService:CustomerService,
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
      .set('customerId',this.customerId?.toString())
      .set('shipmentType','0')
      .set('branchId',this._branchId?.toString());
      this.busy = this.shipmentService.getPaging(params).subscribe((res: ResponseValue<Pagination<Shipment>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listShipment = res.data?.items;
          this.totalRows = res.data?.totalRows;
          this.listShipment.forEach(x=>{
            if(this.listPermissionCS.findIndex(z=>z.customerId==x.customerId && z.isOpenJob)!=-1){
              x.accept=true;
            }
           });
           this.listShipment=[...this.listShipment];
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: Shipment): void {
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
    const index = this.listShipment.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listShipment[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listShipment.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.shipmentService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  closeJob(job: Shipment, b:boolean): void {
    this.notificationService.printConfirmationDialog(MessageContstants.CLOSE_JOB, () =>
    {
      this.shipmentService.closeJob(job.id,b).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
        else {
          this.notificationService.printErrorMessage('Lỗi khi khóa lô hàng!' + '\n' + res.code)
        }
      });
    }
    );
  }

  checkAll(ev) {
    this.listShipment.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listShipment)
      return this.listShipment.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listShipment.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = !checks[0].isFinish;;
      this.flagEdit = !checks[0].isFinish;
    }
    // else if (checks.length > 1) {
    //   this.flagDelete = true;
    //   this.flagEdit = false;
    // }
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

  showModal(item: Shipment) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  showOpenJob(event:Shipment): void {
    const params = new HttpParams()
      .set('shipmentId', event.id?.toString())
      .set('customerId',event.customerId?.toString())
      this.busy = this.openJobService.getAll(params).subscribe((res: ResponseValue<OpenShipment[]>) => {
        let list=res.data?.filter(x=>x.status && x.step==0)
       if(list.length>0){
        this.notificationService.printErrorMessage('Đã có yêu cầu mở đang chờ duyệt!' + '\n' + list[0].notes)
       }
       else{
        this.viewOpenJob = true;
        let item: any = {
          shipmentId:event.id,
          jobId:event.jobId,
          customerId:event.customerId,
          notes:event.notes
        };
        setTimeout(() => {
          this.modalOpenJob.add(item);
        }, 50);
       }
      });
  }

  saveOpenJob(event: any): void {
    console.log(event);
  }

  closeOpenJob(): void {
    this.viewOpenJob = false;
  }

  copyJobConfirm(item: Shipment): void {
    this.notificationService.printConfirmationDialog('Bạn muốn sao chép lô hàng mới?', () => this.copyJob(item.id?.toString()));
  }

  copyJob(id:string):void{
    this.shipmentService.copy(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage('Lỗi khi copy lô hàng!' + '\n' + res.code)
      }
    });
  }

  viewAttachFiles:boolean;
  showFiles(job:Shipment){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'SHIPMENT',
      functionName:'SHIPMENT',
      refNo: job.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttachFiles=false;
  }

  showPayment(id:number,type:number): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId: this.customerId
    }
    UtilityService.setLocalParams(p,'CANON-PAYMENT');
    this.router.navigateByUrl('/main/advance-payment/payment/create/' +type.toString()+'/'+id.toString());
  }

}
