export interface Deposit {
  id?: number;
  branchId?: number | null;
  employeeId?: number | null;
  supplierId?: number | null;
  type?: number | null;
  refDate?: string;
  refNo?: string;
  amount?: number | null;
  isComplete?: boolean | null;
  isPayment?: boolean | null;
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
  paymentDate?: string;
  paymentContent?: string;
  depositor?: string;
  checked?: boolean;
}
