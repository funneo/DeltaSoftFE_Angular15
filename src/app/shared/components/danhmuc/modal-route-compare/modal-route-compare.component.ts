import { Component, ElementRef, EventEmitter, NgZone, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface CompareRouteResult {
  provider: 'vietmap' | 'google';
  summary: string;
  km: number;
  steps: { lat: number; lng: number; name: string; distanceM: number }[];
  polyline: string;
  note?: string;
}

interface RouteStats {
  distanceText: string;
  durationText: string;
  tollText: string | null;
  km: number;
  steps: { lat: number; lng: number; name: string; distanceM: number }[];
  polyline: string;
}

@Component({
  selector: 'modal-route-compare',
  templateUrl: './modal-route-compare.component.html',
  styleUrls: ['./modal-route-compare.component.css']
})
export class ModalRouteCompareComponent {
  @ViewChild('modalCompare', { static: false }) modalCompare: ModalDirective;
  @ViewChild('vietmapContainer', { static: false }) vietmapContainer: ElementRef;
  @ViewChild('googleContainer', { static: false }) googleContainer: ElementRef;

  @Output() RouteSelected = new EventEmitter<CompareRouteResult>();

  vietmapLoading = true;
  googleLoading = true;
  vietmapError: string | null = null;
  googleError: string | null = null;
  vietmapStats: RouteStats | null = null;
  googleStats: RouteStats | null = null;

  showWarning = false;
  warningReason = '';

  private vietmapMap: any;
  private googleMap: any;
  private googleRenderer: any;
  private googleLastDir: any;

  private vietmapMarkers: any[] = [];
  private vietmapWaypoints: { lat: number; lng: number }[] = [];
  private vietmapFetchTimer: any;
  private vietmapCurrentPolyline: string = null;
  private vietmapCurrentSteps: { lat: number; lng: number; name: string; distanceM: number }[] = [];

  private points: { lat: number; lng: number }[] = [];

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private _notif: NotificationService
  ) {}

  show(points: { lat: number; lng: number }[]) {
    if (!points || points.length < 2) return;
    this.points = [...points];
    this.vietmapWaypoints = [...points];
    this.vietmapStats = null;
    this.googleStats = null;
    this.vietmapLoading = true;
    this.googleLoading = true;
    this.vietmapError = null;
    this.googleError = null;
    this.vietmapMap = null;
    this.googleMap = null;
    this.googleRenderer = null;
    this.googleLastDir = null;
    this.vietmapMarkers = [];
    this.vietmapCurrentPolyline = null;
    this.vietmapCurrentSteps = [];
    this.showWarning = false;
    this.warningReason = '';
    this.modalCompare.show();
  }

  onModalShown() {
    this._initVietmap();
    this._initGoogle();
  }

  selectVietmap() {
    if (!this.vietmapStats) return;
    const kmDiff = this.googleStats ? (this.vietmapStats.km - this.googleStats.km) : 0;
    if (kmDiff >= 1) {
      this.showWarning = true;
      this.warningReason = '';
    } else {
      this._emitVietmap('');
    }
  }

  confirmVietmapSelection() {
    if (!this.warningReason.trim()) return;
    this._emitVietmap(this.warningReason.trim());
  }

  private _emitVietmap(note: string) {
    this.RouteSelected.emit({
      provider: 'vietmap',
      summary: 'Vietmap',
      km: this.vietmapStats.km,
      steps: this.vietmapStats.steps,
      polyline: this.vietmapStats.polyline,
      note
    });
    this.modalCompare.hide();
  }

  // ── VIETMAP ───────────────────────────────────────────────────────────────

  private _initVietmap() {
    this._loadVietmapScript().then(() => this._createVietmapMap());
  }

  private _loadVietmapScript(): Promise<void> {
    const w = window as any;
    if (w.vietmapgl) return Promise.resolve();
    return new Promise(resolve => {
      if (!document.getElementById('vietmapCss')) {
        const l = document.createElement('link'); l.id = 'vietmapCss'; l.rel = 'stylesheet';
        l.href = 'https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.css';
        document.head.appendChild(l);
      }
      const wait = () => ((window as any).vietmapgl ? resolve() : setTimeout(wait, 100));
      if (!document.getElementById('vietmapScript')) {
        const s = document.createElement('script'); s.id = 'vietmapScript';
        s.src = 'https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
        s.onload = () => wait(); s.onerror = () => resolve();
        document.head.appendChild(s);
      } else { wait(); }
    });
  }

  private _createVietmapMap() {
    const el = this.vietmapContainer?.nativeElement;
    const w = window as any;
    if (!el || !w.vietmapgl) { setTimeout(() => this._createVietmapMap(), 200); return; }

    const key = '261b145415dc3828f1fd75c98f9110e3c19d986d41cef544';
    w.vietmapgl.accessToken = key;
    const o = this.points[0];
    this.vietmapMap = new w.vietmapgl.Map({
      container: el,
      style: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${key}`,
      center: [o.lng, o.lat],
      zoom: 10
    });

    this.vietmapMap.on('load', () => {
      this._drawVietmapMarkers();
      this._setupVietmapInteractions();
      this._fetchVietmapRoute();
    });
  }

  private _setupVietmapInteractions() {
    this.vietmapMap.on('click', (e: any) => {
      const p = e.lngLat;
      this.vietmapWaypoints.splice(this.vietmapWaypoints.length - 1, 0, { lat: p.lat, lng: p.lng });
      this._drawVietmapMarkers();
      this._scheduleVietmapFetch();
    });
  }

  private _drawVietmapMarkers() {
    const w = window as any;
    this.vietmapMarkers.forEach(m => m.remove());
    this.vietmapMarkers = [];
    this.vietmapWaypoints.forEach((wp, i) => {
      const isStart = i === 0, isEnd = i === this.vietmapWaypoints.length - 1;
      const color = isStart ? '#28a745' : (isEnd ? '#dc3545' : '#007bff');
      const marker = new w.vietmapgl.Marker({ draggable: true, color })
        .setLngLat([wp.lng, wp.lat])
        .addTo(this.vietmapMap);
      marker.on('dragend', () => {
        const pos = marker.getLngLat();
        this.vietmapWaypoints[i] = { lat: pos.lat, lng: pos.lng };
        this._scheduleVietmapFetch();
      });
      this.vietmapMarkers.push(marker);
    });
  }

  private _scheduleVietmapFetch() {
    if (this.vietmapFetchTimer) clearTimeout(this.vietmapFetchTimer);
    this.vietmapFetchTimer = setTimeout(() => this._fetchVietmapRoute(), 800);
  }

  private _fetchVietmapRoute() {
    this.ngZone.run(() => { this.vietmapLoading = true; this.vietmapError = null; });

    this.http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, { points: this.vietmapWaypoints })
      .pipe(catchError(() => of(null)))
      .subscribe(res => this.ngZone.run(() => {
        this.vietmapLoading = false;
        if (!res?.route?.paths?.[0]) { this.vietmapError = 'Không lấy được lộ trình'; return; }
        const r = res.route.paths[0];
        const coords: [number, number][] = r.points?.coordinates || [];
        this.vietmapCurrentPolyline = JSON.stringify(coords);
        this.vietmapCurrentSteps = (r.instructions || []).map((s: any) => {
          const c = coords[s.interval?.[0] ?? 0];
          return { lat: c ? c[1] : 0, lng: c ? c[0] : 0, name: s.text || '', distanceM: s.distance || 0 };
        });

        let tollText: string | null = null;
        if (res.toll?.length) {
          const v1 = res.toll.find((x: any) => x.vehicle === 1)?.data;
          if (v1?.tolls) {
            const total = v1.tolls.reduce((s: number, t: any) => s + (t.price || 0), 0);
            tollText = total > 0 ? `${total.toLocaleString('vi-VN')} ₫` : 'Không có trạm phí';
          }
        }

        this.vietmapStats = {
          distanceText: `${(r.distance / 1000).toFixed(1)} km`,
          durationText: `${Math.round(r.time / 60000)} phút`,
          tollText,
          km: +(r.distance / 1000).toFixed(1),
          steps: this.vietmapCurrentSteps,
          polyline: this.vietmapCurrentPolyline
        };

        this._drawVietmapPolyline(coords);
      }));
  }

  private _drawVietmapPolyline(coords: [number, number][]) {
    if (!coords.length) return;
    const src = 'cmp-vietmap-route';
    if (this.vietmapMap.getSource(src)) {
      this.vietmapMap.removeLayer(src + '-layer');
      this.vietmapMap.removeSource(src);
    }
    this.vietmapMap.addSource(src, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } });
    this.vietmapMap.addLayer({ id: src + '-layer', type: 'line', source: src, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1a73e8', 'line-width': 5 } });

    const lngs = coords.map(c => c[0]), lats = coords.map(c => c[1]);
    this.vietmapMap.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 40 });
  }

  // ── GOOGLE MAPS ───────────────────────────────────────────────────────────

  private _initGoogle() {
    this._loadGoogleScript().then(() => this._createGoogleMap());
  }

  private _loadGoogleScript(): Promise<void> {
    const g = (window as any).google;
    if (g?.maps?.DirectionsService) return Promise.resolve();
    return new Promise(resolve => {
      const existing = document.getElementById('googleMapsScript');
      if (existing) {
        const poll = setInterval(() => {
          if ((window as any).google?.maps?.DirectionsService) { clearInterval(poll); resolve(); }
        }, 100);
        return;
      }
      const s = document.createElement('script'); s.id = 'googleMapsScript';
      s.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMap_ApiKey}&libraries=geometry,places`;
      s.async = true; s.defer = true; s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  private _createGoogleMap() {
    const el = this.googleContainer?.nativeElement;
    const g = (window as any).google;
    if (!el || !g?.maps) { setTimeout(() => this._createGoogleMap(), 200); return; }

    const o = this.points[0];
    this.googleMap = new g.maps.Map(el, {
      center: { lat: o.lat, lng: o.lng },
      zoom: 10,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false
    });

    this._fetchGoogleRoute();
  }

  private _fetchGoogleRoute() {
    const g = (window as any).google;
    if (!this.googleMap || !g?.maps?.DirectionsService) { setTimeout(() => this._fetchGoogleRoute(), 300); return; }

    this.ngZone.run(() => { this.googleLoading = true; this.googleError = null; });
    const o = this.points[0], d = this.points[this.points.length - 1];

    new g.maps.DirectionsService().route({
      origin: new g.maps.LatLng(o.lat, o.lng),
      destination: new g.maps.LatLng(d.lat, d.lng),
      travelMode: g.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      region: 'VN',
      language: 'vi'
    }, (result: any, status: any) => {
      this.ngZone.run(() => {
        this.googleLoading = false;
        if (status !== g.maps.DirectionsStatus.OK) {
          this.googleError = `Directions API: ${status}`;
          return;
        }
        this.googleLastDir = result;
        this._applyGoogleRenderer(result);
        this._updateGoogleStats(result.routes[0]);
      });
    });
  }

  private _applyGoogleRenderer(result: any) {
    const g = (window as any).google;
    if (this.googleRenderer) {
      this.googleRenderer.setMap(null);
      this.googleRenderer = null;
    }
    this.googleRenderer = new g.maps.DirectionsRenderer({
      map: this.googleMap,
      directions: result,
      routeIndex: 0,
      draggable: true,
      polylineOptions: { strokeColor: '#e8710a', strokeOpacity: 0.9, strokeWeight: 6 },
      suppressInfoWindows: true
    });
    this.googleRenderer.addListener('directions_changed', () => {
      this.ngZone.run(() => {
        const dir = this.googleRenderer?.getDirections();
        if (dir?.routes?.[0]) {
          this.googleLastDir = dir;
          this._updateGoogleStats(dir.routes[0]);
        }
      });
    });
  }

  private _updateGoogleStats(route: any) {
    const leg = route.legs?.[0];
    if (!leg) return;

    // Encode polyline from overview_path → [lng,lat][]
    let polyline = '';
    if (route.overview_path) {
      const coords: [number, number][] = route.overview_path.map((ll: any) => [ll.lng(), ll.lat()]);
      polyline = JSON.stringify(coords);
    } else if (route.overview_polyline?.points) {
      const g = (window as any).google;
      const path = g.maps.geometry?.encoding?.decodePath(route.overview_polyline.points) || [];
      polyline = JSON.stringify(path.map((ll: any) => [ll.lng(), ll.lat()]));
    }

    const steps = (leg.steps || []).map((s: any) => ({
      lat: s.start_location?.lat?.() ?? s.start_location?.lat ?? 0,
      lng: s.start_location?.lng?.() ?? s.start_location?.lng ?? 0,
      name: s.instructions || '',
      distanceM: s.distance?.value || 0
    }));

    this.googleStats = {
      distanceText: leg.distance?.text || '',
      durationText: leg.duration?.text || '',
      tollText: null,
      km: +(((leg.distance?.value || 0) / 1000)).toFixed(1),
      steps,
      polyline
    };
  }
}
