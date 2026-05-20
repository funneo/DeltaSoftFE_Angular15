export interface DispatchOrderEtc {
    id?: number;
    refNo?: string;
    feeId?:number;
    feeCode?:string;
    feeName?:string;
    tollStationId?: number;
    tollStationName?:string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    isPassed?: boolean;//Biễn này xác định xem tài xế có trốn vé hay không?

    // ===== FE-only helpers (KHÔNG gửi BE) — trạm auto từ Vietmap =====
    _auto?: boolean;        // true = dòng auto sinh từ route Vietmap của 1 chặng
    _segIndex?: number;     // chặng nguồn (để thay thế đúng khi tính lại route)
    _allPrices?: string;    // JSON giá theo loại xe → tính lại Cost khi đổi xe
    _vietmapId?: number;    // id trạm Vietmap (tham chiếu)
}
