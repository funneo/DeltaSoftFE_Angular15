import { Component, EventEmitter, NgZone, Output, ViewChild, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { NotificationService, UtilityService, EmployeeService, OtherCategoriesService, SupplierService, AuthService, VihicleService } from '@app/shared/services';
import { TransportOrderService } from '@app/shared/services/transports/transport-order.service';
import { TransportOrder, TransportOrderSegment, TransportOrderSegmentEtc } from '@app/shared/models/transports/dispatchorders/transport-order.model';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { Vihicle, Employee, OtherCategories, Supplier } from '@app/shared/models';

@Component({
  selector: 'modal-transport-order',
  templateUrl: './modal-transport-order.component.html',
  styleUrls: ['./modal-transport-order.component.scss']
})
export class ModalTransportOrderComponent {
  @ViewChild('modalMain', { static: false }) modalMain: ModalDirective;
  @Output() SaveSuccess = new EventEmitter<any>();

  public entity: TransportOrder = {};
  public locations: any[] = [];
  public fetchMode: 'history' | 'api-seg' | 'api-full' = 'history';
  public isMapLoading = false;
  public isSubcontractor = false;

  // Lists for dropdowns
  public listVehicles: Vihicle[] = [];
  public listVehicleTypes: OtherCategories[] = [];
  public listDrivers: Employee[] = [];
  public listSuppliers: Supplier[] = [];

  private map: any;
  private markers: any[] = [];
  private routeLines: string[] = [];

  constructor(
    private _notif: NotificationService,
    private _transportService: TransportOrderService,
    private _vihicleService: VihicleService,
    private _employeeService: EmployeeService,
    private _otherService: OtherCategoriesService,
    private _supplierService: SupplierService,
    private _authService: AuthService,
    private http: HttpClient,
    private ngZone: NgZone
  ) { }

  /**
   * Mở modal để tạo mới từ danh sách Shipping Tasks
   */
  add(listTasks: ShippingTask[]) {
    this._resetEntity();
    this.entity.listDetailed = listTasks.map(t => ({ shippingTaskId: t.id, shippingTaskItem: t }));

    // Tổng hợp danh sách location duy nhất từ các tasks
    this._extractLocations(listTasks);

    this.modalMain.show();
  }

  /**
   * Mở modal để chỉnh sửa
   */
  edit(id: number) {
    this._transportService.getById(id).subscribe(res => {
      if (res.code === '200') {
        this.entity = res.data;
        // Map locations for UI list
        this._extractLocationsFromSegments();
        this.modalMain.show();
      }
    });
  }

  hide() {
    this.modalMain.hide();
  }

  onModalShown() {
    this._loadMapsScript().then(() => this._createMap());
    // Load initial data if needed
    this._loadDropdowns();
  }

  setFetchMode(mode: 'history' | 'api-seg' | 'api-full') {
    this.fetchMode = mode;
    this._fetchRouteData();
  }

  onDropLocation(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.locations, event.previousIndex, event.currentIndex);
    this._fetchRouteData();
  }

  removeLocation(index: number) {
    this.locations.splice(index, 1);
    this._fetchRouteData();
  }

  addManualLocation() {
    // Logic to open a sub-modal or add a search box for locations
    this._notif.printMessage('Tính năng thêm điểm dừng tự do đang phát triển');
  }

  addManualEtc(segmentIndex: number) {
    if (!this.entity.segments[segmentIndex].listEtc) {
      this.entity.segments[segmentIndex].listEtc = [];
    }
    this.entity.segments[segmentIndex].listEtc.push({
      stationName: 'Trạm mới',
      price: 0
    });
  }

  removeEtc(segmentIndex: number, etcIndex: number) {
    this.entity.segments[segmentIndex].listEtc.splice(etcIndex, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    let totalKm = 0;
    let totalEtc = 0;
    this.entity.segments?.forEach(s => {
      totalKm += (s.distanceKm || 0);
      let segEtc = 0;
      s.listEtc?.forEach(e => segEtc += (e.price || 0));
      s.etcCost = segEtc;
      totalEtc += segEtc;
    });
    this.entity.tongKm = totalKm;
    // this.entity.etcCost = totalEtc; // Add to model if needed or use local var
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
    // Logic when switching between own fleet and subcontractor
    this.entity.vehicleId = undefined;
    this.entity.driverId = undefined;
    this.entity.driverName = '';
    this.entity.driverTel = '';
  }

  save() {
    if (!this.entity.vehicleId) {
      this._notif.printErrorMessage('Vui lòng chọn số xe');
      return;
    }

    const action = this.entity.id ? this._transportService.update(this.entity) : this._transportService.add(this.entity);
    action.subscribe(res => {
      if (res.code === '200') {
        this._notif.printSuccessMessage('Lưu lệnh vận chuyển thành công');
        this.SaveSuccess.emit(res.data);
        this.hide();
      } else {
        this._notif.printErrorMessage(res.message);
      }
    });
  }

  // ── PRIVATE METHODS ──

  private _resetEntity() {
    this.entity = {
      segments: [],
      listFee: [],
      listDetailed: [],
      status: 0,
      tongKm: 0,
      vehicleType: 0,
      isSubcontractors: false
    };
    this.locations = [];
    this.fetchMode = 'history';
    this.isSubcontractor = false;
  }

  private _extractLocations(tasks: ShippingTask[]) {
    const locs = [];
    tasks.forEach(t => {
      // Add Pick location
      locs.push({
        locationId: t.pickupLocationId,
        locationName: t.pickupLocation,
        lat: t.pickupLatitude,
        lng: t.pickupLongitude
      });
      // Add Delivery location
      locs.push({
        locationId: t.deliveryLocationId,
        locationName: t.deliveryLocation,
        lat: t.deliveryLatitude,
        lng: t.deliveryLongitude
      });
    });
    // Remove duplicates (by locationId)
    this.locations = locs.filter((v, i, a) => a.findIndex(t => t.locationId === v.locationId) === i);
  }

  private _extractLocationsFromSegments() {
    // Reconstruct locations array from existing segments
    if (!this.entity.segments?.length) return;
    const locs = [];
    this.entity.segments.forEach((s, idx) => {
      if (idx === 0) {
        locs.push({ locationId: s.startLocationId, locationName: s.startLocationName, lat: s.startLat, lng: s.startLng });
      }
      locs.push({ locationId: s.endLocationId, locationName: s.endLocationName, lat: s.endLat, lng: s.endLng });
    });
    this.locations = locs;
  }

  private _fetchRouteData() {
    if (this.locations.length < 2) return;

    if (this.fetchMode === 'history') {
      this._fetchFromHistory();
    } else {
      this._fetchFromVietMap(this.fetchMode === 'api-full');
    }
  }

  private _fetchFromHistory() {
    this.entity.segments = [];
    const observables = [];
    for (let i = 0; i < this.locations.length - 1; i++) {
      const start = this.locations[i];
      const end = this.locations[i + 1];
      observables.push(this._transportService.getSegmentHistory(start.locationId, end.locationId));
    }

    // Process sequentially or using forkJoin
    // Simplified for now
    this.entity.segments = this.locations.slice(0, -1).map((loc, i) => {
      const next = this.locations[i + 1];
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
        distanceKm: 0,
        listEtc: []
      };
    });

    // Actually call history for each segment
    this.entity.segments.forEach((seg, idx) => {
      this._transportService.getSegmentHistory(seg.startLocationId, seg.endLocationId).subscribe(res => {
        if (res.code === '200' && res.data) {
          seg.distanceKm = res.data.distanceKm;
          seg.listEtc = res.data.listEtc || [];
          this.calculateTotal();
        }
      });
    });

    this._drawOnMap();
  }

  private _fetchFromVietMap(isFullRoute: boolean) {
    this.isMapLoading = true;
    const points = this.locations.map(l => ({ lat: l.lat, lng: l.lng }));

    this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, { points: points })
      .subscribe(res => {
        this.isMapLoading = false;
        if (res.route?.paths?.[0]) {
          this._processVietMapResponse(res, isFullRoute);
          this._drawOnMap(res.route.paths[0].points);
        }
      }, err => {
        this.isMapLoading = false;
        this._notif.printErrorMessage('Không thể kết nối API VietMap');
      });
  }

  private _processVietMapResponse(res: any, isFullRoute: boolean) {
    const path = res.route.paths[0];
    // Logic to split path into segments or just one big segment
    // For now, let's create the segments based on our 'locations' array
    this.entity.segments = [];
    for (let i = 0; i < this.locations.length - 1; i++) {
      const start = this.locations[i];
      const next = this.locations[i + 1];

      // Find toll for this segment (complex if full-route)
      // This part needs refinement based on VietMap dynamic response
      this.entity.segments.push({
        orderIndex: i,
        startLocationId: start.locationId,
        startLocationName: start.locationName,
        startLat: start.lat,
        startLng: start.lng,
        endLocationId: next.locationId,
        endLocationName: next.locationName,
        endLat: next.lat,
        endLng: next.lng,
        distanceKm: i === 0 ? (path.distance / 1000) : 0, // Placeholder
        listEtc: []
      });
    }
  }

  // ── VIETMAP BOOTSTRAPPING ──

  private _loadMapsScript(): Promise<void> {
    const w = window as any;
    if (w.vietmapgl) return Promise.resolve();
    return new Promise(resolve => {
      if (!document.getElementById('vietmapCss')) {
        const link = document.createElement('link');
        link.id = 'vietmapCss'; link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.css';
        document.head.appendChild(link);
      }
      const waitForVietmap = () => {
        if (w.vietmapgl) resolve();
        else setTimeout(waitForVietmap, 100);
      };
      if (!document.getElementById('vietmapScript')) {
        const s = document.createElement('script');
        s.id = 'vietmapScript'; s.src = 'https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
        s.onload = () => waitForVietmap();
        document.head.appendChild(s);
      } else waitForVietmap();
    });
  }

  private _createMap() {
    const w = window as any;
    const tileApiKey = '261b145415dc3828f1fd75c98f9110e3c19d986d41cef544';
    w.vietmapgl.accessToken = tileApiKey;

    const center = this.locations.length > 0 ? [this.locations[0].lng, this.locations[0].lat] : [106.660172, 10.762622];

    this.map = new w.vietmapgl.Map({
      container: 'vietmap',
      style: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${tileApiKey}`,
      center: center,
      zoom: 10
    });

    this.map.on('load', () => {
      this._drawOnMap();
    });
  }

  private _drawOnMap(geometry?: any) {
    if (!this.map) return;
    const w = window as any;

    // 1. Draw Markers
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.locations.forEach((loc, idx) => {
      const el = document.createElement('div');
      el.className = `marker-pin ${idx === 0 ? 'start' : (idx === this.locations.length - 1 ? 'end' : '')}`;
      const marker = new w.vietmapgl.Marker(el)
        .setLngLat([loc.lng, loc.lat])
        .addTo(this.map);
      this.markers.push(marker);
    });

    // 2. Draw Polyline
    if (this.map.getSource('route')) {
      this.map.removeLayer('route-layer');
      this.map.removeSource('route');
    }
    if (geometry) {
      this.map.addSource('route', { 'type': 'geojson', 'data': { 'type': 'Feature', 'geometry': geometry } });
      this.map.addLayer({
        'id': 'route-layer', 'type': 'line', 'source': 'route',
        'paint': { 'line-color': '#007bff', 'line-width': 5 }
      });
      // Fit bounds
      const coordinates = geometry.coordinates;
      const bounds = coordinates.reduce((acc, coord) => acc.extend(coord), new w.vietmapgl.LngLatBounds(coordinates[0], coordinates[0]));
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }

  private _loadDropdowns() {
    const user = this._authService.getLoggedInUser();
    const branchId = user?.branchId || '0';

    // Vehicles
    const vParams = new HttpParams({
      fromObject: { branchid: branchId, vihicletype: '0' }
    });
    this._vihicleService.getAll(vParams).subscribe(res => {
      this.listVehicles = res.data || [];
    });

    // Vehicle Types
    const vtParams = new HttpParams({
      fromObject: { type: 'VIHITYPE' }
    });
    this._otherService.getAll(vtParams).subscribe(res => {
      this.listVehicleTypes = res.data || [];
    });

    // Drivers
    const eParams = new HttpParams({
      fromObject: { branchId: branchId }
    });
    this._employeeService.getAll(eParams).subscribe(res => {
      this.listDrivers = (res.data || []).filter(x => x.departmentId == 1147);
    });

    // Suppliers
    const sParams = new HttpParams({
      fromObject: { branchid: branchId }
    });
    this._supplierService.getAll(sParams).subscribe(res => {
      this.listSuppliers = res.data || [];
    });
  }
}
