import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '@app/shared/services';
import { TransportOrderService } from '@app/shared/services/transports/transport-order.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import {
  UnifiedLocation, SegmentStation,
  TransportOrderExtraSegment, TransportOrderTotalsResult
} from '@app/shared/models/transports/dispatchorders/transport-order.model';
import { ModalVietmapRoutesComponent } from '../../danhmuc/modal-vietmap-routes/modal-vietmap-routes.component';
import { ModalRouteCompareComponent, CompareRouteResult } from '../../danhmuc/modal-route-compare/modal-route-compare.component';

/** Kết quả phát ra sau khi lưu thành công — parent (FCL v2) gộp vào list + cập nhật totals. */
export interface ExtraSegmentSavedResult {
  newItem: TransportOrderExtraSegment;
  totals: TransportOrderTotalsResult;
}

/** Context truyền vào khi mở modal. */
export interface ExtraSegmentOpenContext {
  transportOrderId: number;
  locations: UnifiedLocation[];
  vehicleBotTypeId?: number | null;
  /** Định mức dầu theo tải trọng của XE trên lệnh (id=tải trọng, value/shortWayValue=định mức) */
  listOilQuota?: any[];
  /** Lệnh chạy cung đường ngắn → dùng shortWayValue thay value */
  shortWay?: boolean;
  /** Xe của lệnh — fallback tự nạp listOilQuota nếu parent truyền rỗng. */
  vehicleId?: number | null;
}

/**
 * Modal "Thêm cung đường phát sinh" — tách riêng khỏi modal FCL v2.
 * Tự chứa modal Vietmap + So sánh (child) để tính km/lộ trình/trạm phí ngay trong modal này.
 * Lưu xong phát SaveSuccess cho parent xử lý list + totals.
 */
@Component({
  selector: 'modal-add-extra-segment',
  templateUrl: './modal-add-extra-segment.component.html',
  styleUrls: ['./modal-add-extra-segment.component.scss']
})
export class ModalAddExtraSegmentComponent implements OnDestroy {
  @ViewChild('modalAddExtra', { static: false }) modalAddExtra: ModalDirective;
  @ViewChild(ModalVietmapRoutesComponent, { static: false }) modalVietmap: ModalVietmapRoutesComponent;
  @ViewChild(ModalRouteCompareComponent, { static: false }) modalCompare: ModalRouteCompareComponent;
  @Output() SaveSuccess = new EventEmitter<ExtraSegmentSavedResult>();
  @Output() CloseModal = new EventEmitter<void>();

  draft: TransportOrderExtraSegment | null = null;
  locations: UnifiedLocation[] = [];
  listOilQuota: any[] = [];
  loadingQuota = false;
  saving = false;
  private _shortWay = false;

  // Picker state — list cảng/nhà máy chỉ xổ xuống khi bấm vào ô điểm đi/đến
  pickerMode: 'start' | 'end' = 'start';
  pickerOpen = false;
  pickerFilter = { address: '', type: '' };
  pickerSortCol: 'address' | 'locationType' = 'address';
  pickerSortDir: 'asc' | 'desc' = 'asc';

  private _vehicleBotTypeId: number | null = null;
  private readonly _botTypeMap: Record<number, number> = { 1132: 1, 1133: 2, 1134: 3, 1135: 4, 1136: 5 };

  constructor(
    private _transportService: TransportOrderService,
    private _vihicleService: VihicleService,
    private _notif: NotificationService
  ) { }

  // ───────────── Open / Close ─────────────
  open(ctx: ExtraSegmentOpenContext) {
    if (!ctx?.transportOrderId) {
      this._notif.printErrorMessage('Lệnh chưa link TO — không thể thêm cung đường phát sinh.');
      return;
    }
    this.locations = ctx.locations || [];
    this._vehicleBotTypeId = ctx.vehicleBotTypeId ?? null;
    this.listOilQuota = ctx.listOilQuota || [];
    this._shortWay = !!ctx.shortWay;
    // Parent đôi khi chưa nạp xong định mức dầu của xe (lệnh thầu phụ / vehicle load chậm).
    // Nếu list rỗng mà có vehicleId → tự nạp để dropdown Tải trọng luôn có dữ liệu.
    if (!this.listOilQuota.length && ctx.vehicleId) {
      this._loadOilQuota(ctx.vehicleId);
    }
    this.draft = {
      transportOrderId: ctx.transportOrderId,
      startLocationType: 1,
      endLocationType: 1,
      note: '',
      listStations: [],
      listWaypoints: []
    };
    this.pickerMode = 'start';
    this.pickerOpen = false;
    this.pickerFilter = { address: '', type: '' };
    this.saving = false;
    this.modalAddExtra.show();
  }

  close() { this.modalAddExtra.hide(); }

  onHidden() {
    this.draft = null;
    this.pickerOpen = false;
    this.CloseModal.emit();
  }

  /**
   * Defensive cleanup khi modal bị host (modal v2) destroy đột ngột giữa lúc
   * modal con Vietmap/Compare vẫn đang shown → ngx-bootstrap không kịp gỡ
   * backdrop → leak xuyên route. Xem chú thích chi tiết ở
   * ModalDispatchOrderFclV2Component.ngOnDestroy().
   */
  ngOnDestroy(): void {
    try { this.modalAddExtra?.hide?.(); } catch { /* swallow */ }
    setTimeout(() => {
      if (typeof document !== 'undefined'
          && document.querySelectorAll('.modal.in, .modal.show').length === 0) {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
      }
    }, 250);
  }

  // ───────────── Picker ─────────────
  get filteredLocations(): UnifiedLocation[] {
    let list = this.locations;
    const addr = this.pickerFilter.address.trim().toLowerCase();
    const type = this.pickerFilter.type.trim();
    if (addr) list = list.filter(l => l.address?.toLowerCase().includes(addr)
      || l.name?.toLowerCase().includes(addr));
    if (type) list = list.filter(l => l.locationType?.toString() === type);
    return [...list].sort((a, b) => {
      const va = this.pickerSortCol === 'locationType' ? (a.locationType || 0) : (a.address || '');
      const vb = this.pickerSortCol === 'locationType' ? (b.locationType || 0) : (b.address || '');
      if (va < vb) return this.pickerSortDir === 'asc' ? -1 : 1;
      if (va > vb) return this.pickerSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }
  sortPicker(col: 'address' | 'locationType') {
    if (this.pickerSortCol === col) {
      this.pickerSortDir = this.pickerSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.pickerSortCol = col;
      this.pickerSortDir = 'asc';
    }
  }
  togglePicker(mode: 'start' | 'end') {
    if (this.pickerOpen && this.pickerMode === mode) { this.pickerOpen = false; return; }
    this.pickerMode = mode;
    this.pickerOpen = true;
  }
  selectLocation(loc: UnifiedLocation) {
    if (!this.hasGeoCoord(loc) || !this.draft) return;
    if (this.pickerMode === 'start') this._pickStart(loc);
    else this._pickEnd(loc);
    this.pickerOpen = false;
  }
  isPickerSelected(loc: UnifiedLocation): 'start' | 'end' | null {
    if (!this.draft) return null;
    if (this.draft.startLocationId === loc.id && this.draft.startLocationType === loc.locationType) return 'start';
    if (this.draft.endLocationId === loc.id && this.draft.endLocationType === loc.locationType) return 'end';
    return null;
  }
  get hasBothPoints(): boolean {
    return !!this.draft?.startLocationId && !!this.draft?.endLocationId;
  }
  hasGeoCoord(loc: UnifiedLocation): boolean {
    return !!(loc.latitude && loc.longtitude
      && Math.abs(loc.latitude) > 0.0001
      && Math.abs(loc.longtitude) > 0.0001);
  }
  locationTypeName(type: number): string {
    return type === 2 ? 'Cảng/Bãi' : 'Nhà máy';
  }
  /** Nhãn điểm: cảng/bãi có tên → "Tên - Địa chỉ"; nhà máy (không tên) → "Địa chỉ". */
  locationLabel(loc: UnifiedLocation): string {
    const name = (loc?.name || '').trim();
    return name ? `${name} - ${loc.address || ''}` : (loc?.address || '');
  }

  private _pickStart(loc: UnifiedLocation) {
    if (!this.draft) return;
    this.draft.startLocationId = loc.id;
    this.draft.startLocationType = loc.locationType;
    this.draft.startLocationName = this.locationLabel(loc);
    this.draft.startLat = loc.latitude;
    this.draft.startLng = loc.longtitude;
    this._resetRoute();
  }
  private _pickEnd(loc: UnifiedLocation) {
    if (!this.draft) return;
    this.draft.endLocationId = loc.id;
    this.draft.endLocationType = loc.locationType;
    this.draft.endLocationName = this.locationLabel(loc);
    this.draft.endLat = loc.latitude;
    this.draft.endLng = loc.longtitude;
    this._resetRoute();
  }
  private _resetRoute() {
    if (!this.draft) return;
    this.draft.distanceKm = null;
    this.draft.routePolyline = null;
    this.draft.listStations = [];
    this.draft.listWaypoints = [];
  }

  // ───────────── Tính Vietmap / So sánh (modal con) ─────────────
  openVietmap() {
    if (!this._canCalcRoute()) return;
    this.modalVietmap.show([
      { lat: this.draft.startLat, lng: this.draft.startLng },
      { lat: this.draft.endLat, lng: this.draft.endLng }
    ]);
  }
  openCompare() {
    if (!this._canCalcRoute()) return;
    this.modalCompare.show([
      { lat: this.draft.startLat, lng: this.draft.startLng },
      { lat: this.draft.endLat, lng: this.draft.endLng }
    ]);
  }
  private _canCalcRoute(): boolean {
    if (!this.draft?.startLocationId || !this.draft?.endLocationId) {
      this._notif.printErrorMessage('Vui lòng chọn điểm đi và điểm đến trước.');
      return false;
    }
    if (!this.draft.startLat || !this.draft.endLat) {
      this._notif.printErrorMessage('Điểm chưa có tọa độ GPS.');
      return false;
    }
    return true;
  }

  onVietmapRouteSelected(event: {
    summary: string; km: number; waypoints: { lat: number; lng: number }[];
    steps: { lat: number; lng: number; name: string; distanceM: number }[];
    polyline: string; tollStations?: SegmentStation[];
  }) {
    if (!this.draft) return;
    this._applyRoute(this.draft, event);
  }
  onCompareRouteSelected(event: CompareRouteResult) {
    if (!this.draft) return;
    // So sánh không trả trạm phí → listStations bị xóa (đúng theo luồng segment chính).
    this._applyRoute(this.draft, { km: event.km, polyline: event.polyline, steps: event.steps || [] });
    if (event.note) {
      const cur = (this.draft.note || '').trim();
      this.draft.note = cur ? `${cur}\n${event.note}` : event.note;
    }
  }

  private _applyRoute(target: TransportOrderExtraSegment, event: {
    km: number; polyline: string; tollStations?: SegmentStation[];
    steps?: { lat: number; lng: number; name: string; distanceM: number }[];
  }) {
    target.distanceKm = +(event.km).toFixed(1);
    target.routePolyline = event.polyline;
    if (event.steps?.length) {
      target.listWaypoints = event.steps.map((s, i) => ({
        orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM
      })) as any;
    }
    if (event.tollStations?.length) {
      target.listStations = event.tollStations;
      this._applyTollPrices(target);
    } else {
      target.listStations = [];
    }
    this._recalcFuelAmount(); // km đổi → tính lại lượng dầu theo định mức tải trọng đã chọn
  }

  /** Fallback: nạp định mức dầu theo tải trọng từ xe của lệnh khi parent truyền rỗng. */
  private _loadOilQuota(vehicleId: number) {
    this.loadingQuota = true;
    this._vihicleService.getDetail(vehicleId).subscribe({
      next: (res: any) => {
        this.loadingQuota = false;
        if ((res?.code === '200' || res?.code === '201') && res?.data?.listOilQuota?.length) {
          this.listOilQuota = res.data.listOilQuota;
        }
      },
      error: () => { this.loadingQuota = false; }
    });
  }

  // ───────────── Tải trọng → định mức dầu ─────────────
  // Chọn tải trọng (từ định mức dầu của xe trên lệnh) → suy ra định mức + lượng dầu,
  // giống chặng chính: fuelNorm = shortWay ? shortWayValue : value; fuel = norm*km/100.
  onPayloadChange(event: any) {
    if (!this.draft) return;
    this.draft.payloadWeight = event?.id ?? null;
    this.draft.fuelNorm = event ? (this._shortWay ? event.shortWayValue : event.value) : null;
    this._recalcFuelAmount();
  }
  private _recalcFuelAmount() {
    if (!this.draft) return;
    const norm = this.draft.fuelNorm || 0;
    const km = this.draft.distanceKm || 0;
    this.draft.fuelAmountCalculated = +(((norm * km) / 100)).toFixed(2);
  }

  // Áp giá trạm BOT theo loại xe của lệnh
  private _applyTollPrices(item: TransportOrderExtraSegment) {
    const vietmapKey = this._vehicleBotTypeId ? (this._botTypeMap[this._vehicleBotTypeId] ?? null) : null;
    (item.listStations || []).forEach(station => {
      if (!station.allPrices) return;
      try {
        const prices = JSON.parse(station.allPrices);
        station.price = vietmapKey ? (prices[vietmapKey] || 0) : 0;
      } catch { station.price = 0; }
    });
  }

  // ───────────── Lưu ─────────────
  canSave(): boolean {
    return !!this.draft?.startLocationId
      && !!this.draft?.endLocationId
      && !!this.draft?.distanceKm
      && !!this.draft?.payloadWeight          // bắt buộc chọn tải trọng (để tính dầu)
      && !!(this.draft?.note || '').trim()
      && !this.saving;
  }

  save() {
    if (this.saving) return;
    const d = this.draft;
    if (!d) return;
    // Báo rõ thiếu gì thay vì disable câm (trước đây bấm không thấy phản ứng).
    if (!d.startLocationId || !d.endLocationId) {
      this._notif.printErrorMessage('Vui lòng chọn cả Điểm đi và Điểm đến.');
      return;
    }
    if (!d.distanceKm) {
      this._notif.printErrorMessage('Chưa có số km — bấm "Tính Vietmap" hoặc "So sánh" trước khi lưu.');
      return;
    }
    if (!d.payloadWeight) {
      this._notif.printErrorMessage('Vui lòng chọn Tải trọng (để tính dầu).');
      return;
    }
    if (!(d.note || '').trim()) {
      this._notif.printErrorMessage('Vui lòng nhập Ghi chú phát sinh.');
      return;
    }
    const payload: TransportOrderExtraSegment = {
      transportOrderId: d.transportOrderId,
      startLocationId: d.startLocationId,
      startLocationType: d.startLocationType,
      startLocationName: d.startLocationName,
      startLat: d.startLat,
      startLng: d.startLng,
      endLocationId: d.endLocationId,
      endLocationType: d.endLocationType,
      endLocationName: d.endLocationName,
      endLat: d.endLat,
      endLng: d.endLng,
      distanceKm: d.distanceKm,
      payloadWeight: d.payloadWeight,
      fuelNorm: d.fuelNorm,
      fuelAmountCalculated: d.fuelAmountCalculated,
      routePolyline: d.routePolyline,
      stationsJson: d.listStations?.length ? JSON.stringify(d.listStations) : null,
      waypointsJson: d.listWaypoints?.length ? JSON.stringify(d.listWaypoints) : null,
      note: d.note?.trim()
    };
    this.saving = true;
    this._transportService.addExtraSegment(payload).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.code === '200' && res.data) {
          const r = res.data;
          const newItem: TransportOrderExtraSegment = {
            ...payload,
            id: r.newExtraSegmentId,
            seqNo: r.newSeqNo,
            listStations: d.listStations || [],
            listWaypoints: d.listWaypoints || []
          };
          this.SaveSuccess.emit({ newItem, totals: r.totals });
          this._notif.printSuccessMessage('Đã thêm cung đường phát sinh.');
          this.modalAddExtra.hide();
        } else {
          this._notif.printErrorMessage(res.message || 'Lưu thất bại.');
        }
      },
      error: (err) => {
        this.saving = false;
        this._notif.printErrorMessage(err?.error?.message || 'Lưu thất bại.');
      }
    });
  }
}
