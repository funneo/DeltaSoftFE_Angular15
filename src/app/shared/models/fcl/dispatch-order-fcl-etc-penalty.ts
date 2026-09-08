// Vé ETC ngoài kế hoạch (2026-09-08): lái xe né trạm chính nhưng vẫn qua trạm phụ
// không thuộc lộ trình lệnh → tài khoản ETC công ty bị trừ. Ghi nhận NGAY TRONG lệnh
// FCL v2 (theo RefNo) để nhân sự trừ lương lái xe. KHÔNG cộng vào Tổng ETC của lệnh.
export interface DispatchOrderFclEtcPenalty {
    id?: number;
    refNo?: string;
    tollStationId?: number;
    tollStationName?: string;
    passedDate?: string;
    cost?: number;
    note?: string;
    isDeductedSalary?: boolean;
    deductedDate?: string;

    // ===== FE-only (KHÔNG gửi BE) — option cho daterangepicker của dòng =====
    _dateOption?: any;
}
