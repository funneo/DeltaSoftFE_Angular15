export interface ExportInvoice {
  id?: number;
  invoiceNo?: string;
  formNo?: string;
  serial?: string;
  invoiceDate?: string;
  delta_Code?: string;
  delta_Name?: string;
  delta_Taxcode?: string;
  delta_Add?: string;
  delta_Tel?: string;
  delta_Fax?: string;
  customerId?: string;
  customerName?: string;
  customerAdd?: string;
  customerTaxcode?: string;
  customerEmail?: string;
  paymentMethod?: string;
  vatRate?: number | null;
  vatAmount?: number | null;
  total?: number | null;
  grandTotal?: number | null;
  amountText?: string;
  branchId?: number;
  employeeId?: number | null;
  notes?: string;
  isPayment?: boolean | null;
  documentNo?: string;
  documentType?: string;
  customerBuyer?: string;
  status?:boolean;
  checked?: boolean;
  invoiceDetails?: ExportInvoiceDetail[];
  totalRows?:number;
  content?:string;
  invoicePattern?:string;
  invoiceSymbol?:string;
  currency?:string;
  locked?:boolean;
  canceled?:boolean;
  updateBy?:string;
  updateDate?:Date;
  rStatus?:string;
}

export interface ExportInvoiceDetail {
  id?: number;
  invoiceId?: number | null;
  tt?: string | null;
  feeId?: number | null;
  content?: string;
  licensePlate?: string; //licensePlate
  unit?: string;
  quantity?: number | null;
  unitPrice?: number | null;
  amount?: number | null;
  notes?: string;
  tempId?:number;
}
