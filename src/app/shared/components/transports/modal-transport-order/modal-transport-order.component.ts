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
  TransportOrderSegment, TransportOrderSegmentEtc, UnifiedLocation
} from '@app/shared/models/transports/dispatchorders/transport-order.model';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { Vihicle, Employee, Fee, OtherCategories, Supplier, ResponseValue } from '@app/shared/models';
import { VehicleOilQuota } from '@app/shared/models/danhmuc/vehicle-oil-quota.model';
import { ShippingTaskAttachFile } from '@app/shared/models/transports/shipping-task-attach-file';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalShippingTaskAttachFileComponent } from '../modal-shipping-task-attach-file/modal-shipping-task-attach-file.component';
import { ModalVietmapRoutesComponent } from '../../danhmuc/modal-vietmap-routes/modal-vietmap-routes.component';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import { MessageContstants } from '@app/shared/constants';
import { HttpParams } from '@angular/common/http';
import { TollrouteService } from '@app/shared/services/tollroute.service';
import { Tollroute } from '@app/shared/models/tollroute.model';

export interface LocationItem {
  locationId: number;
  locationType?: number; // 1=CustomerLocation, 2=Port (undefined = từ ShippingTask pool)
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

  // Panel visibility (ẩn mặc định, chủ đạo là giao diện location)
  showVehiclePanel = false;
  showBottomPanel = false;

  // Custom point form
  showAddCustomPoint = false;
  selectedCustomLocation: UnifiedLocation | null = null;
  listAllLocations: UnifiedLocation[] = [];

  // Track segment đang mở bản đồ
  private _currentMapSegmentIndex: number | null = null;

  // State flags
  isCalculating = false;
  isSaving = false;
  segmentCalculating: boolean[] = [];

  // Danh sách định mức dầu (lượng hàng) của xe đang chọn
  listOilQuota: VehicleOilQuota[] = [];

  // Totals
  totalEtcCost = 0;

  // Dropdowns
  listVehicles: Vihicle[] = [];
  listVehiclesFiltered: Vihicle[] = [];
  listVehicleTypes: OtherCategories[] = [];
  listContType: OtherCategories[] = [];
  listMoocs: Vihicle[] = [];
  listEmployees: Employee[] = [];
  listSuppliers: Supplier[] = [];
  listFeeSelect: Fee[] = [];
  listTollRoute: Tollroute[] = [];
  listOrderTypes = [{ value: 0, text: 'Đường dài' }, { value: 1, text: 'Đường ngắn' }];
  orderType = 0;

  // Attach files
  listAttachFile: ShippingTaskAttachFile[] = [];
  viewAttackFiles = false;
  viewAttackDriverFiles = false;

  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalShippingTaskAttachFileComponent, { static: false }) modalAttackDriverFilesRef: ModalShippingTaskAttachFileComponent;
  @ViewChild(ModalVietmapRoutesComponent, { static: false }) modalVietmap: ModalVietmapRoutesComponent;

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
    private _tollRouteService: TollrouteService,
    private http: HttpClient
  ) { }

  // ── PUBLIC LIFECYCLE ──

  add(listTasks: ShippingTask[]) {
    this.entity = this._emptyEntity();
    this.entity.listDetailed = listTasks.map(t => ({ shippingTaskId: t.id, shippingTaskItem: t }));
    this.locations = [];
    this.listOilQuota = [];
    this.showVehiclePanel = false;
    this.showBottomPanel = false;
    this.showAddCustomPoint = false;
    this.selectedCustomLocation = null;
    this.modalMain.show();
  }

  edit(id: number) {
    this._transportService.getById(id).subscribe(res => {
      if (res.code === '200') {
        this.entity = res.data;
        this.locations = this._segmentsToLocations(this.entity.segments || []);
        this.listVehiclesFiltered = [];
        if (this.entity.vehicleType) this._loadVehiclesByType(this.entity.vehicleType);
        if (this.entity.vehicleId) this.loadVehicle(this.entity.vehicleId);
        this.calculateTotal();
        this.showVehiclePanel = false;
        this.showBottomPanel = false;
        this.showAddCustomPoint = false;
        this.selectedCustomLocation = null;
        this.modalMain.show();
      }
    });
  }

  hide() { this.modalMain.hide(); }

  onModalShown() { this._loadDropdowns(); this._loadFees(); this._loadAllLocations(); }

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

  // ── MAP: mở bản đồ toàn trình (không gắn segment) ──

  showMap() {
    if (this.locations.length < 2) return;
    this._currentMapSegmentIndex = null;
    const points = this.locations.map(l => ({ lat: l.lat, lng: l.lng }));
    this.modalVietmap.show(points);
  }

  /** Mở bản đồ cho một segment cụ thể — dùng waypoints đã lưu nếu có */
  showMapForSegment(segIndex: number) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    this._currentMapSegmentIndex = segIndex;

    if (seg.listWaypoints?.length >= 2) {
      // Đã có lộ trình đã duyệt → chỉ vẽ lại, không gọi API
      this.modalVietmap.showSaved(
        seg.listWaypoints.map(w => ({ lat: w.lat, lng: w.lng, name: w.name || '', distanceM: w.distanceM || 0 })),
        seg.routePolyline
      );
    } else {
      // Chưa có → mở bản đồ tính mới từ start/end
      this.modalVietmap.show([
        { lat: seg.startLat, lng: seg.startLng },
        { lat: seg.endLat, lng: seg.endLng }
      ]);
    }
  }

  /** Nhận kết quả từ modal-vietmap-routes khi user bấm "Chọn tuyến này" */
  onRouteSelected(event: { summary: string; km: number; waypoints: { lat: number; lng: number }[]; steps: { lat: number; lng: number; name: string; distanceM: number }[]; polyline: string }) {
    if (this._currentMapSegmentIndex !== null) {
      const seg = this.entity.segments?.[this._currentMapSegmentIndex];
      if (seg) {
        seg.distanceKm = event.km;
        seg.routePolyline = event.polyline;
        seg.listWaypoints = event.steps.map((s, i) => ({ orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM }));
        this.calculateTotal();
      }
    }
    this._currentMapSegmentIndex = null;
  }

  // ── THÊM ĐIỂM THỦ CÔNG ──

  toggleAddCustomPoint() {
    this.showAddCustomPoint = !this.showAddCustomPoint;
    if (!this.showAddCustomPoint) {
      this.selectedCustomLocation = null;
    }
  }

  confirmAddCustomPoint() {
    if (!this.selectedCustomLocation) {
      this._notif.printErrorMessage('Vui lòng chọn điểm');
      return;
    }
    const loc = this.selectedCustomLocation;
    if (this.locations.some(l => l.locationId === loc.id && l.locationType === loc.locationType)) {
      this._notif.printErrorMessage('Điểm này đã có trong lộ trình');
      return;
    }
    this.locations.push({
      locationId: loc.id,
      locationType: loc.locationType,
      locationName: loc.address,
      lat: loc.latitude,
      lng: loc.longtitude,
      type: 'delivery'
    });
    this._rebuildSegments();
    this.selectedCustomLocation = null;
    this.showAddCustomPoint = false;
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
    this.entity.vehicleId = undefined;
    this.entity.vehiclelLicensePlates = '';
    this.entity.driverId = undefined;
    this.entity.driverName = '';
    this.entity.driverTel = '';
    this.entity.fuelDriverId = undefined;
    this.listOilQuota = [];
    this.listVehiclesFiltered = [];
    if (event?.id) this._loadVehiclesByType(event.id);
  }

  loadVehicle(id: number) {
    this._vihicleService.getDetail(id).subscribe((res: ResponseValue<Vihicle>) => {
      if (res.code === '200' || res.code === '201') {
        this.listOilQuota = res.data?.listOilQuota || [];
      } else {
        this.listOilQuota = [];
      }
    });
  }

  onVehicleChange(event: Vihicle) {
    if (event) {
      this.entity.vehicleId = event.id;
      this.entity.vehiclelLicensePlates = event.licensePlates;
      // Lái xe gán với xe → tự động bind lái xe 1 + SĐT
      const driver = this.listEmployees.find(e => e.id === event.employeeId);
      this.entity.driverId = event.employeeId;
      this.entity.driverName = driver?.employeeFullName || '';
      this.entity.driverTel = driver?.telephone || '';
      // Mặc định lái xe nhận dầu = lái xe 1
      this.entity.fuelDriverId = event.employeeId;
      this.loadVehicle(event.id);
    } else {
      this.entity.vehicleId = undefined;
      this.entity.vehiclelLicensePlates = '';
      this.listOilQuota = [];
    }
  }

  onSegmentQuotaChange(segIndex: number, event: VehicleOilQuota) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    seg.payloadWeight = event?.id;
    seg.fuelNorm = this.entity.shortWay ? event?.shortWayValue : event?.value;
    seg.fuelAmountCalculated = +((seg.fuelNorm || 0) * (seg.distanceKm || 0) / 100).toFixed(2);
    this.calulateOil();
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
      const sameSegment = prev?.startLocationId === loc.locationId && prev?.endLocationId === next.locationId;
      return {
        orderIndex: i,
        startLocationId: loc.locationId,
        startLocationType: loc.locationType ?? 1,
        startLocationName: loc.locationName,
        startLat: loc.lat,
        startLng: loc.lng,
        endLocationId: next.locationId,
        endLocationType: next.locationType ?? 1,
        endLocationName: next.locationName,
        endLat: next.lat,
        endLng: next.lng,
        distanceKm: sameSegment ? prev.distanceKm : 0,
        payloadWeight: sameSegment ? prev.payloadWeight : undefined,
        listWaypoints: sameSegment ? prev.listWaypoints : [],
        listEtc: sameSegment ? prev.listEtc : []
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
        locs.push({ locationId: s.startLocationId, locationType: s.startLocationType, locationName: s.startLocationName, lat: s.startLat, lng: s.startLng, type: 'pickup' });
      }
      locs.push({ locationId: s.endLocationId, locationType: s.endLocationType, locationName: s.endLocationName, lat: s.endLat, lng: s.endLng, type: 'delivery' });
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

  private _loadAllLocations() {
    this._transportService.getLocations().subscribe(data => {
      this.listAllLocations = data || [];
    });
  }

  private _loadFees() {
    this._feeService.getAll(new HttpParams()).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(f => f.groupCode === 'CP01' || f.groupCode === 'CP02' || f.groupCode === 'CP03') || [];
      this.listFeeSelect = filtered.map(f => ({ ...f, feeName: f.feeCode + '-' + f.feeName }));
    });
  }

  private _loadVehiclesByType(typeId: number) {
    const user = this._authService.getLoggedInUser();
    const branchId = user?.branchId?.toString() || '0';
    this._vihicleService.getAll(
      new HttpParams().set('branchid', branchId).set('vihicletype', typeId.toString())
    ).subscribe((res: ResponseValue<Vihicle[]>) => {
      this.listVehiclesFiltered = res.data || [];
    });
  }

  private _loadDropdowns() {
    const user = this._authService.getLoggedInUser();
    const branchId = user?.branchId?.toString() || '0';

    this._vihicleService.getAllMooc(
      new HttpParams().set('branchid', branchId)
    ).subscribe((res: ResponseValue<Vihicle[]>) => this.listMoocs = res.data || []);

    this._otherService.getAll(
      new HttpParams().set('type', 'VIHITYPE')
    ).subscribe((res: ResponseValue<OtherCategories[]>) => this.listVehicleTypes = res.data || []);

    this._otherService.getAll(
      new HttpParams().set('type', 'CONTTYPE')
    ).subscribe((res: ResponseValue<OtherCategories[]>) => this.listContType = res.data || []);

    this._employeeService.getAll(
      new HttpParams().set('branchId', branchId)
    ).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployees = res.data || [];
    });

    this._supplierService.getAll(
      new HttpParams().set('branchid', branchId)
    ).subscribe((res: ResponseValue<Supplier[]>) => this.listSuppliers = res.data || []);

    this._tollRouteService.getAll(
      new HttpParams().set('branchid', branchId)
    ).subscribe((res: ResponseValue<Tollroute[]>) => this.listTollRoute = res.data || []);
  }

  changeTollRouteCode(event: Tollroute) {
    this.entity.subcontractorsQuoteRouteCode = event?.tollRouteCode;
  }

  orderTypeChange(event: any) {
    this.entity.shortWay = event?.value === 1;
    (this.entity.segments || []).forEach(s => {
      const quota = this.listOilQuota.find(x => x.id === s.payloadWeight);
      if (quota) s.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
    });
    this.calulateOil();
  }

  calulateOil() {
    let total = 0;
    (this.entity.segments || []).forEach(s => {
      s.fuelAmountCalculated = +((s.fuelNorm || 0) * (s.distanceKm || 0) / 100).toFixed(2);
      total += s.fuelAmountCalculated;
    });
    this.entity.tongdau = +total.toFixed(2);
  }
}
