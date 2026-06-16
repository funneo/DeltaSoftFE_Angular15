export interface Payments{
  id?: number;
  branchId?: number;
  employeeId?: number;
  refNo?: string;
  refDate?: string;
  workflowId?: number;
  type?: number | null;
  contents?: string;
  totalAmount?: number | null;
  notes?: string;
  relatedDocuments?:string;
  isCompleted?: boolean | null;
  status?:boolean;
  checked?: boolean;
  paymentDetails?: PaymentDetail[];
  feedback?:string;
  employeeName?:string;
  step?:number;
  customerId?:number;
  customerName?:string;
  supplierId?:number;
  cdsNumber?: string;
  hawB_HBL?: string;
  mawB_MBL?: string;
  invoiceNo?: string;
  shipmentNo?: string;
  bookingNo?: string;
  shipmentId?:number;
  weight?:number;
  deleted?:boolean;
  advancesId?:number;
  advancesRefNo?:string;
  createdBy?:string;
  isDirectPayment?:number;//Thanh toán trực tiếp hoặc có tạm ứng
  groupFeeCode?:string;//Nhóm phí cấp 1 (FeeCode Lvl1) — 1 phiếu thuộc 1 nhóm phí
  subFeeCode?:string;//Phân nhóm cấp 2 (FeeCode Lvl2)
}

export interface PaymentDetail {
  id?: number;
  paymentId?: number;
  feeId?: number;
  contents?: string;
  referCode?: string;
  amount?: number | null;
  amountAfterVAT?: number | null;
  invoiceNo?: string;
  invoiceDate?:string;
  invoicePattern?:string;
  taxNumber?: string;
  web?: string;
  code?: string;
  branchId?: number | null;
  notes?: string;
  step?: number | null;
  isCompleted?: boolean | null;
  acceptedBy?: string | null;
  stepLable?:string;
  tempId?:number;
  paymentFeeGroupId?:number;
  hasAccept?:boolean;
  feeCode?: string;
  feeName?: string;
  feeNameEnglish?:string;
  jobId?: string;
  shipmentId?: number;
  vat?: number;
  feedback?:string;
  userName?:string;
  refNo?:string;
  cdsNumber?:string;
  hawB_HBL?:string;
  bookingNo?:string;
  noiDung?:string;
  ghiChu?:string;
  employeeName?:string
  type?: number | null;
  customerId?:number;
  supplierId?:number;
  isPaymented?:number;
  status?:number;
  branchCode?:string;
  hasInvoice?:number;
  groupCode?:string;
  required?:boolean;
  requiredCheckInvoice?:boolean;
  currency?:string;
  exchangeRate?:number;
  checked?:boolean;
  a_RefNo?:string;//AdditionalInvoiceInformation RefNo
  paymentRefNo?:string;
  acceptedDate?:string;
  isExpired?:boolean;
  debitAccount?:string;
  creditAccount?:string;
  isDirectPayment?:number;//Thanh toán trực tiếp hoặc có tạm ứng, cái này sẽ link từ thằng cha nó vào
  supplierName?:string;
  pendingInvoiceId?: number;// link tới PendingInvoice nếu dòng này pick từ modal "Chọn từ hóa đơn đã đọc"
}
