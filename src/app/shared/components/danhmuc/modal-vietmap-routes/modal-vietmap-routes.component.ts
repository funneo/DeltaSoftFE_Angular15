import { Component, ElementRef, EventEmitter, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '@app/shared/services';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { SegmentStation } from '@app/shared/models/transports/dispatchorders/transport-order.model';

export interface TollStation {
  id?: number;
  name: string;
  cost: string | null;
  priceRaw?: number;
}

export interface VehicleCostRow {
  label: string;
  icon: string;
  cost: number | null;
  costVetc: number | null;
  isEstimated: boolean;
  note?: string;
}

export interface TollInfo {
  totalCost: string | null;
  currency: string;
  stationCount: number;
  stations: TollStation[];
  vehicleCosts: VehicleCostRow[];
  dataFromApi: boolean;
  hasEvDiscount: boolean;
  apiError?: string;
}

export interface RouteOption {
  index: number;
  summary: string;
  distanceText: string;
  distanceValue: number;
  durationText: string;
  durationValue: number;
  steps: { instructions: string; distance: string }[];
  tollInfo?: TollInfo | null;
  tollLoading?: boolean;
}

@Component({
  selector: 'modal-vietmap-routes',
  templateUrl: './modal-vietmap-routes.component.html',
  styleUrls: ['./modal-vietmap-routes.component.css']
})
export class ModalVietmapRoutesComponent implements OnDestroy {
  @ViewChild('modalRoutes', { static: false }) modalRoutes: ModalDirective;
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
  @Output() RouteSelected = new EventEmitter<{
    summary: string;
    km: number;
    waypoints: { lat: number; lng: number }[];
    steps: { lat: number; lng: number; name: string; distanceM: number }[];
    polyline: string;
    tollStations: SegmentStation[];
  }>();

  public lstRoutes: RouteOption[] = [];
  public flagGettingRoutes = false;
  public flagMapInitializing = true;
  public expandedRouteIndex: number | null = 0;

  private map: any;
  private routeLineId = 'route-line';
  private markers: any[] = [];
  private waypoints: { lat: number, lng: number }[] = [];
  private currentSteps: { lat: number; lng: number; name: string; distanceM: number }[] = [];
  private currentPolyline: string = null; // JSON [[lng,lat],...] raw geometry
  private fetchTimer: any;
  private _lastTollRaw: any[] = [];

  // Undo stack: lưu snapshot waypoints mỗi lần modify (click/dragend/reset)
  private waypointHistory: Array<{ lat: number; lng: number }[]> = [];
  private readonly HISTORY_LIMIT = 20;
  isSavedMode = false; // true = đang xem lộ trình đã lưu, không gọi lại API

  private originLat: number;
  private originLng: number;
  private destLat: number;
  private destLng: number;

  constructor(
    private _notif: NotificationService,
    private ngZone: NgZone,
    private http: HttpClient
  ) { }

  show(lat: number, lng: number, destLat: number, destLng: number): void;
  show(points: { lat: number; lng: number }[]): void;
  show(latOrPoints: number | { lat: number; lng: number }[], lng?: number, destLat?: number, destLng?: number) {
    this.isSavedMode = false;
    if (Array.isArray(latOrPoints)) {
      this.waypoints = [...latOrPoints];
      this.originLat = latOrPoints[0]?.lat;
      this.originLng = latOrPoints[0]?.lng;
      this.destLat = latOrPoints[latOrPoints.length - 1]?.lat;
      this.destLng = latOrPoints[latOrPoints.length - 1]?.lng;
    } else {
      this.originLat = latOrPoints; this.originLng = lng;
      this.destLat = destLat; this.destLng = destLng;
      this.waypoints = [
        { lat: latOrPoints, lng: lng },
        { lat: destLat, lng: destLng }
      ];
    }
    this.lstRoutes = [];
    this.flagMapInitializing = true;
    this.expandedRouteIndex = 0;
    this.waypointHistory = [];   // mở modal mới → reset stack undo
    this.modalRoutes.show();
  }

  /** Mở bản đồ với lộ trình đã lưu — không gọi lại API */
  showSaved(
    savedSteps: { lat: number; lng: number; name: string; distanceM: number }[],
    polyline?: string,
    tollStations?: { stationName: string; price: number }[]
  ) {
    if (!savedSteps?.length) return;
    this.isSavedMode = true;
    this.currentSteps = [...savedSteps];
    this.currentPolyline = polyline || null;
    this.waypoints = savedSteps.map(s => ({ lat: s.lat, lng: s.lng }));
    this.originLat = savedSteps[0].lat;
    this.originLng = savedSteps[0].lng;
    this.destLat = savedSteps[savedSteps.length - 1].lat;
    this.destLng = savedSteps[savedSteps.length - 1].lng;

    const totalDistM = savedSteps.reduce((sum, s) => sum + (s.distanceM || 0), 0);

    let tollInfo: TollInfo | null = null;
    if (tollStations?.length) {
      const totalCost = tollStations.reduce((s, t) => s + (t.price || 0), 0);
      tollInfo = {
        totalCost: totalCost.toString(),
        currency: 'VND',
        stationCount: tollStations.length,
        stations: tollStations.map(t => ({
          name: t.stationName,
          cost: t.price ? `${t.price.toLocaleString('vi-VN')} ₫` : 'Miễn phí',
          priceRaw: t.price || 0
        })),
        vehicleCosts: [],
        dataFromApi: false,
        hasEvDiscount: false
      };
    }

    this.lstRoutes = [{
      index: 0,
      summary: 'Lộ trình đã lưu',
      distanceText: `${(totalDistM / 1000).toFixed(1)} km`,
      distanceValue: totalDistM,
      durationText: '',
      durationValue: 0,
      steps: savedSteps.map(s => ({ instructions: s.name, distance: s.distanceM + 'm' })),
      tollInfo,
      tollLoading: false
    }];

    this.flagMapInitializing = true;
    this.expandedRouteIndex = 0;
    this.modalRoutes.show();
  }

  onModalShown() {
    this._loadMapsScript().then(() => this._createMap());
  }

  private _afterMapLoad() {
    if (this.isSavedMode) {
      this._drawSavedRoute();
    } else {
      this._setupInteractions();
      this._fetchRoutesAndTolls();
    }
  }

  toggleRoute(index: number, event: Event | null) {
    if (event) {
      const t = event.target as HTMLElement;
      if (t.tagName.toLowerCase() === 'button' || t.closest('button')) return;
    }
    this.expandedRouteIndex = this.expandedRouteIndex === index ? null : index;
  }

  selectRoute(route: RouteOption) {
    // Build allPrices per station: {stationId → {vehicle: price}}
    const priceByStation: { [id: number]: { [v: number]: number } } = {};
    if (this._lastTollRaw) {
      this._lastTollRaw.forEach((entry: any) => {
        entry.data?.tolls?.forEach((t: any) => {
          if (!priceByStation[t.id]) priceByStation[t.id] = {};
          priceByStation[t.id][entry.vehicle] = t.price || 0;
        });
      });
    }

    const tollStations: SegmentStation[] = (route.tollInfo?.stations || []).map(s => ({
      vietmapId: s.id,
      stationName: s.name,
      price: s.priceRaw || 0,
      allPrices: JSON.stringify(priceByStation[s.id] || {})
    }));
    this.RouteSelected.emit({
      summary: route.summary,
      km: Math.round(route.distanceValue / 1000),
      waypoints: [...this.waypoints],
      steps: [...this.currentSteps],
      polyline: this.currentPolyline,
      tollStations
    });
    this.modalRoutes.hide();
  }

  formatTollCost(toll: TollInfo | null | undefined): string {
    if (!toll || toll.totalCost === null) return 'Không có dữ liệu';
    if (toll.totalCost === '0') return 'Miễn phí';
    return `${Number(toll.totalCost).toLocaleString('vi-VN')} ${toll.currency}`;
  }

  // ── PRIVATE: Vietmap Bootstrapping ──

  private _loadMapsScript(): Promise<void> {
    const w = window as any;
    if (w.vietmapgl) return Promise.resolve();

    return new Promise(resolve => {
      // Create CSS
      if (!document.getElementById('vietmapCss')) {
        const link = document.createElement('link');
        link.id = 'vietmapCss';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.css';
        document.head.appendChild(link);
      }
      
      // Create JS function to poll for vietmapgl
      const waitForVietmap = () => {
        if (w.vietmapgl) { resolve(); }
        else { setTimeout(waitForVietmap, 100); }
      };

      if (!document.getElementById('vietmapScript')) {
        const s = document.createElement('script');
        s.id = 'vietmapScript';
        s.src = 'https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
        s.onload = () => waitForVietmap();
        s.onerror = () => { console.error("Failed to load Vietmap GL JS"); resolve(); }; // resolve anyway to avoid stuck
        document.head.appendChild(s);
      } else {
        waitForVietmap();
      }
    });
  }

  private _createMap() {
    const el = this.mapContainer?.nativeElement;
    const w = window as any;
    if (!el || !w.vietmapgl) { setTimeout(() => this._createMap(), 200); return; }

    // API Key dành cho hình ảnh bản đồ (TileMap)
    const tileApiKey = '261b145415dc3828f1fd75c98f9110e3c19d986d41cef544';
    w.vietmapgl.accessToken = tileApiKey;

    this.map = new w.vietmapgl.Map({
      container: el,
      style: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${tileApiKey}`,
      center: [this.originLng, this.originLat],
      zoom: 11
    });

    this.map.on('load', () => {
      this.flagMapInitializing = false;
      this._afterMapLoad();
    });
  }

  private _setupInteractions() {
    // Nhấn chuột lên bản đồ để thêm điểm Waypoint (kéo thả)
    this.map.on('click', (e: any) => {
      const p = e.lngLat;
      // Lưu snapshot trước khi modify để có thể Undo
      this._pushHistory();
      // Khong click cho 2 diem dau/cuoi
      this.waypoints.splice(this.waypoints.length - 1, 0, { lat: p.lat, lng: p.lng });
      this._fetchRoutesAndTolls(); // Re-fetch immediately
    });
  }

  // ===== Undo stack =====
  /** Clone deep waypoints + push vào stack; cắt nếu vượt LIMIT. */
  private _pushHistory(): void {
    this.waypointHistory.push(this.waypoints.map(w => ({ lat: w.lat, lng: w.lng })));
    if (this.waypointHistory.length > this.HISTORY_LIMIT) {
      this.waypointHistory.shift();
    }
  }

  /** Số bước có thể undo (template binding). */
  public canUndo(): boolean { return this.waypointHistory.length > 0; }

  /** Số điểm trung gian user đã thêm (template binding badge). */
  public extraPointsCount(): number {
    return Math.max(0, this.waypoints.length - 2);
  }

  /** Quay lại snapshot gần nhất. */
  public undo(): void {
    if (!this.canUndo()) return;
    const prev = this.waypointHistory.pop();
    if (!prev || prev.length < 2) return;
    this.waypoints = prev;
    this._fetchRoutesAndTolls();
  }

  /** Xóa tất cả điểm trung gian — về cung đường gốc (start → end). */
  public resetRoute(): void {
    if (this.extraPointsCount() === 0) return;
    this._pushHistory(); // lưu để vẫn có thể undo lại sau khi reset
    this.waypoints = [
      { lat: this.originLat, lng: this.originLng },
      { lat: this.destLat, lng: this.destLng }
    ];
    this._fetchRoutesAndTolls();
  }

  private _drawMarkers() {
    const w = window as any;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.waypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === this.waypoints.length - 1;
      const color = isStart ? '#28a745' : (isEnd ? '#dc3545' : '#007bff');

      const marker = new w.vietmapgl.Marker({ draggable: true, color: color })
        .setLngLat([wp.lng, wp.lat])
        .addTo(this.map);

      // Lưu snapshot ngay khi BẮT ĐẦU kéo (dragstart) để Undo trả về vị trí cũ
      marker.on('dragstart', () => { this._pushHistory(); });

      marker.on('dragend', () => {
        const newPos = marker.getLngLat();
        this.waypoints[index] = { lat: newPos.lat, lng: newPos.lng };

        // Debounce fetch route
        if (this.fetchTimer) clearTimeout(this.fetchTimer);
        this.fetchTimer = setTimeout(() => {
          this._fetchRoutesAndTolls();
        }, 800); // 800ms debounce
      });

      this.markers.push(marker);
    });
  }

  private _drawSavedRoute() {
    this._drawMarkers();

    // Ưu tiên dùng full polyline (mượt), fallback về step points (thẳng)
    let coordinates: number[][];
    if (this.currentPolyline) {
      try { coordinates = JSON.parse(this.currentPolyline); } catch { coordinates = null; }
    }
    if (!coordinates?.length) {
      coordinates = this.currentSteps.map(s => [s.lng, s.lat]);
    }
    if (coordinates.length < 2) return;

    if (this.map.getSource('route')) {
      this.map.removeLayer('route-layer');
      this.map.removeSource('route');
    }

    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates }
      }
    });
    this.map.addLayer({
      id: 'route-layer',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#e67e22', 'line-width': 5, 'line-dasharray': [2, 1] }
    });

    // Fit bounds
    const lngs = coordinates.map(c => c[0]);
    const lats = coordinates.map(c => c[1]);
    this.map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 40 }
    );

    this.ngZone.run(() => { this.flagGettingRoutes = false; });
  }

  private _drawPolyline(encodedPolyline: string) {
    // Decode polyline or just pass the geojson if available from controller
    // For now we assume controller returns geojson or we just update standard layer
  }

  // ── PRIVATE: API Call to Backend Controller ──

  private _fetchRoutesAndTolls() {
    this.flagGettingRoutes = true;
    this.ngZone.run(() => {
      this.lstRoutes = [{
        index: 0,
        summary: 'Đang tải lộ trình...',
        distanceText: '...',
        distanceValue: 0,
        durationText: '...',
        durationValue: 0,
        steps: [],
        tollLoading: true
      }];
    });

    this._drawMarkers();

    // Gọi backend Controller do chúng ta tự viết
    this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, {
      points: this.waypoints
    }).subscribe(res => {
      this.flagGettingRoutes = false;
      this.ngZone.run(() => {
        this._processBackendResponse(res);
      });
    }, err => {
      this.flagGettingRoutes = false;
      this._notif.printErrorMessage('Lỗi khi lấy dữ liệu Vietmap Route/Toll');
    });
  }

  private _processBackendResponse(res: any) {
    // Parse result from VietmapApiController
    const routeNode = res.route?.paths?.[0];
    if (!routeNode) return;

    const distKm = (routeNode.distance / 1000).toFixed(1);
    const durationMin = Math.round(routeNode.time / 60000);

    // Extract toll info from the new toll array structure
    let tollInfo: TollInfo | null = null;
    if (res.toll && Array.isArray(res.toll) && res.toll.length > 0) {
      this._lastTollRaw = res.toll; // lưu để selectRoute() build allPrices

      let vehicleCosts = [];
      let allStations: any[] = [];
      let baseToll1 = res.toll.find((x: any) => x.vehicle === 1)?.data;
      
      if (baseToll1 && baseToll1.tolls) {
        allStations = baseToll1.tolls.map((t: any) => ({
          id: t.id,
          name: t.name,
          cost: t.price ? `${t.price.toLocaleString('vi-VN')} ₫` : 'Miễn phí',
          priceRaw: t.price || 0
        }));
      }

      const CAT_LABELS = [
        { v: 1, label: 'Loại 1 - Xe con <12 chỗ, <2T', icon: 'fa-car' },
        { v: 2, label: 'Loại 2 - Xe 12-30 chỗ, 2-4T', icon: 'fa-bus' },
        { v: 3, label: 'Loại 3 - Xe >30 chỗ, 4-10T', icon: 'fa-truck' },
        { v: 4, label: 'Loại 4 - Tải 10-18T, 20ft', icon: 'fa-truck' },
        { v: 5, label: 'Loại 5 - Tải >18T, 40ft', icon: 'fa-truck' }
      ];

      vehicleCosts = CAT_LABELS.map(cat => {
          const match = res.toll.find((x: any) => x.vehicle === cat.v);
          let cost = null;
          if (match && match.data && match.data.tolls) {
             cost = match.data.tolls.reduce((acc: number, t: any) => acc + (t.price || 0), 0);
          }
          return { label: cat.label, icon: cat.icon, cost: cost, costVetc: cost, isEstimated: false };
      });

      const totalCostV1 = vehicleCosts.find(c => c.v === 1)?.cost || 0;

      tollInfo = {
        totalCost: totalCostV1.toString(),
        currency: 'VND',
        stationCount: baseToll1?.tolls?.length || 0,
        stations: allStations,
        vehicleCosts: vehicleCosts,
        dataFromApi: true,
        hasEvDiscount: false
      };
    }

    // Lưu full polyline để vẽ đường mượt khi load lại
    const coords: [number, number][] = routeNode.points?.coordinates || [];
    this.currentPolyline = coords.length ? JSON.stringify(coords) : null;

    // Extract steps với lat/lng từ instruction points
    this.currentSteps = (routeNode.instructions || []).map((s: any) => {
      const ptIdx = s.interval?.[0] ?? 0;
      const coord = coords[ptIdx];
      return {
        lat: coord ? coord[1] : 0,
        lng: coord ? coord[0] : 0,
        name: s.text || '',
        distanceM: s.distance || 0
      };
    });

    this.lstRoutes = [{
      index: 0,
      summary: `Vietmap Tuyến Nhất`,
      distanceText: `${distKm} km`,
      distanceValue: routeNode.distance,
      durationText: `${durationMin} phút`,
      durationValue: routeNode.time,
      steps: this.currentSteps.map(s => ({ instructions: s.name, distance: s.distanceM + 'm' })),
      tollInfo: tollInfo,
      tollLoading: false
    }];

    // Vẽ lên map
    if (this.map.getSource('route')) {
      this.map.removeLayer('route-layer');
      this.map.removeSource('route');
    }

    // Nếu API trả về geometry (GeoJSON) từ Vietmap route
    if (routeNode.points && routeNode.points.coordinates) {
      this.map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': routeNode.points
        }
      });
      this.map.addLayer({
        'id': 'route-layer',
        'type': 'line',
        'source': 'route',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': { 'line-color': '#1a73e8', 'line-width': 6 }
      });

      // Fit bounds
      const bounds = routeNode.bbox;
      if (bounds) {
        this.map.fitBounds([
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]]
        ], { padding: 40 });
      }
    }
  }

  /**
   * Destroy WebGL Map instance + dọn backdrop. Vietmap GL giữ GPU context +
   * RAF loop + window event listeners — không gọi `map.remove()` thì sau vài
   * lần mở/đóng modal sẽ leak WebGL context (browser ngắt → CPU 100%).
   */
  ngOnDestroy(): void {
    try { this.modalRoutes?.hide?.(); } catch { /* swallow */ }
    try {
      if (this.fetchTimer) { clearTimeout(this.fetchTimer); this.fetchTimer = null; }
      if (this.markers?.length) {
        this.markers.forEach(m => { try { m?.remove?.(); } catch { /* */ } });
        this.markers = [];
      }
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    } catch { /* swallow */ }
    setTimeout(() => {
      if (typeof document !== 'undefined'
          && document.querySelectorAll('.modal.in, .modal.show').length === 0) {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
      }
    }, 250);
  }
}
