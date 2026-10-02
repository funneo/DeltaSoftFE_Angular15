// F051 — Yêu cầu thu/chi từ PM Xưởng (Tbl_GaragePaymentRequest)
// requestType: 1 Chi trả trước | 2 Chi trả sau | 3 Thu trả trước | 4 Thu trả sau
// direction  : 1 Chi | 0 Thu
// status     : 0 Chờ viết phiếu | 1 Đã viết phiếu | 2 Xưởng đã hủy
export interface GaragePaymentRequest {
  id?: number;
  requestType?: number;
  direction?: number;
  externalRefNo?: string;
  branchId?: number;
  branchCode?: string;
  externalStatus?: string;
  requestDate?: string;
  dueDate?: string;
  partnerCode?: string;
  partnerName?: string;
  partnerTaxCode?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  partnerAddress?: string;
  contents?: string;
  amount?: number;
  currency?: string;
  licensePlate?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  invoiceFileUrl?: string;
  personInCharge?: string;
  notes?: string;
  rawJson?: string;
  status?: number;
  accountId?: number;
  accountRefNo?: string;
  accountedDate?: string;
  cancelReason?: string;
  cancelledDate?: string;
  receivedDate?: string;
  lastReceivedDate?: string;
  receiveCount?: number;
  totalRows?: number;
  checked?: boolean;
}

// Nhóm theo tên đối tượng (NCC/KH) trên màn thủ quỹ
export interface GaragePaymentRequestGroup {
  partnerName: string;
  items: GaragePaymentRequest[];
  total: number;
}
