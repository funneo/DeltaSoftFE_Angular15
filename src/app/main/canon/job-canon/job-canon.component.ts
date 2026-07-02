import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Shipment, Pagination, Customer, ResponseValue, OpenShipment, Branch, PermissionCS } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, NotificationService, OpenShipmentService, PermissionCSService, ShipmentService, UtilityService } from '@app/shared/services';
import { DraftService, DraftEntryView } from '@app/shared/services/draft.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  listShipment: Shipment[];        // toàn bộ data đã load
  listFilter: Shipment[];          // sau khi áp dụng filter cột
  listCustomer:Customer[];
  customerId?: number;

  // Filter theo cột (nhập vào dòng dưới header)
  tenkhSearch?: string;
  jobidSearch?: string;
  xeSearch?: string;
  lotSearch?: string;
  cungduongSearch?: string;
  palletsSearch?: string;
  ghichuSearch?: string;
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
   private openJobService: OpenShipmentService,permissionCSService: PermissionCSService,private router:Router,private branchService:BranchService, private authService: AuthService,
   private draftService: DraftService) {
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
    // BE SP_Shipment_GetPaging hiện trả ALL rows (OFFSET/FETCH bị comment) → FE phải paging client-side.
    const params = new HttpParams()
      .set('pageIndex', '1')
      .set('pageSize', '99999')
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this.customerId?.toString())
      .set('shipmentType', '0')
      .set('branchId', this._branchId?.toString());

    const draftFilter = {
      draftType: 'Shipment',
      shipmentType: 1176, // CHỈ Canon
      keyword: this.keyword,
      fromDate: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      toDate: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      branchId: this._branchId || null, // lọc nháp theo chi nhánh đang chọn (NULL=tất cả)
      pageIndex: 1,
      pageSize: 99999,
    };

    this.busy = forkJoin({
      erp: this.shipmentService.getPaging(params),
      draft: this.draftService.getPagingForErp(draftFilter).pipe(catchError(() => of({ code: '200', data: [] } as any))),
    }).subscribe((res: any) => {
      if (res.erp?.code == '200' || res.erp?.code == '201') {
        const erpItems: Shipment[] = res.erp.data?.items ?? [];
        erpItems.forEach(x => {
          if (this.listPermissionCS.findIndex(z => z.customerId == x.customerId && z.isOpenJob) != -1) {
            x.accept = true;
          }
        });

        const draftOk = res.draft?.code == '200' || res.draft?.code == '201';
        const draftItems: DraftEntryView[] = (draftOk && Array.isArray(res.draft?.data)) ? res.draft.data : [];
        const draftRows: Shipment[] = draftItems
          .filter(d => d.draftType === 'Shipment')
          .map(d => this.mapDraftToShipmentRow(d))
          .filter(r => (r as any).shipmentType === 1176);

        this.listShipment = [...draftRows, ...erpItems];
        this.pageIndex = 1; // reset về page đầu sau khi tải
        this.filter();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.erp?.code);
      }
    });
  }

  filter(): void {
    this.listFilter = Object.assign([], this.listShipment);
    const norm = (s: any) => (s ?? '').toString().toLowerCase();
    if (this.tenkhSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.customerName).includes(this.tenkhSearch.trim().toLowerCase()));
    if (this.jobidSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.jobId).includes(this.jobidSearch.trim().toLowerCase()));
    if (this.xeSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.cdsNumber).includes(this.xeSearch.trim().toLowerCase()));
    if (this.lotSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.hawB_HBL).includes(this.lotSearch.trim().toLowerCase()));
    if (this.cungduongSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.mawB_MBL).includes(this.cungduongSearch.trim().toLowerCase()));
    if (this.palletsSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.pallets).includes(this.palletsSearch.trim().toLowerCase()));
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter(d => norm(d.notes).includes(this.ghichuSearch.trim().toLowerCase()));
    this.totalRows = this.listFilter.length;
    this.pageIndex = 1; // reset page khi đổi filter
  }

  get visibleData(): Shipment[] {
    if (!this.listFilter) return [];
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.listFilter.slice(start, start + this.pageSize);
  }

  /**
   * Parse draft.Payload JSON → row shape Shipment Canon (LOT, Cung đường, Pallets...).
   * Flag _isDraft=true để CSS bôi vàng + chặn action.
   */
  private mapDraftToShipmentRow(d: DraftEntryView): Shipment {
    let p: any = {};
    try { p = JSON.parse(d.payload ?? '{}'); } catch {}
    const row: any = {
      id: undefined,
      jobId: 'NHÁP #' + d.id,
      customerId: p.customerId,
      customerName: d.customerName ?? p.customerName,
      shipmentType: p.shipmentType,
      cdsNumber: p.cdsNumber,         // Xe vận chuyển
      cdsDate: p.cdsDate,             // Ngày
      hawB_HBL: p.hawB_HBL,           // LOT
      mawB_MBL: p.mawB_MBL,           // Cung đường
      pallets: p.pallets,
      notes: p.notes,
      createdByName: d.createdByName,
      createdDate: d.createdAt,
      branchId: d.branchId,
      checked: false,
      _isDraft: true,
      _draftId: d.id,
      _draftPayload: d.payload,
    };
    return row as Shipment;
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
    // Client-side paging: chỉ đổi pageIndex, không reload từ BE.
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

  // Duyệt nháp Canon thành Job thật xong → reload (dòng nháp biến mất, job thật hiện lên).
  onApproveDraft(_draftId: number): void {
    this.viewModal = false;
    this.loadData();
  }

  // Đã lưu nháp (chưa promote) — refresh list nền, GIỮ modal đang mở.
  onSavedDraft(): void {
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

  // Xem chi tiết dòng NHÁP Canon (read-only) — CS kiểm tra độ chính xác AI trước khi duyệt.
  showDraft(item: any) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.viewDraft(item._draftPayload, item._draftId);
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
