export interface Debt{
  id?: number;
  refNo?: string;
  refName?: string;
  refDate?: string;
  branchId?: number;
  debitBranchId?:number;
  customerId?: number | null;
  supplierId?: number | null;
  employeeId?: number | null;
  totalDebit?: number | null;
  totalCredit?: number | null;
  vat?: number | null;
  type?: number | null;
  jobId?:string;
  invoiceNo?:string;
  notes?: string;

  documentNo?: string;
  documentType?: string;
  isDauKy?: boolean | null;
  refType?: string;
  status?:boolean;
  checked?: boolean;
  customerName?:string;
  debtDetails?: DebtDetail[];
  createdBy?:string;
  createdByName?:string;
  updatedDate?:Date | string;
  createdDate?:Date | string;
  updatedBy?:string;
  updatedByName?:string;
  deleted?:boolean;
  totalRows?:number;
  isPaid?:boolean;
  locked?:boolean;
  }

export interface DebtDetail {
  id?: number;
  debtId?: number;
  content?: string;
  gType?: string;
  amount?: number | null;
  notes?: string;
  tempId?:number;
}

export interface DebtReportViewModel {
  customerName?: string;
  supplierName?: string;
  totalRows?: number;
  id?: number;
  dauKy?: number;
  psn?: number;
  psc?: number;
  cuoiKy?: number;
}
