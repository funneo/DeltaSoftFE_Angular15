export interface SummarySupplierCost {
  id?: number;
  refNo?: string;
  branchId?: number;
  branchCode?: string;
  supplierId?: number;
  supplierName?: string;
  refDate?: string;
  type?: number;
  typeName?: string;
  contents?: string;
  amount?: number;
  vat?: number;
  amountAfterVAT?: number;
  currency?: string;
  exchangeRate?: number;
  invoiceNo?: string;
  invoiceDate?: string;
  invoicePattern?: string;
  taxNumber?: string;
  web?: string;
  code?: string;
  feedback?: string;
  notes?: string;
  status?: number;
  debitAccount?: string;
  creditAccount?: string;
  deleted?: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedByName?: string;
  updateDate?: string;
  rStatus?: string;
  checked?: boolean;
  details?: SummarySupplierCostDetails[];
}

export interface SummarySupplierCostDetails {
  id?: number;
  summarySupplierCostId?: number;
  refNo?: string;
  contents?: string;
  notes?: string;
  amount?: number;
  createdDate?: string;
}
