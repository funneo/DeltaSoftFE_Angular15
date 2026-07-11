export interface DispatchOrderFee {
    id?: number;
    refNo?: string;
    feeId?: number;
    feeCode?: string;
    feeName?: string;
    quantity?: number;
    contentsId?: number;
    contents?: string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    checked?: boolean;
    type?: number;
    // FCL v2 — phân loại chứng từ + thông tin hóa đơn lái xe khai (tab Chi phí).
    //   invoiceType: 0 = Không có hóa đơn · 1 = Có phiếu thu · 2 = Có hóa đơn (bắt nhập đủ 6 field).
    invoiceType?: number;
    invoiceNo?: string;
    invoiceDate?: string;
    invoicePattern?: string;
    taxNumber?: string;
    web?: string;
    code?: string;
}
