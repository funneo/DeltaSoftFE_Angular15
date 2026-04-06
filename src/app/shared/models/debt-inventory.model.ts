export interface DebtInventory {
  id?: number;
  branchId?: number | null;
  employeeId?: number | null;
  refDate?: string;
  refNo?: string;
  amount?: number | null;
  isComplete?: boolean | null;
  status?: boolean | null;
  reason?: string;
  feedback?: string;
  notes?: string;
  deleted?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
  acceptedBy?: string | null;
  acceptedDate?: string | null;
  employeeName?:string;
  checked?: boolean;

  advanceAmount?:number;
  paymentAmount?:number;
  beginPeriod?:number;
  listPaymentId?:string;
  listAdvanceId?:string;
}
