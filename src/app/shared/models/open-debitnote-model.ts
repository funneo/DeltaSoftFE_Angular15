export interface OpenDebitNote {
  id?: number;
  branchId?: number;
  employeeId?: number | null;
  customerId?: number;
  debitNoteId?: number;
  notes?: string;
  step?: number;
  feedback?: string;
  status?: boolean | null;
  deleted?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  createdByName?:string;
  updatedBy?: string | null;
  updatedDate?: string | null;
  checked?: boolean;
  jobId?:string;
  customerName?:string;
  cdsNumber?: string;
  hawB_HBL?: string;
  mawB_MBL?: string;
  invoiceNo?: string;
  debitNo?:string;
  accept?:boolean;
}
