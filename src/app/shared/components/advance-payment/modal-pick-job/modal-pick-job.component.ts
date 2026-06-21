import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Customer, Pagination, ResponseValue, Shipment } from '@app/shared/models';
import { Workflow } from '@app/shared/models/workflows/workflow.model';
import { AuthService, CustomerService, ShipmentService, UtilityService } from '@app/shared/services';
import { WorkflowsService } from '@app/shared/services/workflows.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

/** Kết quả trả về parent khi chọn 1 dòng. */
export interface PickJobResult {
  jobId: string;
  shipmentId: number;
  customerName: string;
  refDisplay: string;      // job → jobId; workflow → refCode/jobName
  workflowId?: number;     // chỉ có khi mode='workflow'
}

interface PickRow {
  jobId: string;
  shipmentId: number;
  workflowId?: number;
  customerName: string;
  refDisplay: string;
  dateText: string;
  // chỉ dùng cho mode='workflow'
  jobName?: string;          // thông tin job
  jobDescription?: string;   // chi tiết công việc
  referCode?: string;        // mã tham chiếu
  assigner?: string;         // người giao việc / SĐT
}

interface PickGroup {
  key: string;             // customerName
  items: PickRow[];
  isExpanded: boolean;
}

/**
 * Modal chọn Lô hàng (Job) HOẶC Công việc (PCCV/Workflow) — dùng cho modal đọc hóa đơn.
 * - mode='job'      → ShipmentService.getPagingNormal, bỏ job đã khóa (isFinish).
 * - mode='workflow' → WorkflowsService.getPaging (getpaging2), bỏ job đã khóa (jobLocked).
 * Cả 2 mode list nhóm theo khách hàng, lọc KH + khoảng thời gian + từ khóa.
 * Chọn 1 dòng → emit { jobId, shipmentId, ... }.
 */
@Component({
  selector: 'modal-pick-job',
  templateUrl: './modal-pick-job.component.html',
  styleUrls: ['./modal-pick-job.component.css']
})
export class ModalPickJobComponent implements OnInit {
  @Input() mode: 'job' | 'workflow' = 'job';
  @Output() SelectItem = new EventEmitter<PickJobResult>();
  @Output() CloseModal = new EventEmitter<any>();
  @ViewChild('modalPickJob', { static: false }) modal: ModalDirective;

  busy: Subscription;
  loading = false;
  keyword = '';
  listCustomer: Customer[] = [];
  customerId?: number;
  _branchId: number;
  userId: string;

  rows: PickRow[] = [];
  groups: PickGroup[] = [];

  // Filter cột (dòng đầu bảng) — chỉ cho mode='workflow'
  wfFilters = { jobId: '', jobInfo: '', detail: '', referCode: '', assigner: '' };

  ngayBatDau: Date;
  ngayKetThuc: Date;
  dateOptions: any;

  constructor(
    private shipmentService: ShipmentService,
    private workflowsService: WorkflowsService,
    private customerService: CustomerService,
    private authService: AuthService,
    private _utilityService: UtilityService,
  ) { }

  ngOnInit(): void {
    const user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this.userId = user.id;
  }

  get title(): string {
    return this.mode === 'workflow' ? 'Chọn công việc (PCCV)' : 'Chọn lô hàng (Job)';
  }

  /** Parent gọi: show('job') | show('workflow'). */
  show(mode: 'job' | 'workflow') {
    this.mode = mode || 'job';
    this.keyword = '';
    this.customerId = null;
    this.wfFilters = { jobId: '', jobInfo: '', detail: '', referCode: '', assigner: '' };
    this.ngayBatDau = new Date(moment().subtract(30, 'd').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    if (!this.listCustomer?.length) this.loadCustomer();
    this.loadData();
    this.modal.show();
  }

  loadCustomer() {
    this.customerService.getAll(new HttpParams()).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data || [];
    });
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.loadData();
  }

  search() { this.loadData(); }

  loadData() {
    const tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    const denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.loading = true;

    if (this.mode === 'workflow') {
      const params = new HttpParams()
        .set('keyword', this.keyword || '')
        .set('fromDate', tuNgay)
        .set('toDate', denNgay)
        .set('branchId', this._branchId ? this._branchId.toString() : '0')
        .set('customerId', this.customerId ? this.customerId.toString() : '0');
      this.busy = this.workflowsService.getForPicker(params).subscribe((res: ResponseValue<Workflow[]>) => {
        this.loading = false;
        const items = (res?.code == '200' || res?.code == '201') ? (res.data || []) : [];
        this.rows = (items || []).map(w => this.toRowFromWorkflow(w));
        this.buildGroups();
      }, () => { this.loading = false; this.rows = []; this.buildGroups(); });
    } else {
      const params = new HttpParams()
        .set('pageIndex', '1')
        .set('pageSize', '99999')
        .set('keyword', this.keyword || '')
        .set('fromDate', tuNgay)
        .set('toDate', denNgay)
        .set('customerId', this.customerId?.toString())
        .set('branchId', this._branchId?.toString());
      this.busy = this.shipmentService.getPagingNormal(params).subscribe((res: ResponseValue<Pagination<Shipment>>) => {
        this.loading = false;
        const items = (res?.code == '200' || res?.code == '201') ? (res.data?.items || []) : [];
        this.rows = items.filter(s => !s.isFinish).map(s => this.toRowFromShipment(s));
        this.buildGroups();
      }, () => { this.loading = false; this.rows = []; this.buildGroups(); });
    }
  }

  private toRowFromShipment(s: Shipment): PickRow {
    return {
      jobId: s.jobId,
      shipmentId: s.id,
      customerName: s.customerName || 'Khác',
      refDisplay: s.notes || s.jobId,
      dateText: s.createdDate ? moment(s.createdDate).format('DD/MM/YYYY') : '',
    };
  }

  private toRowFromWorkflow(w: Workflow): PickRow {
    return {
      jobId: w.jobId,
      shipmentId: w.shipmentId,
      workflowId: w.id,
      customerName: w.customerName || 'Khác',
      refDisplay: w.referCode || (w.jobName as string) || w.jobId,
      dateText: w.createdDate ? moment(w.createdDate).format('DD/MM/YYYY') : '',
      jobName: (w.jobName as string) || '',
      jobDescription: w.jobDescription || '',
      referCode: w.referCode || '',
      assigner: w.jobAssigningUserFullName || '',
    };
  }

  /** Filter cột (dòng đầu bảng) — gọi khi gõ. */
  applyColFilters() { this.buildGroups(); }

  private matchColFilters(r: PickRow): boolean {
    if (this.mode !== 'workflow') return true;
    const f = this.wfFilters;
    const has = (v: string, kw: string) => !kw || (v || '').toLowerCase().includes(kw.toLowerCase().trim());
    return has(r.jobId, f.jobId)
      && has(r.jobName, f.jobInfo)
      && has(r.jobDescription, f.detail)
      && has(r.referCode, f.referCode)
      && has(r.assigner, f.assigner);
  }

  private buildGroups() {
    const map = new Map<string, PickGroup>();
    for (const r of this.rows) {
      if (!this.matchColFilters(r)) continue;
      const key = r.customerName || 'Khác';
      if (!map.has(key)) map.set(key, { key, items: [], isExpanded: true });
      map.get(key).items.push(r);
    }
    this.groups = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }

  toggleGroup(g: PickGroup) { g.isExpanded = !g.isExpanded; }

  pick(r: PickRow) {
    this.SelectItem.emit({
      jobId: r.jobId,
      shipmentId: r.shipmentId,
      customerName: r.customerName,
      refDisplay: r.refDisplay,
      workflowId: r.workflowId,
    });
    this.modal.hide();
  }

  close() { this.modal.hide(); }
  OnHidden() { this.CloseModal.emit(); }

  get totalRows(): number { return this.groups.reduce((s, g) => s + g.items.length, 0); }
}
