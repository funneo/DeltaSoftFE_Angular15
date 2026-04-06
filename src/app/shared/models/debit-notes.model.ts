export interface DebitNotes {
  id?: number;
  type?: number;
  branchId?: number;
  debitNo?: string;
  refDate?: string;
  debitType?: string;
  debitDate?: string;
  accountingDate?: string;
  debitBranchId?: number | null;
  employeeId?: number;
  customerId?: number | null;
  partnerId?: number | null;
  shipmentId?: number;
  contractId?: number | null;
  quotationId?: number | null;
  step?: number | null;
  exchangeRate?: number | null;
  currency?: string;
  notes?: string;
  status?:boolean;
  checked?: boolean;
  customerName?:string;
  totalAmount?:number;
  rating?:number;
  jobId?:string;
  cdsNumber?: string;
  hawB_HBL?: string;
  mawB_MBL?: string;
  invoiceNo?: string;
  deltaInvoiceNo?:string;
  isCanon?:boolean;
  
  invoiceNotes?:string;
  invoiceDate?:string;
  shipmentNo?: string;
  bookingNo?: string;
  tenCongTy?:string;
  diaChiCongTy?:string;
  dienThoaiCongTy?:string;
  mstCongTy?:string;
  accounts?:string;
  bank?:string;
  faxCongTy?:string;
  tenKhachHang?:string;
  diaChiKhachHang?:string;
  maSoThue?:string;
  tenLoaiHinh?:string;
  ngayToKhai?:string;
  isLocked?:boolean;
  quantityOfGgoods?:string;
  isDebt?:boolean;
  debitNoteDetails?: DebitNoteDetail[];
  createdBy?:string;
  creaatedDate?:Date
  createdByName?:string;
  isDebitApproved?:boolean;
}

export interface DebitNoteDetail {
  id?: number;
  debitNoteId?: number;
  feeId?: number;
  contents?: string;
  referCode?: string;
  amount?: number | null;
  vat?: number | null;
  amountAfterVAT?: number | null;
  invoiceNo?: string;
  notes?: string;
  groupFee?: string;
  tempId?:number;
  unit?:string;
  price?:number;
  quantity?:number;
  rVat?:number;
  feeName?:string;
  feeCode?:string;
  currency?:string;
  invoiceDate?:string;
  debitAccount?:string;
  creditAccount?:string;
  workflowId?:number;
}

export interface RatingCS {
  id?: number;
  branchId?: number;
  employeeId?: number;
  debitId?: number;
  rating?: number | null;
  feedback?: string;
  status?: boolean | null;
  deleted?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
  debitNo?:string;
}
