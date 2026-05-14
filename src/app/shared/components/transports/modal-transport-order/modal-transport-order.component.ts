import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
  TransportOrderSegment, SegmentStation, UnifiedLocation, RouteSegmentDefault
} from '@app/shared/models/transports/dispatchorders/transport-order.model';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { Vihicle, Employee, Fee, OtherCategories, Supplier, ResponseValue } from '@app/shared/models';
import { VehicleOilQuota } from '@app/shared/models/danhmuc/vehicle-oil-quota.model';
import { ShippingTaskAttachFile } from '@app/shared/models/transports/shipping-task-attach-file';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalShippingTaskAttachFileComponent } from '../modal-shipping-task-attach-file/modal-shipping-task-attach-file.component';
import { ModalVietmapRoutesComponent } from '../../danhmuc/modal-vietmap-routes/modal-vietmap-routes.component';
import { ModalMapRoutesComponent } from '../../danhmuc/modal-map-routes/modal-map-routes.component';
import { ModalRouteCompareComponent, CompareRouteResult } from '../../danhmuc/modal-route-compare/modal-route-compare.component';
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
export class ModalTransportOrderComponent implements OnInit {
  @ViewChild('modalMain', { static: false }) modalMain: ModalDirective;
  @Output() SaveSuccess = new EventEmitter<any>();

  entity: TransportOrder = this._emptyEntity();
  locations: LocationItem[] = [];

  routeConfirmed = false;
  closing_permission = false;
  accept_permission = false;

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
  showPoolPanel = true;

  // Flag: chặng cuối đã chọn → không cho thêm điểm nữa
  lastSegmentFinal = false;

  get allTollStations(): SegmentStation[] {
    const stations: SegmentStation[] = [];
    (this.entity.segments || []).forEach(s => (s.listStations || []).forEach(e => stations.push(e)));
    return stations.filter(e => (e.price || 0) > 0);
  }

  onLastSegmentFinalChange() {
    if (this.lastSegmentFinal) this.showAddCustomPoint = false;
  }

  // Custom point form — bảng chọn location
  showAddCustomPoint = false;
  selectedCustomLocation: UnifiedLocation | null = null;
  listAllLocations: UnifiedLocation[] = [];
  locFilter = { address: '', type: '' };
  locSortCol: 'address' | 'locationType' = 'address';
  locSortDir: 'asc' | 'desc' = 'asc';

  get filteredLocations(): UnifiedLocation[] {
    let list = this.listAllLocations;
    const addr = this.locFilter.address.trim().toLowerCase();
    const type = this.locFilter.type.trim();
    if (addr) list = list.filter(l => l.address?.toLowerCase().includes(addr));
    if (type) list = list.filter(l => l.locationType?.toString() === type);
    list = [...list].sort((a, b) => {
      const va = this.locSortCol === 'locationType' ? (a.locationType || 0) : (a.address || '');
      const vb = this.locSortCol === 'locationType' ? (b.locationType || 0) : (b.address || '');
      if (va < vb) return this.locSortDir === 'asc' ? -1 : 1;
      if (va > vb) return this.locSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }

  sortLoc(col: 'address' | 'locationType') {
    if (this.locSortCol === col) {
      this.locSortDir = this.locSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.locSortCol = col;
      this.locSortDir = 'asc';
    }
  }

  hasGeoCoord(loc: UnifiedLocation): boolean {
    return !!(loc.latitude && loc.longtitude
      && Math.abs(loc.latitude) > 0.0001
      && Math.abs(loc.longtitude) > 0.0001);
  }

  selectLocation(loc: UnifiedLocation) {
    if (!this.hasGeoCoord(loc)) return;
    this.selectedCustomLocation = loc;
  }

  locationTypeName(type: number): string {
    return type === 2 ? 'Cảng/Bãi' : 'Nhà máy';
  }

  // Track segment đang mở bản đồ
  private _currentMapSegmentIndex: number | null = null;

  // State flags
  isCalculating = false;
  isSaving = false;
  segmentCalculating: boolean[] = [];
  private _vehicleBotTypeId: number | null = null;

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
  @ViewChild(ModalMapRoutesComponent, { static: false }) modalGoogle: ModalMapRoutesComponent;
  @ViewChild(ModalRouteCompareComponent, { static: false }) modalCompare: ModalRouteCompareComponent;

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

  ngOnInit() {
    const user = this._authService.getLoggedInUser();
    this.closing_permission = this._authService.hasPermission('TO_CLOSING') || user?.isAdmin;
    this.accept_permission = this._authService.hasPermission('TO_ACCEPT') || user?.isAdmin;
  }

  add(listTasks: ShippingTask[]) {
    this.entity = this._emptyEntity();
    this.entity.listDetailed = listTasks.map(t => ({ shippingTaskId: t.id, shippingTaskItem: t }));
    this.locations = [];
    this.listOilQuota = [];
    this._vehicleBotTypeId = null;
    this.lastSegmentFinal = false;
    this.routeConfirmed = false;
    this.showVehiclePanel = true;
    this.showBottomPanel = false;
    this.showPoolPanel = true;
    this.showAddCustomPoint = false;
    this.selectedCustomLocation = null;
    this.modalMain.show();
  }

  edit(id: number) {
    this._transportService.getById(id).subscribe(res => {
      if (res.code === '200') {
        this.entity = res.data;
        this.locations = this._segmentsToLocations(this.entity.segments || []);
        if (this.entity.vehicleId) this.loadVehicle(this.entity.vehicleId);
        this.calculateTotal();
        this.lastSegmentFinal = true;
        this.routeConfirmed = true;
        this.showVehiclePanel = true;
        this.showBottomPanel = false;
        this.showPoolPanel = true;
        this.showAddCustomPoint = false;
        this.selectedCustomLocation = null;
        this.modalMain.show();
      }
    });
  }

  hide() { this.modalMain.hide(); }

  onModalShown() { this._loadDropdowns(); this._loadFees(); this._loadAllLocations(); }

  // ── LOCATION POOL ──

  isLocInRoute(locationId: number, taskId?: number, type?: 'pickup' | 'delivery'): boolean {
    return this.locations.some(l =>
      l.locationId === locationId && l.taskId === taskId && l.type === type
    );
  }

  addToRoute(task: ShippingTask, type: 'pickup' | 'delivery') {
    if (this.lastSegmentFinal) return;
    const locationId = type === 'pickup' ? task.pickupLocationId : task.deliveryLocationId;
    if (this.isLocInRoute(locationId, task.id, type)) return; // đã có rồi

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
    this.lastSegmentFinal = false;
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

  // ── Trạm phí ──

  removeStation(segIndex: number, stationIndex: number) {
    this.entity.segments[segIndex].listStations.splice(stationIndex, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    let totalKm = 0;
    let totalEtc = 0;
    (this.entity.segments || []).forEach(s => {
      if (s.routePolyline) totalKm += (s.distanceKm || 0);
      let segEtc = 0;
      (s.listStations || []).forEach(e => segEtc += (e.price || 0));
      s.etcCost = segEtc;
      totalEtc += segEtc;
    });
    this.entity.tongKm = totalKm;
    this.totalEtcCost = totalEtc;
  }

  // ── MAP: xem lộ trình toàn tuyến (read-only, ghép tất cả segments đã lưu) ──

  showFullRouteMap() {
    if (this.locations.length < 2) return;
    this._currentMapSegmentIndex = null;

    const segments = this.entity.segments || [];

    // Gộp polyline từ tất cả segments theo thứ tự
    const combinedCoords: number[][] = [];
    segments.forEach(seg => {
      if (seg.routePolyline) {
        try {
          const coords: number[][] = JSON.parse(seg.routePolyline);
          combinedCoords.push(...coords);
        } catch { }
      } else {
        // Fallback: nối thẳng start → end
        if (seg.startLng && seg.startLat) combinedCoords.push([seg.startLng, seg.startLat]);
        if (seg.endLng && seg.endLat) combinedCoords.push([seg.endLng, seg.endLat]);
      }
    });

    // Gộp steps từ tất cả segments
    const combinedSteps: { lat: number; lng: number; name: string; distanceM: number }[] = [];
    segments.forEach(seg => {
      (seg.listWaypoints || []).forEach(w => {
        combinedSteps.push({ lat: w.lat, lng: w.lng, name: w.name || '', distanceM: w.distanceM || 0 });
      });
    });

    // Fallback nếu chưa có waypoints: dùng location points
    if (!combinedSteps.length) {
      this.locations.forEach(l => combinedSteps.push({ lat: l.lat, lng: l.lng, name: l.locationName, distanceM: 0 }));
    }

    // Gom tất cả trạm phí từ các segments
    const combinedTolls: { stationName: string; price: number }[] = [];
    segments.forEach(seg => {
      (seg.listStations || []).forEach(e => {
        combinedTolls.push({ stationName: e.stationName || '', price: e.price || 0 });
      });
    });

    const polylineJson = combinedCoords.length >= 2 ? JSON.stringify(combinedCoords) : null;
    this.modalVietmap.showSaved(combinedSteps, polylineJson, combinedTolls.length ? combinedTolls : undefined);
  }

  /** Mở bản đồ edit mode để tính lại / chọn lộ trình mới cho segment */
  editSegmentRoute(segIndex: number) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    this._currentMapSegmentIndex = segIndex;
    this.modalVietmap.show([
      { lat: seg.startLat, lng: seg.startLng },
      { lat: seg.endLat, lng: seg.endLng }
    ]);
  }

  /** Mở modal so sánh Vietmap vs Google Maps cho một segment */
  openCompareModal(segIndex: number) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    this._currentMapSegmentIndex = segIndex;
    this.modalCompare.show([
      { lat: seg.startLat, lng: seg.startLng },
      { lat: seg.endLat, lng: seg.endLng }
    ]);
  }

  /** Xử lý khi user chọn tuyến từ compare modal */
  onCompareRouteSelected(event: CompareRouteResult) {
    const segIndex = this._currentMapSegmentIndex;
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;

    if (event.provider === 'google') {
      this._notif.printConfirmationDialog(
        'Nếu chọn Bản đồ Google Maps thì hiện tại chưa lấy được thông tin về Trạm thu phí. Bạn có tiếp tục không?',
        () => this._applyCompareRoute(event, segIndex, seg, false)
      );
    } else {
      this._applyCompareRoute(event, segIndex, seg, true);
    }
  }

  private _rebuildDispatchSummarize() {
    const lines = (this.entity.segments || [])
      .map((s, i) => s.note?.trim() ? `Chặng ${i + 1}: ${s.note.trim()}` : null)
      .filter(l => !!l);
    this.entity.dispatchSummarize = lines.join('\n');
  }

  private _applyCompareRoute(event: CompareRouteResult, segIndex: number, seg: TransportOrderSegment, fetchToll: boolean) {
    seg.distanceKm = +(event.km).toFixed(1);
    seg.routePolyline = event.polyline;
    if (event.note) {
      seg.note = seg.note?.trim() ? `${seg.note.trim()}\n${event.note}` : event.note;
    }
    this._rebuildDispatchSummarize();
    seg.listWaypoints = event.steps.map((s, i) => ({
      orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM
    }));
    if (seg.payloadWeight) {
      const quota = this.listOilQuota.find(x => x.id === seg.payloadWeight);
      if (quota) {
        seg.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
        seg.fuelAmountCalculated = +(seg.fuelNorm * seg.distanceKm / 100).toFixed(2);
      }
    }
    this.calculateTotal();
    this.calulateOil();
    if (fetchToll) {
      const pts = event.steps.filter(s => s.lat && s.lng).map(s => ({ lat: s.lat, lng: s.lng }));
      this._fetchTollForSegment(segIndex, pts.length >= 2 ? pts : undefined);
    } else {
      seg.listStations = [];
      seg.etcCost = 0;
    }
  }


  /** Xử lý khi user chọn tuyến từ Google Maps modal */
  onGoogleRouteSelected(event: { summary: string; km: number; steps: { lat: number; lng: number; name: string; distanceM: number }[]; polyline: string }) {
    const seg = this.entity.segments?.[this._currentMapSegmentIndex];
    if (!seg) return;
    seg.distanceKm = +(event.km).toFixed(1);
    seg.routePolyline = event.polyline;
    seg.listWaypoints = event.steps.map((s, i) => ({
      orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM
    }));
    if (seg.payloadWeight) {
      const quota = this.listOilQuota.find(x => x.id === seg.payloadWeight);
      if (quota) {
        seg.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
        seg.fuelAmountCalculated = +(seg.fuelNorm * seg.distanceKm / 100).toFixed(2);
      }
    }
    this.calculateTotal();
    this.calulateOil();
    this._fetchTollForSegment(this._currentMapSegmentIndex);
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
  onRouteSelected(event: { summary: string; km: number; waypoints: { lat: number; lng: number }[]; steps: { lat: number; lng: number; name: string; distanceM: number }[]; polyline: string; tollStations?: SegmentStation[] }) {
    if (this._currentMapSegmentIndex !== null) {
      const seg = this.entity.segments?.[this._currentMapSegmentIndex];
      if (seg) {
        seg.distanceKm = +(event.km).toFixed(1);
        seg.routePolyline = event.polyline;
        seg.listWaypoints = event.steps.map((s, i) => ({ orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM }));
        if (event.tollStations?.length) {
          seg.listStations = event.tollStations;
        }
        if (seg.payloadWeight) {
          const quota = this.listOilQuota.find(x => x.id === seg.payloadWeight);
          if (quota) {
            seg.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
            seg.fuelAmountCalculated = +(seg.fuelNorm * seg.distanceKm / 100).toFixed(2);
          }
        }
        this._applyTollPrices();
        this.calulateOil();
      }
    }
    this._currentMapSegmentIndex = null;
  }

  // ── THÊM ĐIỂM THỦ CÔNG ──

  toggleAddCustomPoint() {
    this.showAddCustomPoint = !this.showAddCustomPoint;
    if (!this.showAddCustomPoint) {
      this.selectedCustomLocation = null;
    } else {
      this.locFilter = { address: '', type: '' };
      this.locSortCol = 'address';
      this.locSortDir = 'asc';
    }
  }

  confirmAddCustomPoint() {
    if (this.lastSegmentFinal) return;
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
        seg.listStations = this._parseTollStations(res.toll);
      });
      this._applyTollPrices();
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
        const stations = this._parseTollStations(res.toll);

        this.entity.segments.forEach((seg, i) => {
          seg.distanceKm = i === 0 ? totalKm : 0;
          seg.listStations = i === 0 ? stations : [];
        });
        this._applyTollPrices();
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
      seg.listStations = this._parseTollStations(res.toll);
      this._applyTollPrices();
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
      if (this.entity.vehicleId !== id) return;
      if (res.code === '200' || res.code === '201') {
        this.listOilQuota = res.data?.listOilQuota || [];
        this._vehicleBotTypeId = res.data?.vihicleTypeBotId ?? null;
      } else {
        this.listOilQuota = [];
        this._vehicleBotTypeId = null;
      }
      this._applyTollPrices();
    });
  }

  onVehicleChange(event: Vihicle) {
    if (!event) {
      this.entity.vehicleId = undefined;
      this.entity.vehiclelLicensePlates = '';
      this.entity.vehicleType = undefined;
      this.listOilQuota = [];
      this._vehicleBotTypeId = null;
      this._applyTollPrices();
      return;
    }
    const vehicle = this.listVehicles.find(v => v.id === event.id) ?? event;
    this.entity.vehicleId = vehicle.id;
    this.entity.vehiclelLicensePlates = vehicle.licensePlates;
    this.entity.vehicleType = vehicle.vihicleTypeId;
    const driver = this.listEmployees.find(e => e.id === vehicle.employeeId);
    this.entity.driverId = vehicle.employeeId;
    this.entity.driverName = driver?.employeeFullName || '';
    this.entity.driverTel = driver?.telephone || '';
    this.entity.fuelDriverId = vehicle.employeeId;
    this.loadVehicle(vehicle.id);
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

  confirmRoute() {
    if (this.locations.length < 2) {
      this._notif.printErrorMessage('Lộ trình cần ít nhất 2 điểm');
      return;
    }
    if (!this.entity.driverId) {
      this._notif.printErrorMessage('Vui lòng chọn lái xe trước khi chốt cung đường');
      return;
    }
    const missingPayload = this.entity.segments?.some(s => !s.payloadWeight);
    if (missingPayload) {
      this._notif.printErrorMessage('Vui lòng chọn tải trọng cho tất cả các chặng trước khi chốt cung đường');
      return;
    }
    const missingFuelNorm = this.entity.segments?.some(s => !s.fuelNorm || s.fuelNorm <= 0);
    if (missingFuelNorm) {
      this._notif.printErrorMessage('Định mức dầu phải > 0 — vui lòng chọn xe có định mức dầu trước khi chốt cung đường');
      return;
    }
    if (this.entity.vehicleType === 16 && this.entity.moocId == null) {
      this._notif.printErrorMessage('Xe Container bắt buộc phải chọn Mooc trước khi chốt cung đường');
      return;
    }
    this.isSaving = true;
    const user = this._authService.getLoggedInUser();
    this.entity.branchId = +user.branchId;
    this._transportService.add(this.entity).subscribe({
      next: res => {
        this.isSaving = false;
        if (res.code === '200') {
          this.entity.id = res.data?.id;
          this.entity.refNo = res.data?.refNo;
          this.routeConfirmed = true;
          this.showVehiclePanel = true;
          this._notif.printSuccessMessage('Đã chốt cung đường — Lệnh ' + (this.entity.refNo || ''));
        } else {
          this._notif.printErrorMessage(res.message || 'Có lỗi xảy ra');
        }
      },
      error: () => { this.isSaving = false; this._notif.printErrorMessage('Lỗi kết nối server'); }
    });
  }

  save() {
    if (!this.entity.vehicleId) {
      this._notif.printErrorMessage('Vui lòng chọn biển số xe');
      return;
    }
    if (!this.entity.driverId) {
      this._notif.printErrorMessage('Vui lòng chọn tài xế');
      return;
    }
    this.isSaving = true;
    this._transportService.update(this.entity).subscribe({
      next: res => {
        this.isSaving = false;
        if (res.code === '200') {
          this._notif.printSuccessMessage('Lưu lệnh vận chuyển thành công');
          this.SaveSuccess.emit(res.data);
          this.hide();
        } else {
          this._notif.printErrorMessage(res.message || 'Có lỗi xảy ra');
        }
      },
      error: () => { this.isSaving = false; this._notif.printErrorMessage('Lỗi kết nối server'); }
    });
  }

  updateState(status: number, feedback?: string) {
    const item = Object.assign({}, this.entity);
    item.status = status;
    if (feedback !== undefined) item.feedback = feedback;
    this._transportService.update(item).subscribe({
      next: res => {
        if (res.code === '200') {
          this._notif.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
          this.hide();
        } else {
          this._notif.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
        }
      }
    });
  }

  duyetB1() {
    this._notif.printConfirmationYesNo('Chốt duyệt B1 lệnh vận chuyển?', () => {
      this._transportService.update(this.entity).subscribe({
        next: res => { if (res.code === '200') this.updateState(3); }
      });
    }, () => { });
  }

  duyetB2() {
    this._notif.printConfirmationYesNo('Duyệt B2 lệnh vận chuyển?', () => {
      this.updateState(4);
    }, () => { });
  }

  chotLenh() {
    this._notif.printConfirmationYesNo('Chốt lệnh vận chuyển này?', () => {
      this.updateState(6);
    }, () => { });
  }

  tuchoiB1() {
    const retVal = prompt('Lý do từ chối duyệt B2', '');
    if (retVal && retVal.length > 0) this.updateState(2, retVal);
  }

  tuchoiChotLenh() {
    const retVal = prompt('Lý do từ chối chốt lệnh', '');
    if (retVal && retVal.length > 0) this.updateState(3, retVal);
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
      const prev = existing.find(s => s.startLocationId === loc.locationId && s.endLocationId === next.locationId);
      if (!prev && loc.locationId && next.locationId) {
        this._fetchSegmentHistory(i, loc.locationId, loc.locationType ?? 1, next.locationId, next.locationType ?? 1);
      }
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
        distanceKm: prev?.distanceKm ?? 0,
        payloadWeight: prev?.payloadWeight,
        fuelNorm: prev?.fuelNorm,
        fuelAmountCalculated: prev?.fuelAmountCalculated,
        routePolyline: prev?.routePolyline,
        listWaypoints: prev?.listWaypoints ?? [],
        listStations: prev?.listStations ?? []
      };
    });
    this.segmentCalculating = new Array(this.entity.segments.length).fill(false);
    this.calculateTotal();
    this.calulateOil();
  }

  private _fetchSegmentHistory(index: number, startId: number, startType: number, endId: number, endType: number) {
    this._transportService.getSegmentHistory(startId, startType, endId, endType).subscribe({
      next: res => {
        if (res?.code !== '200' || !res.data) return;
        const seg = this.entity.segments?.[index];
        if (!seg || seg.startLocationId !== startId || seg.endLocationId !== endId) return;
        const d = res.data;
        if (d.routePolyline) {
          seg.routePolyline = d.routePolyline;
          if (d.distanceKm) seg.distanceKm = d.distanceKm;
          if (d.fuelNorm) seg.fuelNorm = d.fuelNorm;
          if (d.fuelAmountCalculated) seg.fuelAmountCalculated = d.fuelAmountCalculated;
          if (d.etcCost) seg.etcCost = d.etcCost;
        }
        if (d.waypointsJson) {
          try { seg.listWaypoints = JSON.parse(d.waypointsJson); } catch { }
        }
        // Chỉ load stations từ defaults (isDefault=true), không load từ lịch sử lệnh
        if (d.isDefault && d.listStations?.length) seg.listStations = d.listStations;
        this._applyTollPrices();
        this.calulateOil();
      }
    });
  }

  saveSegmentDefault(index: number) {
    const seg = this.getSegment(index);
    if (!seg?.distanceKm || !seg.startLocationId || !seg.endLocationId) return;
    const payload: RouteSegmentDefault = {
      startLocationId: seg.startLocationId,
      startLocationType: seg.startLocationType ?? 1,
      endLocationId: seg.endLocationId,
      endLocationType: seg.endLocationType ?? 1,
      distanceKm: seg.distanceKm,
      fuelNorm: seg.fuelNorm,
      fuelAmountCalculated: seg.fuelAmountCalculated,
      etcCost: seg.etcCost,
      routePolyline: seg.routePolyline,
      waypointsJson: seg.listWaypoints?.length ? JSON.stringify(seg.listWaypoints) : null,
      listStations: seg.listStations ?? []
    };
    this._transportService.saveSegmentDefault(payload).subscribe({
      next: res => {
        if (res?.code === '200') this._notif.printSuccessMessage('Đã lưu làm mặc định cho cung đường này.');
      },
      error: () => this._notif.printErrorMessage('Lưu mặc định thất bại.')
    });
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

  /** Parse toll data từ VietMap response — build SegmentStation với allPrices đầy đủ */
  private _parseTollStations(tollData: any): SegmentStation[] {
    if (!tollData || !Array.isArray(tollData)) return [];
    // Build map: vietmapId → {vehicle: price}
    const priceMap: { [id: number]: { [v: number]: number } } = {};
    tollData.forEach((entry: any) => {
      entry.data?.tolls?.forEach((t: any) => {
        if (!priceMap[t.id]) priceMap[t.id] = {};
        priceMap[t.id][entry.vehicle] = t.price || 0;
      });
    });
    // Lấy danh sách trạm từ vehicle=1 (tên nhất quán giữa các loại)
    const base = tollData.find((t: any) => t.vehicle === 1);
    if (!base?.data?.tolls) return [];
    return base.data.tolls.map((t: any) => ({
      vietmapId: t.id,
      stationName: t.name || 'Trạm thu phí',
      price: 0,
      allPrices: JSON.stringify(priceMap[t.id] || {})
    }));
  }

  // vihicleTypeBotId (DB) → Vietmap vehicle type key (1-5)
  private readonly _botTypeMap: Record<number, number> = { 1132: 1, 1133: 2, 1134: 3, 1135: 4, 1136: 5 };

  private _applyTollPrices() {
    const vietmapKey = this._vehicleBotTypeId ? (this._botTypeMap[this._vehicleBotTypeId] ?? null) : null;
    (this.entity.segments || []).forEach(seg => {
      (seg.listStations || []).forEach(station => {
        if (!station.allPrices) return;
        try {
          const prices = JSON.parse(station.allPrices);
          station.price = vietmapKey ? (prices[vietmapKey] || 0) : 0;
        } catch { station.price = 0; }
      });
    });
    this.calculateTotal();
  }

  private _fetchTollForSegment(segIndex: number, waypoints?: { lat: number; lng: number }[]) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg?.startLat || !seg?.endLat) return;
    const points = (waypoints?.length >= 2)
      ? waypoints
      : [{ lat: seg.startLat, lng: seg.startLng }, { lat: seg.endLat, lng: seg.endLng }];
    this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, { points })
      .pipe(catchError(() => of(null))).subscribe(res => {
        if (res?.toll) {
          seg.listStations = this._parseTollStations(res.toll);
          this._applyTollPrices();
        }
      });
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
      this.listVehiclesFiltered = (res.data || []).filter(v => ![17, 18, 1309].includes(v.vihicleTypeId));
    });
  }

  private _loadDropdowns() {
    const user = this._authService.getLoggedInUser();
    const branchId = user?.branchId?.toString() || '0';

    forkJoin({
      vehicles: this._vihicleService.getAll(new HttpParams().set('branchid', branchId).set('vihicletype', '0')),
      moocs: this._vihicleService.getAllMooc(new HttpParams().set('branchid', branchId))
    }).subscribe(({ vehicles, moocs }: { vehicles: ResponseValue<Vihicle[]>, moocs: ResponseValue<Vihicle[]> }) => {
      this.listMoocs = [
        { id: 0, licensePlates: 'Đầu kéo không' } as Vihicle,
        ...(moocs.data || [])
      ];
      this.listVehicles = (vehicles.data || []).filter(v => ![17, 18, 1309].includes(v.vihicleTypeId));
    });

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
