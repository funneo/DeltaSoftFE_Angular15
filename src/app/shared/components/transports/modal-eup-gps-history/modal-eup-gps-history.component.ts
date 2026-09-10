import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ResponseValue } from "@app/shared/models";
import { environment } from "@environments/environment";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { of } from "rxjs";
import { catchError } from "rxjs/operators";

interface EupGpsPoint {
  longitude?: number;
  latitude?: number;
  address?: string;
  direction?: number;
  speed?: number;
  mile?: number;
  temperature1?: number;
  temperature2?: number;
  keepTime?: string;
  gpsTime?: string;
  carStatus?: number; // 0 chạy · 2 dừng · 5 mất tín hiệu · 10 dừng không tắt máy
}

interface EupGpsHistoryResult {
  vehicleNo?: string;
  totalMile?: number;
  details?: EupGpsPoint[];
}

// Xem lại hành trình GPS thực tế của xe từ EUP (GetHistory) rồi vẽ track lên bản đồ Vietmap —
// để điều vận đối chiếu tài xế ghi nhận T/g đi/kết thúc có đúng không. Gọi từ modal-dispatch-order-fcl-v2 (2026-09-10).
@Component({
  selector: "modal-eup-gps-history",
  templateUrl: "./modal-eup-gps-history.component.html",
  styleUrls: ["./modal-eup-gps-history.component.css"],
})
export class ModalEupGpsHistoryComponent implements OnDestroy {
  vehiclePlate: string;
  startedDate: any;
  finishedDate: any;
  loaded = false;
  errorMsg: string;
  busy: any;

  totalMile = 0;
  pointCount = 0;
  stopCount = 0;
  overRange = false; // khoảng tra > 7 ngày (giới hạn cứng EUP)

  private map: any;
  private markers: any[] = [];
  private _pendingResult: EupGpsHistoryResult | null = null;

  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalEupGpsHistory", { static: false }) modalEupGpsHistory: ModalDirective;
  @ViewChild("mapContainer", { static: false }) mapContainer: ElementRef;

  constructor(private _http: HttpClient) {}

  ngOnDestroy(): void {
    this._destroyMap();
  }

  show(vehiclePlate: string, startedDate: any, finishedDate: any) {
    this.vehiclePlate = vehiclePlate;
    this.startedDate = startedDate;
    this.finishedDate = finishedDate;
    this.loaded = false;
    this.errorMsg = null;
    this.totalMile = 0;
    this.pointCount = 0;
    this.stopCount = 0;
    this._pendingResult = null;
    this.overRange =
      !!startedDate && !!finishedDate &&
      moment(finishedDate).diff(moment(startedDate), "days") > 7;
    this.modalEupGpsHistory.show();
    this.loadData();
  }

  OnShown(): void {
    // Bản đồ chỉ dựng được khi container đã có trong DOM (modal đã hiển thị).
    this._loadMapsScript().then(() => this._createMap());
  }

  OnHidden(): void {
    this._destroyMap();
    this.CloseModal.emit();
  }

  loadData() {
    if (!this.vehiclePlate) {
      this.errorMsg = "Lệnh chưa có biển số xe.";
      this.loaded = true;
      return;
    }
    // EUP /gps/history cần ISO-8601 có offset (vd 2026-09-10T08:00:00+07:00)
    const startTime = moment(this.startedDate).format();
    const endTime = moment(this.finishedDate).format();
    this.busy = this._http
      .post<ResponseValue<EupGpsHistoryResult>>(`${environment.apiUrl}/api/Eupfin/GetHistory`, {
        vehicleNo: this.vehiclePlate,
        startTime,
        endTime,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        this.loaded = true;
        if (!res || res.code !== "200") {
          this.errorMsg = res?.message || "Không lấy được dữ liệu hành trình từ EUP.";
          return;
        }
        const data = res.data || {};
        const details = (data.details || []).filter((p) => p.latitude != null && p.longitude != null);
        if (!details.length) {
          this.errorMsg = "Không có dữ liệu GPS của xe này trong khoảng thời gian đã chọn.";
          return;
        }
        details.sort((a, b) => (a.gpsTime || "").localeCompare(b.gpsTime || ""));
        this.totalMile = data.totalMile || 0;
        this.pointCount = details.length;
        this._pendingResult = { ...data, details };
        this._renderIfReady();
      });
  }

  // ── Vietmap bootstrapping (rút gọn từ modal-vietmap-routes) ──

  private _loadMapsScript(): Promise<void> {
    const w = window as any;
    if (w.vietmapgl) return Promise.resolve();
    return new Promise((resolve) => {
      if (!document.getElementById("vietmapCss")) {
        const link = document.createElement("link");
        link.id = "vietmapCss";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
        document.head.appendChild(link);
      }
      const waitForVietmap = () => {
        if (w.vietmapgl) resolve();
        else setTimeout(waitForVietmap, 100);
      };
      if (!document.getElementById("vietmapScript")) {
        const s = document.createElement("script");
        s.id = "vietmapScript";
        s.src = "https://cdn.jsdelivr.net/npm/@vietmap/vietmap-gl-js/dist/vietmap-gl.js";
        s.onload = () => waitForVietmap();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      } else {
        waitForVietmap();
      }
    });
  }

  private _createMap() {
    const el = this.mapContainer?.nativeElement;
    const w = window as any;
    if (!el || !w.vietmapgl) {
      setTimeout(() => this._createMap(), 200);
      return;
    }
    if (this.map) {
      this._renderIfReady();
      return;
    }
    const tileApiKey = "261b145415dc3828f1fd75c98f9110e3c19d986d41cef544";
    w.vietmapgl.accessToken = tileApiKey;
    this.map = new w.vietmapgl.Map({
      container: el,
      style: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${tileApiKey}`,
      center: [106.7, 10.8],
      zoom: 10,
    });
    this.map.on("load", () => this._renderIfReady());
  }

  private _renderIfReady() {
    if (!this.map || !this.map.isStyleLoaded?.() || !this._pendingResult) {
      if (this.map && this._pendingResult) setTimeout(() => this._renderIfReady(), 150);
      return;
    }
    const details = this._pendingResult.details || [];
    const coordinates = details.map((p) => [p.longitude, p.latitude]);
    if (coordinates.length < 2) return;

    if (this.map.getSource("gps-track")) {
      this.map.removeLayer("gps-track-layer");
      this.map.removeSource("gps-track");
    }
    this.map.addSource("gps-track", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } },
    });
    this.map.addLayer({
      id: "gps-track-layer",
      type: "line",
      source: "gps-track",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#e74c3c", "line-width": 4 },
    });

    const w = window as any;
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    // Điểm đầu / cuối
    this._addMarker(coordinates[0] as number[], "#28a745", "Điểm đầu GPS<br>" + this._fmt(details[0]));
    this._addMarker(
      coordinates[coordinates.length - 1] as number[],
      "#dc3545",
      "Điểm cuối GPS<br>" + this._fmt(details[details.length - 1])
    );

    // Điểm dừng xe (carStatus 2 = dừng, 10 = dừng không tắt máy) — chỉ đánh dấu lúc BẮT ĐẦU dừng
    let stops = 0;
    for (let i = 0; i < details.length; i++) {
      const isStop = details[i].carStatus === 2 || details[i].carStatus === 10;
      const prevStop = i > 0 && (details[i - 1].carStatus === 2 || details[i - 1].carStatus === 10);
      if (isStop && !prevStop) {
        stops++;
        this._addMarker(
          [details[i].longitude, details[i].latitude],
          details[i].carStatus === 10 ? "#f39c12" : "#7f8c8d",
          (details[i].carStatus === 10 ? "Dừng (không tắt máy)" : "Dừng xe") + "<br>" + this._fmt(details[i])
        );
      }
    }
    this.stopCount = stops;

    // Fit bounds
    const lngs = coordinates.map((c) => c[0]);
    const lats = coordinates.map((c) => c[1]);
    this.map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 40, duration: 0 }
    );
  }

  private _addMarker(lngLat: number[], color: string, html: string) {
    const w = window as any;
    const popup = new w.vietmapgl.Popup({ offset: 24 }).setHTML(html);
    const marker = new w.vietmapgl.Marker({ color })
      .setLngLat(lngLat)
      .setPopup(popup)
      .addTo(this.map);
    this.markers.push(marker);
  }

  private _fmt(p: EupGpsPoint): string {
    const t = p.gpsTime ? moment(p.gpsTime).format("DD/MM/YYYY HH:mm:ss") : "";
    const parts = [t, p.address || ""];
    if (p.keepTime) parts.push("Thời gian dừng: " + p.keepTime);
    return parts.filter(Boolean).join("<br>");
  }

  private _destroyMap() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
