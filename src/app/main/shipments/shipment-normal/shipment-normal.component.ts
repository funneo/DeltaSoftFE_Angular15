import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalOpenShipmentComponent } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.component';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, OpenShipment, OtherCategories, Pagination, PermissionCS, ResponseValue, Shipment } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AuthService, BranchService, CustomerService, NotificationService, OpenShipmentService, OtherCategoriesService, PermissionCSService, ShipmentService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shipment-normal',
  templateUrl: './shipment-normal.component.html',
  styleUrls: ['./shipment-normal.component.css']
})
export class ShipmentNormalComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listShipment: Shipment[];
  listFilter: Shipment[];
  listCustomer: Customer[];
  customerId?: number;
  busy: Subscription;
  viewModal = false;
  viewOpenJob = false;
  listBranch: Branch[];
  _branchId: number;
  _auth = 3;
  listPermissionCS: PermissionCS[];
  // listTrangThai:any[]=[{id:1,text:'Đã Debit'},{id:0,text:'Chưa Debit'},{id:2,text:'Tất cả'}];
  // _trangThai=2;
  listShipmentType: any[];
  // _type:string;
  makhSearch?: string;
  tenkhSearch?: string;
  jobidSearch?: string;
  loahinhSearch?: string;
  tokhaiSearch?: string;
  invoiceSearch?: string;
  hbillSearch?: string;
  mbillSearch?: string;
  sobookingSearch?: string;
  contnoSearch?: string;
  ghichuSearch?: string;
  nguoilapSearch?: string;
  luonghangSearch = '';
  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalShipmentComponent, { static: false }) modalAddEdit: ModalShipmentComponent;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalOpenShipmentComponent, { static: false }) modalOpenJob: ModalOpenShipmentComponent;
  constructor(private shipmentService: ShipmentService, private notificationService: NotificationService, private spinner: NgxSpinnerService,
    private _utilityService: UtilityService, private customerService: CustomerService, private _export: ExportService,
    private openJobService: OpenShipmentService, permissionCSService: PermissionCSService, private router: Router,
    private branchService: BranchService, private authService: AuthService, private otherCategoriesService: OtherCategoriesService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
    this.listPermissionCS = permissionCSService.getPermissionCS();
  }

  ngOnInit(): void {
    var p = UtilityService.getLocalParams('SHIPMENT-PAYMENT');
    localStorage.removeItem('SHIPMENT-PAYMENT');
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this.customerId = p.customerId;
      this.keyword = p.keyword;
    }
    else {
      this.ngayBatDau = new Date(moment().subtract(7, 'd').toString());
      this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    }
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadChiNhanh();
    this.loadOtherCategory();
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

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.timKiem();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'SHIPMENT_T02');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listShipmentType = [];
      res.data.forEach(x => this.listShipmentType.push({ id: x.id.toString(), text: x.categoryCode, name: x.categoryName }));
    });
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '99999')
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this.customerId?.toString())
      .set('branchId', this._branchId?.toString());
    this.busy = this.shipmentService.getPagingNormal(params).subscribe((res: ResponseValue<Pagination<Shipment>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listShipment = res.data?.items;
        this.totalRows = this.listShipment?.length;
        this.listShipment.forEach(x => {
          if (this.listPermissionCS.findIndex(z => z.customerId == x.customerId && z.isOpenJob) != -1) {
            x.accept = true;
          }
        });
        this.listShipment = [...this.listShipment];
        this.spinner.hide();
        this.filter();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        this.spinner.hide();
      }
    });
  }

  exportExcel() {
    this._export.exportExcel(this.listFilter, 'lo-hang')
  }

  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  filter() {
    this.listFilter = Object.assign([], this.listShipment);
    if (this.makhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerCode.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if (this.tenkhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName?.toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if (this.jobidSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId?.toLowerCase().includes(this.jobidSearch.trim().toLocaleLowerCase());
      });
    if (this.mbillSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.mawB_MBL?.toLowerCase().includes(this.mbillSearch.trim().toLocaleLowerCase());
      });
    if (this.loahinhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.shipmentTypeName?.toLowerCase().includes(this.loahinhSearch.trim().toLocaleLowerCase());
      });
    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.hbillSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL?.toLowerCase().includes(this.hbillSearch.trim().toLocaleLowerCase());
      });
    if (this.sobookingSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo?.toLowerCase().includes(this.sobookingSearch.trim().toLocaleLowerCase());
      });
    if (this.invoiceSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo?.toLowerCase().includes(this.invoiceSearch.trim().toLocaleLowerCase());
      });
    if (this.contnoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.conts?.toLowerCase().includes(this.contnoSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
    if (this.luonghangSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.weight?.toString().includes(this.luonghangSearch.trim().toLocaleLowerCase());
      });
    this.totalRows = this.listFilter?.length;
  }

  clickRow(item: Shipment): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
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
    //Load lại dữ liệu đề phòng trường hợp lưu và thêm mới
    //this.loadData();
  }

  showModal(item: Shipment) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  copyJobConfirm(item: Shipment): void {
    this.notificationService.printConfirmationDialog('Bạn muốn sao chép lô hàng mới?', () => this.copyJob(item.id?.toString()));
  }

  copyJob(id: string): void {
    this.shipmentService.copy(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage('Lỗi khi copy lô hàng!' + '\n' + res.code)
      }
    });
  }

  viewAttachFiles: boolean;
  showFiles(job: Shipment) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'SHIPMENT',
      functionName: 'SHIPMENT',
      refNo: job.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }

  showPayment(id: number, type: number): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId: this.customerId,
      keyword: this.keyword
    }
    UtilityService.setLocalParams(p, 'SHIPMENT-PAYMENT');
    this.router.navigateByUrl('/main/advance-payment/payment/create/' + type.toString() + '/' + id.toString());
  }

  closeJob(job: Shipment, b: boolean): void {
    this.notificationService.printConfirmationDialog(MessageContstants.CLOSE_JOB, () => {
      this.shipmentService.closeJob(job.id, b).subscribe((res: ResponseValue<any>) => {
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
  showOpenJob(event: Shipment): void {
    const params = new HttpParams()
      .set('shipmentId', event.id?.toString())
      .set('customerId', event.customerId?.toString())
    this.busy = this.openJobService.getAll(params).subscribe((res: ResponseValue<OpenShipment[]>) => {
      let list = res.data?.filter(x => x.status && x.step == 0)
      if (list.length > 0) {
        this.notificationService.printErrorMessage('Đã có yêu cầu mở đang chờ duyệt!' + '\n' + list[0].notes)
      }
      else {
        this.viewOpenJob = true;
        let item: any = {
          shipmentId: event.id,
          jobId: event.jobId,
          customerId: event.customerId,
          notes: event.notes
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

}
