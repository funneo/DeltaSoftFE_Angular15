import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Shipment, Pagination, Customer, ResponseValue, OpenShipment, PermissionCS, Branch } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, NotificationService, OpenShipmentService, PermissionCSService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalOpenShipmentComponent } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-open-shipment',
  templateUrl: './open-shipment.component.html',
  styleUrls: ['./open-shipment.component.css']
})
export class OpenShipmentComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listOpenShipment: OpenShipment[];
  listFilter: OpenShipment[];
  listCustomer:Customer[];
  customerId?: number;
  busy: Subscription;
  viewModal = false;
  viewOpenJob=false;
  listPermissionCS: PermissionCS[];
  listBranch:Branch[];
  _branchId:number;
  _auth=3;


  tenkhSearch:string='';
  jobidSearch:string='';
  ngaySearch:string='';
  nguoiSearch:string='';
  lydoSearch:string='';

  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listTrangThai: any[]=[{id:-1, text:'Từ chối'},{id: 0, text: 'Chờ duyệt'},{id: 1,text:'Đã duyệt'}];
  listLabelTrangThai: any[]=[{id:-1, text:'label label-danger'},{id: 0, text: 'label label-info'},{id: 1,text:'label label-success'}]
  @ViewChild(ModalOpenShipmentComponent, { static: false }) modalAddEdit: ModalOpenShipmentComponent
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService, private customerService:CustomerService, private _export:ExportService,public datepipe: DatePipe,
   private openJobService: OpenShipmentService, permissionCSService: PermissionCSService,private branchService: BranchService, private authService: AuthService) {
    this.listPermissionCS = permissionCSService.getPermissionCS();
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
   }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadChiNhanh();
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

  exportExcel(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId',this.customerId?.toString())
      .set('branchId',this._branchId?.toString());
      this.busy = this.openJobService.export(params).subscribe((res: ResponseValue<Pagination<OpenShipment>>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res.data?.items;
          let printList= listData.map(({ id,branchId,employeeId,customerId,step,createdBy,updatedBy,updatedDate,status, ...item }) => item);
          this._export.exportExcel(printList,'tong-hop-mo-debit');
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    console.log(tuNgay);
    console.log(denNgay);
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId',this.customerId?.toString())
      .set('branchId',this._branchId?.toString());
      this.busy = this.openJobService.getPaging(params).subscribe((res: ResponseValue<Pagination<OpenShipment>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listOpenShipment = res.data?.items;
          this.totalRows = res.data?.totalRows;
          this.totalRows = res.data?.totalRows;
          this.listOpenShipment.forEach(x=>{
           if(this.listPermissionCS.findIndex(z=>z.customerId==x.customerId && z.isOpenJob)!=-1){
             x.accept=true;
           }
          });
          this.listOpenShipment=[...this.listOpenShipment];
          console.log(this.listOpenShipment);

          this.filter();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  filter(){
    this.listFilter = Object.assign([], this.listOpenShipment);
    if(this.tenkhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if(this.jobidSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.jobId?.toLowerCase().includes(this.jobidSearch.trim().toLocaleLowerCase());
    });
    if(this.nguoiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoiSearch.trim().toLocaleLowerCase());
    });
    if(this.lydoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.lydoSearch.trim().toLocaleLowerCase());
    });
  }

  clickRow(item: Shipment): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  edit(flag: boolean): void {
    const index = this.listOpenShipment.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listOpenShipment[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listOpenShipment.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.openJobService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listOpenShipment.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listOpenShipment)
      return this.listOpenShipment.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listOpenShipment.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = checks[0].step<=0? true:false;
      this.flagEdit = checks[0].step<=0? true:false;;
    }
    else if (checks.length > 1) {
      this.flagDelete = checks.findIndex(x=>x.step>0)==-1?true:false;
      this.flagEdit = false;
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

  showModal(item: OpenShipment) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  accept(item: OpenShipment, b: boolean){
    let emtity={
      id: item.id,
      shipmentId:item.shipmentId,
      feedback:item.feedback,
      step: b?1:-1
    }
    this.openJobService.accept(emtity).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + '\n' + res.code)
      }
    });
  }
}
