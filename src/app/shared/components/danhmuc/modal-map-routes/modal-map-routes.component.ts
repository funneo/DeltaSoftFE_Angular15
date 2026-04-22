import {
  Component, ElementRef, EventEmitter, NgZone, Output, ViewChild
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '@app/shared/services';
import { environment } from '@environments/environment';

declare var google: any;

export interface RoutePreferences {
  roadType: 'all' | 'highway' | 'national' | 'provincial';
  avoidTolls: boolean;
  avoidFerries: boolean;
}

interface VehicleCostRow {
  label: string;          // Tên loại xe
  icon: string;           // FA icon
  cost: number | null;    // VND không có thẻ (null = chưa có dữ liệu)
  costVetc: number | null;// VND khi dùng thẻ VETC/ePass (null = giống cost)
  isEstimated: boolean;   // true = ước tính từ tỷ lệ, false = từ Google API
  note?: string;          // Ghi chú thêm
}

interface TollStation {
  name: string;
  cost: string | null;
}

/** Kết quả từ Distance Matrix API v2 */
interface MatrixTollResult {
  baseCostVND: number;    // GASOLINE, không thẻ
  evCostVND:   number;    // ELECTRIC (= 0 nếu không khác GASOLINE)
  source:      'matrix' | 'routes' | 'none';
}

interface TollInfo {
  totalCost: string | null;      // tổng loại 2 (VND, string integer)
  currency: string;
  stationCount: number;
  stations: TollStation[];
  vehicleCosts: VehicleCostRow[];
  dataFromApi: boolean;           // true = Google có price data
  hasEvDiscount: boolean;         // true nếu EV rẻ hơn GASOLINE
  apiError?: string;
}

interface RouteOption {
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
  selector: 'modal-map-routes',
  templateUrl: './modal-map-routes.component.html',
  styleUrls: ['./modal-map-routes.component.css']
})
export class ModalMapRoutesComponent {
  @ViewChild('modalRoutes',  { static: false }) modalRoutes: ModalDirective;
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
  @Output() RouteSelected = new EventEmitter<{
    summary: string;
    km: number;
    steps: { lat: number; lng: number; name: string; distanceM: number }[];
    polyline: string;
  }>();

  // ── State ────────────────────────────────────────
  public lstRoutes: RouteOption[]          = [];
  public flagGettingRoutes                 = false;
  public flagMapInitializing               = true;
  public expandedRouteIndex: number | null = null;
  public showPreferences                   = false;
  public readonly routeColors              = ['#1a73e8', '#34a853', '#ff6d00', '#9c27b0', '#00bcd4'];

  public preferences: RoutePreferences = { roadType: 'all', avoidTolls: false, avoidFerries: false };

  public readonly roadTypeOptions = [
    { value: 'all',        label: 'Tất cả loại đường', icon: 'fa-road',       color: '#6c757d', desc: 'Google tự chọn tuyến nhanh nhất' },
    { value: 'highway',    label: 'Ưu tiên Cao tốc',   icon: 'fa-tachometer', color: '#1a73e8', desc: 'Ưu tiên đường cao tốc' },
    { value: 'national',   label: 'Tránh Cao tốc',     icon: 'fa-map-signs',  color: '#fd7e14', desc: 'Đi quốc lộ, tránh cao tốc' },
    { value: 'provincial', label: 'Tránh Toll',         icon: 'fa-ban',        color: '#e63946', desc: 'Tránh cả cao tốc lẫn trạm thu phí' },
  ];

  // ── Internal Maps state ───────────────────────────
  private map: any;
  private activeRenderer: any                = null;
  private activeRendererIndex: number | null = null;
  private altPolylines: any[]               = [];
  private lastDirectionsResult: any         = null;
  private pendingFetch                       = false;

  private originLat: number;
  private originLng: number;
  private destLat: number;
  private destLng: number;

  public get math() { return Math; }

  constructor(private _notif: NotificationService, private ngZone: NgZone) {}

  // ── PUBLIC API ────────────────────────────────────

  show(lat: number, lng: number, destLat: number, destLng: number) {
    this.originLat = lat; this.originLng = lng;
    this.destLat   = destLat; this.destLng = destLng;
    this.lstRoutes          = [];
    this.expandedRouteIndex = null;
    this.showPreferences    = false;
    this.flagMapInitializing = true;
    this.pendingFetch        = true;
    this.preferences        = { roadType: 'all', avoidTolls: false, avoidFerries: false };
    this._clearAll();
    this.modalRoutes.show();
  }

  onModalShown() {
    this._loadMapsScript().then(() => this._createMap());
  }

  applyPreferences() {
    this.showPreferences = false;
    this._fetchRoutes();
  }

  toggleRoute(index: number, event: Event | null) {
    if (event) {
      const t = event.target as HTMLElement;
      if (t.tagName.toLowerCase() === 'button' || t.closest('button')) return;
    }

    if (this.expandedRouteIndex === index) {
      // Chỉ collapse danh sách, KHÔNG đụng vào bản đồ
      this.expandedRouteIndex = null;
      return;
    }

    // Mở rộng + chuyển tuyến active trên bản đồ
    this.expandedRouteIndex = index;
    this._switchActiveRoute(index);
  }

  selectRoute(route: RouteOption) {
    let polyline = '';
    let steps: { lat: number; lng: number; name: string; distanceM: number }[] = [];

    if (this.activeRenderer) {
      const dir = this.activeRenderer.getDirections();
      const r0 = dir?.routes?.[0];
      if (r0) {
        const encoded: string = r0.overview_polyline?.points || '';
        if (encoded && (window as any).google?.maps?.geometry?.encoding) {
          const path = (window as any).google.maps.geometry.encoding.decodePath(encoded);
          const coords: [number, number][] = path.map((ll: any) => [ll.lng(), ll.lat()]);
          polyline = JSON.stringify(coords);
        }
        const leg = r0.legs?.[0];
        if (leg?.steps) {
          steps = leg.steps.map((s: any) => ({
            lat: s.start_location?.lat?.() ?? s.start_location?.lat ?? 0,
            lng: s.start_location?.lng?.() ?? s.start_location?.lng ?? 0,
            name: s.instructions || '',
            distanceM: s.distance?.value || 0
          }));
        }
      }
    }

    this.RouteSelected.emit({ summary: route.summary, km: Math.round(route.distanceValue / 1000), steps, polyline });
    this.modalRoutes.hide();
  }

  // ── Template helpers ──────────────────────────────
  getRoadTypeColor(v: string)  { return this.roadTypeOptions.find(o => o.value === v)?.color  || '#6c757d'; }
  getRoadTypeIcon(v: string)   { return this.roadTypeOptions.find(o => o.value === v)?.icon   || 'fa-road'; }
  getRoadTypeLabel(v: string)  { return this.roadTypeOptions.find(o => o.value === v)?.label  || ''; }

  getPreferencesSummary(): string {
    const parts = [this.getRoadTypeLabel(this.preferences.roadType)];
    if (this.preferences.avoidTolls)   parts.push('Tránh toll');
    if (this.preferences.avoidFerries) parts.push('Tránh phà');
    return parts.join(' · ');
  }

  hasNonDefaultPreferences(): boolean {
    return this.preferences.roadType !== 'all'
        || this.preferences.avoidTolls
        || this.preferences.avoidFerries;
  }

  // ── PRIVATE: Google Maps bootstrap ───────────────

  private _loadMapsScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps?.DirectionsService) return Promise.resolve();
    return new Promise(resolve => {
      const existing = document.getElementById('googleMapsScript');
      if (existing) {
        const poll = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps?.DirectionsService) {
            clearInterval(poll); resolve();
          }
        }, 100);
        return;
      }
      const s    = document.createElement('script');
      s.id       = 'googleMapsScript';
      s.src      = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMap_ApiKey}&libraries=geometry,places`;
      s.async    = true; s.defer = true;
      s.onload   = () => resolve();
      document.head.appendChild(s);
    });
  }

  private _createMap() {
    const el = this.mapContainer?.nativeElement;
    if (!el) { setTimeout(() => this._createMap(), 200); return; }

    this.map = new google.maps.Map(el, {
      center:            { lat: this.originLat, lng: this.originLng },
      zoom:              11,
      mapTypeId:         'roadmap',
      mapTypeControl:    true,
      streetViewControl: false,
      fullscreenControl: false
    });

    this.flagMapInitializing = false;
    if (this.pendingFetch) { this.pendingFetch = false; this._fetchRoutes(); }
  }

  // ── PRIVATE: Directions API ───────────────────────

  private _fetchRoutes() {
    if (!this.map) { this.pendingFetch = true; return; }

    this.flagGettingRoutes  = true;
    this.lstRoutes          = [];
    this.expandedRouteIndex = null;
    this._clearAll();

    const { avoidHighways, avoidTolls, avoidFerries } = this._buildAvoidFlags();

    new google.maps.DirectionsService().route({
      origin:      new google.maps.LatLng(this.originLat, this.originLng),
      destination: new google.maps.LatLng(this.destLat,   this.destLng),
      travelMode:  google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidHighways, avoidTolls, avoidFerries,
      region: 'VN', language: 'vi'
    }, (result: any, status: any) => {
      this.ngZone.run(() => {
        this.flagGettingRoutes = false;
        if (status === google.maps.DirectionsStatus.OK) {
          this._processRoutes(result);
        } else {
          this._notif.printErrorMessage(`Directions API lỗi: ${status}`);
        }
      });
    });
  }

  private _buildAvoidFlags() {
    switch (this.preferences.roadType) {
      case 'national':   return { avoidHighways: true,  avoidTolls: this.preferences.avoidTolls, avoidFerries: this.preferences.avoidFerries };
      case 'provincial': return { avoidHighways: true,  avoidTolls: true,                        avoidFerries: this.preferences.avoidFerries };
      default:           return { avoidHighways: false, avoidTolls: this.preferences.avoidTolls, avoidFerries: this.preferences.avoidFerries };
    }
  }

  private _processRoutes(result: any) {
    this.lastDirectionsResult = result;
    const routes: any[]       = result.routes || [];

    this.lstRoutes = routes.map((r: any, i: number) => {
      const leg = r.legs[0];
      return {
        index:         i,
        summary:       r.summary || `Tuyến ${i + 1}`,
        distanceText:  leg.distance?.text   || '',
        distanceValue: leg.distance?.value  || 0,
        durationText:  leg.duration?.text   || '',
        durationValue: leg.duration?.value  || 0,
        steps: (leg.steps || []).map((s: any) => ({
          instructions: s.instructions || s.html_instructions || '',
          distance:     s.distance?.text || ''
        })),
        tollInfo:    null,
        tollLoading: true   // sẽ fetch song song
      } as RouteOption;
    });

    // Vẽ tuyến phụ bằng Polyline
    routes.forEach((r: any, i: number) => {
      if (i === 0) return;
      this._drawAltPolyline(r, i);
    });

    // Tuyến 0 làm active mặc định
    this._switchActiveRoute(0);

    if (routes[0]?.bounds) this.map.fitBounds(routes[0].bounds);

    // Gọi Routes API v2 để lấy thông tin trạm phí (song song)
    this._fetchTollInfo();
  }

  // ── PRIVATE: Route switching ──────────────────────

  private _switchActiveRoute(newIdx: number) {
    const prevIdx = this.activeRendererIndex;

    // ─── CRITICAL FIX ───────────────────────────────
    // Cùng tuyến → KHÔNG recreate renderer, tránh vẽ đè lộ trình gốc lên tuyến đã kéo
    if (prevIdx !== null && prevIdx === newIdx && this.activeRenderer) return;
    // ────────────────────────────────────────────────

    // Tắt renderer cũ → restore về Polyline
    if (this.activeRenderer && prevIdx !== null) {
      this.activeRenderer.setMap(null);
      this.activeRenderer = null;
      const prevRoute = this.lastDirectionsResult?.routes?.[prevIdx];
      if (prevRoute) this._drawAltPolyline(prevRoute, prevIdx);
    }

    // Xóa Polyline của tuyến mới
    if (this.altPolylines[newIdx]) {
      this.altPolylines[newIdx].setMap(null);
      this.altPolylines[newIdx] = null;
    }

    if (!this.lastDirectionsResult) return;

    // Tạo renderer draggable
    this.activeRenderer = new google.maps.DirectionsRenderer({
      map:          this.map,
      directions:   this.lastDirectionsResult,
      routeIndex:   newIdx,
      draggable:    true,
      polylineOptions: {
        strokeColor:   this.routeColors[newIdx] || '#1a73e8',
        strokeOpacity: 0.92,
        strokeWeight:  8
      },
      suppressInfoWindows: true
    });
    this.activeRendererIndex = newIdx;

    this.activeRenderer.addListener('directions_changed', () => {
      this.ngZone.run(() => this._onRouteEdited(newIdx));
    });
  }

  /**
   * Cập nhật sau khi người dùng kéo tuyến — update cache để tránh revert
   */
  private _onRouteEdited(routeIdx: number) {
    const newDir = this.activeRenderer?.getDirections();
    if (!newDir?.routes?.length) return;

    // ── QUAN TRỌNG: Cập nhật cache để lần switch sau không revert về tuyến gốc ──
    if (this.lastDirectionsResult?.routes) {
      this.lastDirectionsResult.routes[routeIdx] = newDir.routes[0];
    }

    const leg = newDir.routes[0].legs[0];
    this.lstRoutes = this.lstRoutes.map((r, i) => {
      if (i !== routeIdx) return r;
      return {
        ...r,
        distanceText:  leg.distance?.text   || r.distanceText,
        distanceValue: leg.distance?.value  || r.distanceValue,
        durationText:  leg.duration?.text   || r.durationText,
        durationValue: leg.duration?.value  || r.durationValue,
        steps: (leg.steps || []).map((s: any) => ({
          instructions: s.instructions || '',
          distance:     s.distance?.text || ''
        })),
        tollInfo: null,    // Reset toll sau khi kéo (đường thay đổi)
        tollLoading: false
      };
    });
  }

  // ── PRIVATE: Routes API v2 – Toll Info ───────────

  /**
   * 5 loại xe theo biểu phí Việt Nam (Thông tư 35/2016/TT-BGTVT).
   * ratio: tỷ lệ so với Loại 2 (xe con) = 1.0x — dùng khi API không trả vehicle-cost.
   */
  private readonly VN_VEHICLE_CATS = [
    { label: 'Loại 1 – Xe máy, xe đạp điện',                        icon: 'fa-bicycle',      ratio: 0.20, note: 'Một số cao tốc không cho phép' },
    { label: 'Loại 2 – Xe con ≤9 chỗ, xe tải ≤2T',                 icon: 'fa-car',          ratio: 1.00, note: '' },
    { label: 'Loại 3 – Xe khách ≤24 chỗ, xe tải 2–4T',             icon: 'fa-bus',          ratio: 1.52, note: '' },
    { label: 'Loại 4 – Xe khách 25–45 chỗ, xe tải 4–10T',          icon: 'fa-truck',        ratio: 2.22, note: '' },
    { label: 'Loại 5 – Xe khách >45 chỗ, xe tải >10T, container',  icon: 'fa-truck',        ratio: 2.98, note: 'Xe siêu trường siêu trọng' },
  ];

  // ─────────────────────────────────────────────────
  //  CHIẾN LƯỢC 3 LỚP:
  //  1) Distance Matrix API (song song GASOLINE + ELECTRIC)
  //     → chính xác nhất: hỗ trợ vehicleInfo + tollPasses
  //  2) computeRoutes fallback
  //  3) _estimateVehicleCosts nếu cả 2 thất bại
  // ─────────────────────────────────────────────────
  private async _fetchTollInfo() {
    // Chạy song song cả 2 API:
    // 1. Matrix API: Lấy chính xác giá (GASOLINE vs ELECTRIC + VETC)
    // 2. computeRoutes: Lấy danh sách tên trạm thu phí (tolls array)
    const [matrixResult, routesData] = await Promise.all([
      this._callMatrixApi(),
      this._callComputeRoutes()
    ]);

    console.group('[Toll Strategy]');
    console.log('Matrix result:', matrixResult);
    console.log('Routes API data:', routesData);
    console.groupEnd();

    this.ngZone.run(() => {
      this.lstRoutes = this.lstRoutes.map((r, i) => {
        // --- 1. Lấy danh sách trạm từ computeRoutes ---
        const apiRoute   = routesData?.routes?.[i] ?? routesData?.routes?.[0];
        const routeToll  = apiRoute?.travelAdvisory?.tollInfo;
        const legToll    = apiRoute?.legs?.[0]?.travelAdvisory?.tollInfo;
        
        const hasTollData = (ti: any) => !!ti && (ti.estimatedPrice?.length > 0 || ti.tolls?.length > 0);
        const tollRaw    = hasTollData(routeToll) ? routeToll : hasTollData(legToll) ? legToll : null;

        const stations: TollStation[] = (tollRaw?.tolls || []).map((t: any) => ({
          name: t.name || 'Trạm thu phí',
          cost: t.monetaryCost
            ? `${Number(t.monetaryCost.units || 0).toLocaleString('vi-VN')} ${t.monetaryCost.currencyCode}`
            : null
        }));

        // --- 2. Quyết định giá (ưu tiên Matrix API, fallback computeRoutes) ---
        let baseCostVND = 0;
        let evCostVND   = 0;
        let pCurrency   = 'VND';

        if (matrixResult.source === 'matrix' && matrixResult.baseCostVND > 0) {
          baseCostVND = matrixResult.baseCostVND;
          evCostVND   = matrixResult.evCostVND;
        } else if (tollRaw?.estimatedPrice?.[0]) {
          baseCostVND = Number(tollRaw.estimatedPrice[0].units || 0);
          pCurrency   = tollRaw.estimatedPrice[0].currencyCode || 'VND';
        }

        const vehicleCosts = this._buildVehicleCosts({ baseCostVND, evCostVND, source: baseCostVND > 0 ? 'matrix' : 'none' });
        const hasEvDiscount = evCostVND > 0 && evCostVND < baseCostVND;

        const apiError = (!tollRaw && baseCostVND === 0)
          ? 'Google xác nhận tuyến có trạm thu phí nhưng chưa cung cấp dữ liệu phí hay tên trạm cho Việt Nam.'
          : undefined;

        return {
          ...r,
          tollLoading: false,
          tollInfo: {
            totalCost:    baseCostVND > 0 ? String(baseCostVND) : null,
            currency:     pCurrency,
            stationCount: stations.length,
            stations:     stations,
            vehicleCosts: vehicleCosts,
            dataFromApi:  baseCostVND > 0 || stations.length > 0,
            hasEvDiscount,
            apiError
          } as TollInfo
        };
      });
    });
  }

  /**
   * Gọi Distance Matrix API v2 song song 2 lần:
   * - GASOLINE (xe thường, không thẻ) → base price cho Loại 2
   * - ELECTRIC                         → phát hiện EV discount
   */
  private async _callMatrixApi(): Promise<MatrixTollResult> {
    const makeOrigin = (emissionType: string) => ({
      waypoint: {
        location: { latLng: { latitude: this.originLat, longitude: this.originLng } }
      },
      routeModifiers: {
        vehicleInfo: { emissionType }
        // Bỏ tollPasses vì Google Maps v2 REST API validate nghiêm ngặt enum TollPass.
        // Truyền 'VN_VETC' chưa có trong docs sẽ gây lỗi HTTP 400 (Invalid Argument).
      }
    });

    const body = {
      origins: [
        makeOrigin('GASOLINE'),   // index 0 = xe con tiêu chuẩn
        makeOrigin('ELECTRIC')    // index 1 = xe điện
      ],
      destinations: [{
        waypoint: {
          location: { latLng: { latitude: this.destLat, longitude: this.destLng } }
        }
      }],
      travelMode:        'DRIVE',
      extraComputations: ['TOLLS'],
      languageCode:      'vi'
    };

    const fieldMask = [
      'originIndex',
      'destinationIndex',
      'travel_advisory.tollInfo',
      'distanceMeters',
      'duration',
      'status'
    ].join(',');

    try {
      const resp = await fetch(
        'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
        {
          method:  'POST',
          headers: {
            'Content-Type':     'application/json',
            'X-Goog-Api-Key':   environment.googleMap_ApiKey,
            'X-Goog-FieldMask': fieldMask
          },
          body: JSON.stringify(body)
        }
      );

      const rawText = await resp.text();
      let cells: any[];
      try { cells = JSON.parse(rawText); } catch { cells = []; }
      if (!Array.isArray(cells)) cells = [];

      console.group('[Matrix API v2] computeRouteMatrix');
      console.log('Status:', resp.status, resp.ok ? 'OK' : 'ERROR');
      if (!resp.ok) {
        console.error('API Response text:', rawText);
      } else {
        cells.forEach((c: any) => {
          console.log(`  origin=${c.originIndex} dest=${c.destinationIndex}`,
                      '| tollInfo =', JSON.stringify(c.travel_advisory?.tollInfo),
                      '| status =',   JSON.stringify(c.status));
        });
      }
      console.groupEnd();

      const extractPrice = (originIdx: number): number => {
        const cell  = cells.find(c => c.originIndex === originIdx && c.destinationIndex === 0);
        const price = cell?.travel_advisory?.tollInfo?.estimatedPrice?.[0];
        return price ? Number(price.units || 0) : 0;
      };

      const baseCostVND = extractPrice(0); // GASOLINE
      const evCostVND   = extractPrice(1); // ELECTRIC

      return { baseCostVND, evCostVND, source: baseCostVND > 0 ? 'matrix' : 'none' };

    } catch (e: any) {
      console.error('[Matrix API] Failed:', e?.message || e);
      return { baseCostVND: 0, evCostVND: 0, source: 'none' };
    }
  }

  /**
   * Gọi computeRoutes để lấy danh sách tên trạm thu phí (tolls array).
   * Không quan tâm tới EV discount hay tollPasses.
   */
  private async _callComputeRoutes(): Promise<any> {
    const body = {
      origin:      { location: { latLng: { latitude: this.originLat, longitude: this.originLng } } },
      destination: { location: { latLng: { latitude: this.destLat,   longitude: this.destLng   } } },
      travelMode:  'DRIVE',
      extraComputations: ['TOLLS'],
      computeAlternativeRoutes: true,
      languageCode: 'vi'
    };

    const fieldMask = [
      'routes.distanceMeters',
      'routes.travelAdvisory.tollInfo',
      'routes.legs.travelAdvisory.tollInfo'
    ].join(',');

    try {
      const resp = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method:  'POST',
          headers: {
            'Content-Type':     'application/json',
            'X-Goog-Api-Key':   environment.googleMap_ApiKey,
            'X-Goog-FieldMask': fieldMask
          },
          body: JSON.stringify(body)
        }
      );

      const rawText = await resp.text();
      let data: any;
      try { data = JSON.parse(rawText); } catch { data = {}; }
      return data;

    } catch (e: any) {
      console.error('[computeRoutes fallback] Failed:', e);
      return null;
    }
  }

  /**
   * Xây dựng VehicleCostRow[] từ MatrixTollResult.
   * Luôn trả về đủ 5 loại xe (cost = null nếu không có data).
   */
  private _buildVehicleCosts(result: MatrixTollResult): VehicleCostRow[] {
    const base = result.baseCostVND;
    const ev   = result.evCostVND;
    return this.VN_VEHICLE_CATS.map(cat => {
      const cost     = base > 0 ? Math.round(base * cat.ratio / 1000) * 1000 : null;
      // EV discount chỉ áp dụng Loại 1 & 2 (xe nhỏ có thể dùng xe điện)
      const costVetc = ev > 0 && cat.ratio <= 1.0
        ? Math.round(ev * cat.ratio / 1000) * 1000
        : cost;
      return { label: cat.label, icon: cat.icon, cost, costVetc, isEstimated: base > 0, note: cat.note };
    });
  }


  /**
   * Parse vehicle-specific costs từ API response.
   * Nếu API không trả về → ước tính từ baseCost với tỷ lệ VN_VEHICLE_CATS.
   */
  private _parseVehicleCosts(tollRaw: any, baseCostVND: number): VehicleCostRow[] {
    // Thử lấy vehicle-specific costs từ từng trạm (vehicleTollCosts)
    const tolls = tollRaw.tolls || [];
    const hasVehicleData = tolls.some((t: any) => t.vehicleTollCosts?.length > 0);

    if (hasVehicleData) {
      // Tổng hợp chi phí theo loại xe qua tất cả trạm
      const totals: Record<string, number> = {};
      const labels: Record<string, string> = {};
      tolls.forEach((t: any) => {
        (t.vehicleTollCosts || []).forEach((vtc: any) => {
          const key   = vtc.vehicleCategory || vtc.vehicle?.emissionType || 'UNKNOWN';
          const units = Number(vtc.cost?.units || 0);
          totals[key] = (totals[key] || 0) + units;
          labels[key] = key.replace(/_/g, ' ');
        });
      });

      return Object.entries(totals).map(([key, cost]) => ({
        label:       labels[key] || key,
        icon:        this._vehicleIcon(key),
        cost,
        costVetc:    null,
        isEstimated: false
      }));
    }

    // Fallback: ước tính từ baseCost theo tỷ lệ biểu phí VN
    if (baseCostVND <= 0) return [];

    return this.VN_VEHICLE_CATS.map(cat => ({
      label:       cat.label,
      icon:        cat.icon,
      cost:        Math.round(baseCostVND * cat.ratio / 1000) * 1000,
      costVetc:    null,
      isEstimated: true,
      note:        cat.note
    }));
  }

  private _vehicleIcon(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('motor') || c.includes('bicycle')) return 'fa-bicycle';
    if (c.includes('bus'))   return 'fa-bus';
    if (c.includes('truck')) return 'fa-truck';
    return 'fa-car';
  }

  /** Tổng toll hiển thị đẹp */
  formatTollCost(toll: TollInfo | null | undefined): string {
    if (!toll || toll.totalCost === null)  return 'Không có dữ liệu';
    if (toll.totalCost === '0') return 'Miễn phí';
    return `${Number(toll.totalCost).toLocaleString('vi-VN')} ${toll.currency}`;
  }

  private _estimateVehicleCosts(baseVND: number): VehicleCostRow[] {
    return this.VN_VEHICLE_CATS.map(c => ({
      label:       c.label,
      icon:        c.icon,
      cost:        baseVND > 0 ? Math.round(baseVND * c.ratio / 1000) * 1000 : null,
      costVetc:    null,
      isEstimated: true,
      note:        c.note
    }));
  }

  private _clearTollLoading() {
    this.ngZone.run(() => {
      this.lstRoutes = this.lstRoutes.map(r => ({ ...r, tollLoading: false }));
    });
  }

  // ── PRIVATE: Rendering helpers ────────────────────

  private _drawAltPolyline(route: any, idx: number) {
    if (!route?.overview_path) return;

    const poly = new google.maps.Polyline({
      path:          route.overview_path,
      strokeColor:   this.routeColors[idx] || '#adb5bd',
      strokeOpacity: 0.55,
      strokeWeight:  6,
      clickable:     true,
      map:           this.map,
      zIndex:        idx
    });

    poly.addListener('click', () => {
      this.ngZone.run(() => {
        this.expandedRouteIndex = idx;
        this._switchActiveRoute(idx);
      });
    });

    this.altPolylines[idx] = poly;
  }

  private _clearAll() {
    if (this.activeRenderer) { this.activeRenderer.setMap(null); this.activeRenderer = null; }
    this.activeRendererIndex = null;
    this.altPolylines.forEach(p => p?.setMap(null));
    this.altPolylines         = [];
    this.lastDirectionsResult = null;
  }
}
