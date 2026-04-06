import { HttpParams, HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Shipment, Pagination, Customer, ResponseValue, OpenShipment, Branch, CanonRoad } from '@app/shared/models';
import { AuthService, BranchService, CanonRoadService, CustomerService, NotificationService, OpenShipmentService, ShipmentService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalOpenShipmentComponent } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { Router } from '@angular/router';
import { ModalJobCanonComponent } from '@app/shared/components/canon/modal-job-canon/modal-job-canon.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'app-debit-canon',
  templateUrl: './debit-canon.component.html',
  styleUrls: ['./debit-canon.component.css']
})
export class DebitCanonComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listShipment: Shipment[] = [];
  listCustomer: Customer[] = [];
  _customerId?: number;
  busy: Subscription;
  viewModal = false;
  viewOpenJob = false;
  listBranch: Branch[] = [];
  _branchId: number;
  _isAdmin = false;
  listTrucking: any[] = [{ id: 0, text: 'Tất cả' }, { id: 1, text: 'Đã vận chuyển' }];
  _trucking = 0;
  listRoad: CanonRoad[] = [];
  _cungDuong: string;

  listVAT: any[] = [
    { id: 10, text: '10' },
    { id: 9, text: '9' },
    { id: 8, text: '8' },
    { id: 7, text: '7' },
    { id: 6, text: '6' },
    { id: 5, text: '5' },
    { id: 0, text: '0' },
  ];
  _vat = 8;

  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalJobCanonComponent, { static: false }) modalAddEdit: ModalJobCanonComponent;
  @ViewChild(ModalOpenShipmentComponent, { static: false }) modalOpenJob: ModalOpenShipmentComponent;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  constructor(private shipmentService: ShipmentService, private notificationService: NotificationService, private _utilityService: UtilityService, private customerService: CustomerService,
    private http: HttpClient, private router: Router, private branchService: BranchService, private authService: AuthService, private canonRoadService: CanonRoadService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._isAdmin = user.isAdmin;
  }

  getVAT(): Observable<any> {
    return this.http.get("./assets/data/vat.json");
  }

  ngOnInit(): void {
    this.getVAT().subscribe(data => {
      if (data) {
        this.listVAT = data?.list;
        let i = this.listVAT.findIndex(x => x.status);
        if (i > -1) this._vat = this.listVAT[i].id;
      }
    });
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());

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

  changedCustomer(event: Customer) {
    this._customerId = event?.id;
    this.timKiem();
    this.loadRoad();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    this.timKiem();
  }

  loadRoad(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId?.toString());
    this.canonRoadService.getAll(params).subscribe((res: ResponseValue<CanonRoad[]>) => {
      this.listRoad = res.data;
    });
  }

  changedRoad() {
    this.timKiem();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('roadCode', this._cungDuong)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('shipmentType', this._trucking?.toString())
      .set('branchId', this._branchId?.toString());
    this.busy = this.shipmentService.getJobCanon(params).subscribe((res: ResponseValue<Pagination<Shipment>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listShipment = res.data?.items;
        this.totalRows = res.data?.totalRows;
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



  debitConfirm(): void {
    let listChecks = this.listShipment.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog('Bạn muốn tạo Debit cho các lô hàng đã chọn?', () => this.debit(checks.join(',')));
  }

  debit(listId: string): void {
    const params = new HttpParams()
      .set('vat', this._vat?.toString())
      .set('listId', listId)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString());
    this.shipmentService.createDebitCanon(params).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
        this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG)
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code)
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
  }

  showModal(item: Shipment) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }


}
