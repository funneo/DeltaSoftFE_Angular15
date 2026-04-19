import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  NotificationService, EmployeeService, OtherCategoriesService,
  SupplierService, AuthService, VihicleService, FeeService
} from '@app/shared/services';
import { TransportOrderService } from '@app/shared/services/transports/transport-order.service';
import {
  TransportOrder, TransportOrderDetail, TransportOrderFee,
  TransportOrderSegment, TransportOrderSegmentEtc
} from '@app/shared/models/transports/dispatchorders/transport-order.model';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { Vihicle, Employee, Fee, OtherCategories, Supplier, ResponseValue } from '@app/shared/models';
import { ShippingTaskAttachFile } from '@app/shared/models/transports/shipping-task-attach-file';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalShippingTaskAttachFileComponent } from '../modal-shipping-task-attach-file/modal-shipping-task-attach-file.component';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import { MessageContstants } from '@app/shared/constants';
import { HttpParams } from '@angular/common/http';

export interface LocationItem {
  locationId: number;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  type: 'pickup' | 'delivery';
  taskId?: number;
  customerName?: string;
}

@Component({
  selector: 'modal-transport-order',
  templateUrl: './modal-transport-order.component.html',
  styleUrls: ['./modal-transport-order.component.scss']
})
export class ModalTransportOrderComponent {
  @ViewChild('modalMain', { static: false }) modalMain: ModalDirective;
  @Output() SaveSuccess = new EventEmitter<any>();

  entity: TransportOrder = this._emptyEntity();
  locations: LocationItem[] = [];

  // Getter: tập hợp tất cả điểm có thể thêm (từ listDetailed)
  get locationPool(): LocationItem[] {
    const pool: LocationItem[] = [];
    (this.entity.listDetailed || []).forEach(d => {
      const t = d.shippingTaskItem;
      if (!t) return;
      if (t.pickupLocationId) {
        pool.push({
          locationId: t.pickupLocationId,
          locationName: t.pickupLocation || '',
          lat: t.pickupLatitude,
          lng: t.pickupLongitude,
          type: 'pickup',
          taskId: t.id,
          customerName: t.customerName
        });
      }
      if (t.deliveryLocationId) {
        pool.push({
          locationId: t.deliveryLocationId,
          locationName: t.deliveryLocation || '',
          lat: t.deliveryLatitude,
          lng: t.deliveryLongitude,
          type: 'delivery',
          taskId: t.id,
          customerName: t.customerName
        });
      }
    });
    return pool;
  }

  // State flags
  isCalculating = false;
  isSaving = false;
  segmentCalculating: boolean[] = [];

  // Totals
  totalEtcCost = 0;

  // Dropdowns
  listVehicles: Vihicle[] = [];
  listVehicleTypes: OtherCategories[] = [];
  listMoocs: Vihicle[] = [];
  listDrivers: Employee[] = [];
  listSuppliers: Supplier[] = [];
  listFeeSelect: Fee[] = [];

  // Attach files
  listAttachFile: ShippingTaskAttachFile[] = [];
  viewAttackFiles = false;
  viewAttackDriverFiles = false;

  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalShippingTaskAttachFileComponent, { static: false }) modalAttackDriverFilesRef: ModalShippingTaskAttachFileComponent;

  constructor(
    private _notif: NotificationService,
    private _transportService: TransportOrderService,
    private _vihicleService: VihicleService,
    private _employeeService: EmployeeService,
    private _otherService: OtherCategoriesService,
    private _supplierService: SupplierService,
    private _authService: AuthService,
    private _feeService: FeeService,
    private _shippingTaskService: ShippingTaskService,
    private http: HttpClient
  ) { }

  // ── PUBLIC LIFECYCLE ──

  add(listTasks: ShippingTask[]) {
    this.entity = this._emptyEntity();
    this.entity.listDetailed = listTasks.map(t => ({ shippingTaskId: t.id, shippingTaskItem: t }));
    this.locations = [];
    this.modalMain.show();
  }

  edit(id: number) {
    this._transportService.getById(id).subscribe(res => {
      if (res.code === '200') {
        this.entity = res.data;
        this.locations = this._segmentsToLocations(this.entity.segments || []);
        this.calculateTotal();
        this.modalMain.show();
      }
    });
  }

  hide() { this.modalMain.hide(); }

  onModalShown() { this._loadDropdowns(); this._loadFees(); }

  // ── LOCATION POOL ──

  isLocInRoute(locationId: number): boolean {
    return this.locations.some(l => l.locationId === locationId);
  }

  addToRoute(task: ShippingTask, type: 'pickup' | 'delivery') {
    const locationId = type === 'pickup' ? task.pickupLocationId : task.deliveryLocationId;
    if (this.isLocInRoute(locationId)) return; // đã có rồi

    this.locations.push({
      locationId,
      locationName: type === 'pickup' ? task.pickupLocation : task.deliveryLocation,
      lat: type === 'pickup' ? task.pickupLatitude : task.deliveryLatitude,
      lng: type === 'pickup' ? task.pickupLongitude : task.deliveryLongitude,
      type,
      taskId: task.id,
      customerName: task.customerName
    });
    this._rebuildSegments();
  }

  // ── DRAG & DROP ──

  onDropLocation(event: CdkDragDrop<LocationItem[]>) {
    moveItemInArray(this.locations, event.previousIndex, event.currentIndex);
    this._rebuildSegments();
  }

  removeLocation(index: number) {
    this.locations.splice(index, 1);
    this._rebuildSegments();
  }

  // ── SEGMENT HELPERS ──

  getSegment(index: number): TransportOrderSegment | null {
    return this.entity.segments?.[index] || null;
  }

  isSegmentCalculating(index: number): boolean {
    return !!this.segmentCalculating[index];
  }

  getIndexClass(index: number, total: number): string {
    if (index === 0) return 'index-start';
    if (index === total - 1) return 'index-end';
    return 'index-mid';
  }

  // ── ETC ──

  addManualEtc(segIndex: number) {
    if (!this.entity.segments[segIndex].listEtc) {
      this.entity.segments[segIndex].listEtc = [];
    }
    this.entity.segments[segIndex].listEtc.push({ stationName: 'Trạm mới', price: 0 });
  }

  removeEtc(segIndex: number, etcIndex: number) {
    this.entity.segments[segIndex].listEtc.splice(etcIndex, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    let totalKm = 0;
    let totalEtc = 0;
    (this.entity.segments || []).forEach(s => {
      totalKm += (s.distanceKm || 0);
      let segEtc = 0;
      (s.listEtc || []).forEach(e => segEtc += (e.price || 0));
      s.etcCost = segEtc;
      totalEtc += segEtc;
    });
    this.entity.tongKm = totalKm;
    this.totalEtcCost = totalEtc;
  }

  // ── CALCULATE BUTTONS ──

  /** Tính từng chặng A→B, B→C song song bằng Vietmap */
  calcAllSegments() {
    if (this.locations.length < 2) return;
    this.isCalculating = true;

    const calls = [];
    for (let i = 0; i < this.locations.length - 1; i++) {
      this.segmentCalculating[i] = true;
      const a = this.locations[i];
      const b = this.locations[i + 1];
      calls.push(
        this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, {
          points: [{ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }]
        }).pipe(catchError(() => of(null)))
      );
    }

    forkJoin(calls).subscribe(results => {
      results.forEach((res, i) => {
        this.segmentCalculating[i] = false;
        if (!res) return;
        const seg = this.entity.segments[i];
        if (!seg) return;
        if (res.route?.paths?.[0]) {
          seg.distanceKm = +(res.route.paths[0].distance / 1000).toFixed(2);
        }
        seg.listEtc = this._parseTollStations(res.toll, 2); // loại xe 2 (xe tải)
      });
      this.calculateTotal();
      this.isCalculating = false;
    });
  }

  /** Tính toàn trình — gọi Vietmap với tất cả các điểm */
  calcFullRoute() {
    if (this.locations.length < 2) return;
    this.isCalculating = true;

    const points = this.locations.map(l => ({ lat: l.lat, lng: l.lng }));
    this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, { points })
      .subscribe(res => {
        this.isCalculating = false;
        if (!res?.route?.paths?.[0]) {
          this._notif.printErrorMessage('Không lấy được dữ liệu từ VietMap');
          return;
        }
        // Toàn trình: gán tổng km cho chặng đầu, các chặng còn lại = 0
        const totalKm = +(res.route.paths[0].distance / 1000).toFixed(2);
        const etcs = this._parseTollStations(res.toll, 2);

        this.entity.segments.forEach((seg, i) => {
          seg.distanceKm = i === 0 ? totalKm : 0;
          seg.listEtc = i === 0 ? etcs : [];
        });
        this.calculateTotal();
      }, () => {
        this.isCalculating = false;
        this._notif.printErrorMessage('Lỗi kết nối VietMap API');
      });
  }

  /** Tính riêng 1 chặng */
  calcSingleSegment(segIndex: number) {
    const a = this.locations[segIndex];
    const b = this.locations[segIndex + 1];
    if (!a || !b) return;

    this.segmentCalculating[segIndex] = true;
    this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, {
      points: [{ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }]
    }).subscribe(res => {
      this.segmentCalculating[segIndex] = false;
      const seg = this.entity.segments[segIndex];
      if (!seg || !res?.route?.paths?.[0]) return;
      seg.distanceKm = +(res.route.paths[0].distance / 1000).toFixed(2);
      seg.listEtc = this._parseTollStations(res.toll, 2);
      this.calculateTotal();
    }, () => {
      this.segmentCalculating[segIndex] = false;
    });
  }

  // ── VEHICLE / DRIVER CHANGE ──

  onVehicleTypeChange(event: OtherCategories) {
    this.entity.vehicleType = event?.id;
  }

  onVehicleChange(event: Vihicle) {
    if (event) {
      this.entity.vehicleId = event.id;
      this.entity.vehiclelLicensePlates = event.licensePlates;
    }
  }

  onMoocChange(event: Vihicle) {
    if (event) {
      this.entity.moocId = event.id;
      this.entity.moocLicensePlates = event.licensePlates;
    } else {
      this.entity.moocId = undefined;
      this.entity.moocLicensePlates = '';
    }
  }

  onDriverChange(event: Employee) {
    if (event) {
      this.entity.driverId = event.id;
      this.entity.driverName = event.employeeFullName;
      this.entity.driverTel = event.telephone;
    } else {
      this.entity.driverId = undefined;
      this.entity.driverName = '';
      this.entity.driverTel = '';
    }
  }

  onSubcontractorToggle() {
    this.entity.vehicleId = undefined;
    this.entity.driverId = undefined;
    this.entity.driverName = '';
    this.entity.driverTel = '';
    this.entity.vehiclelLicensePlates = '';
  }

  // ── SAVE ──

  save() {
    if (!this.entity.isSubcontractors && !this.entity.vehicleId) {
      this._notif.printErrorMessage('Vui lòng chọn số xe');
      return;
    }
    if (!this.entity.driverId) {
      this._notif.printErrorMessage('Vui lòng chọn tài xế');
      return;
    }
    if (this.locations.length < 2) {
      this._notif.printErrorMessage('Lộ trình cần ít nhất 2 điểm');
      return;
    }

    this.isSaving = true;
    const user = this._authService.getLoggedInUser();
    this.entity.branchId = +user.branchId;

    const action = this.entity.id
      ? this._transportService.update(this.entity)
      : this._transportService.add(this.entity);

    action.subscribe(res => {
      this.isSaving = false;
      if (res.code === '200') {
        this._notif.printSuccessMessage('Lưu lệnh vận chuyển thành công');
        this.SaveSuccess.emit(res.data);
        this.hide();
      } else {
        this._notif.printErrorMessage(res.message || 'Có lỗi xảy ra');
      }
    }, () => {
      this.isSaving = false;
      this._notif.printErrorMessage('Lỗi kết nối server');
    });
  }

  // ── CHI TIẾT CÔNG VIỆC ──

  deleteWorkflow(item: TransportOrderDetail) {
    const idx = this.entity.listDetailed.indexOf(item);
    if (idx !== -1) this.entity.listDetailed.splice(idx, 1);
  }

  attack(id: number) {
    this.viewAttackFiles = true;
    const item: Attachfiles = { frmName: 'SHIPPINGTASK', functionName: 'SHIPPINGTASK', refNo: id.toString() };
    setTimeout(() => this.modalAttackFiles.edit(item, false), 50);
  }

  closeAttackModal() { this.viewAttackFiles = false; }

  attackDriver(id: number) {
    this.viewAttackDriverFiles = true;
    setTimeout(() => this.modalAttackDriverFilesRef.edit(id, false), 50);
  }

  closeAttackDriverModal() { this.viewAttackDriverFiles = false; }

  duplicate(id: number) {
    this._notif.printConfirmationDialog(MessageContstants.DUPLICATE_SHIPPINGTASK, () => {
      this._shippingTaskService.duplicate(id).subscribe((res: ResponseValue<number>) => {
        if (res.code === '200' || res.code === '201') {
          this._notif.printSuccessMessage(MessageContstants.DUPLICATE_SHIPPINGTASK_SUCCESS + ' Id: ' + res.data);
        } else {
          this._notif.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG + '\n' + res.code);
        }
      });
    });
  }

  // ── CHI PHÍ ──

  newFee() {
    if (!this.entity.listFee) this.entity.listFee = [];
    const item: TransportOrderFee = { cost: 0, vat: 0, totalCost: 0, quantity: 1 };
    this.entity.listFee.push(item);
  }

  deleteFee(item: TransportOrderFee) {
    const idx = this.entity.listFee.indexOf(item);
    if (idx !== -1) this.entity.listFee.splice(idx, 1);
  }

  feeCodeChanged(item: TransportOrderFee, event: Fee) {
    item.feeId = event?.id;
    item.contents = event?.feeName;
  }

  changeCost(item: TransportOrderFee) {
    item.totalCost = (item.cost || 0) + (item.vat || 0);
  }

  changeQuantity(item: TransportOrderFee) {
    item.totalCost = (item.cost || 0) * (item.quantity || 1);
  }

  // ── HÌNH ẢNH HIỆN TRƯỜNG ──

  onAttachFileChanged(_event: any) { /* upload pending */ }

  clickLink(item: ShippingTaskAttachFile) {
    window.open(environment.apiUrl + item.pathFile?.replace('~', ''), '_blank');
  }

  // ── PRIVATE ──

  private _emptyEntity(): TransportOrder {
    return {
      segments: [], listFee: [], listDetailed: [],
      status: 0, tongKm: 0, isSubcontractors: false
    };
  }

  private _rebuildSegments() {
    const existing = this.entity.segments || [];
    this.entity.segments = this.locations.slice(0, -1).map((loc, i) => {
      const next = this.locations[i + 1];
      const prev = existing[i];
      return {
        orderIndex: i,
        startLocationId: loc.locationId,
        startLocationName: loc.locationName,
        startLat: loc.lat,
        startLng: loc.lng,
        endLocationId: next.locationId,
        endLocationName: next.locationName,
        endLat: next.lat,
        endLng: next.lng,
        // Giữ lại dữ liệu cũ nếu đúng cặp điểm
        distanceKm: (prev?.startLocationId === loc.locationId && prev?.endLocationId === next.locationId)
          ? prev.distanceKm : 0,
        listEtc: (prev?.startLocationId === loc.locationId && prev?.endLocationId === next.locationId)
          ? prev.listEtc : []
      };
    });
    this.segmentCalculating = new Array(this.entity.segments.length).fill(false);
    this.calculateTotal();
  }

  private _segmentsToLocations(segments: TransportOrderSegment[]): LocationItem[] {
    if (!segments.length) return [];
    const locs: LocationItem[] = [];
    segments.forEach((s, idx) => {
      if (idx === 0) {
        locs.push({ locationId: s.startLocationId, locationName: s.startLocationName, lat: s.startLat, lng: s.startLng, type: 'pickup' });
      }
      locs.push({ locationId: s.endLocationId, locationName: s.endLocationName, lat: s.endLat, lng: s.endLng, type: 'delivery' });
    });
    return locs;
  }

  /** Parse toll data từ VietMap response — lấy loại xe `vehicleType` */
  private _parseTollStations(tollData: any, vehicleType: number): TransportOrderSegmentEtc[] {
    if (!tollData || !Array.isArray(tollData)) return [];
    const entry = tollData.find((t: any) => t.vehicle === vehicleType);
    if (!entry?.data) return [];
    try {
      const d = typeof entry.data === 'string' ? JSON.parse(entry.data) : entry.data;
      const stations: any[] = d?.stations || d?.toll_stations || [];
      return stations.map((s: any) => ({
        stationId: s.id || s.station_id,
        stationName: s.name || s.station_name || 'Trạm thu phí',
        price: s.price || s.fee || 0
      }));
    } catch { return []; }
  }

  private _loadFees() {
    this._feeService.getAll(new HttpParams()).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(f => f.groupCode === 'CP01' || f.groupCode === 'CP02' || f.groupCode === 'CP03') || [];
      this.listFeeSelect = filtered.map(f => ({ ...f, feeName: f.feeCode + '-' + f.feeName }));
    });
  }

  private _loadDropdowns() {
    const user = this._authService.getLoggedInUser();
    const branchId = user?.branchId || '0';

    this._vihicleService.getAll({ branchid: branchId, vihicletype: '0' } as any)
      .subscribe(res => this.listVehicles = res.data || []);

    this._vihicleService.getAll({ branchid: branchId, vihicletype: 'MOOC' } as any)
      .subscribe(res => this.listMoocs = res.data || []);

    this._otherService.getAll({ type: 'VIHITYPE' } as any)
      .subscribe(res => this.listVehicleTypes = res.data || []);

    this._employeeService.getAll({ branchId } as any)
      .subscribe(res => this.listDrivers = (res.data || []).filter((x: Employee) => x.departmentId == 1147));

    this._supplierService.getAll({ branchid: branchId } as any)
      .subscribe(res => this.listSuppliers = res.data || []);
  }
}
