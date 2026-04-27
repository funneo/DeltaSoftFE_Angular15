import { AccountingDetail } from "./accounting-detail.model";
import { AccountsPaymentDetail } from "./accounts-payment-detail.model";

export interface Accounts {
  id?: number;
  branchId?: number;
  accountBranchId?: number;
  accountListId?: number;
  type?: number;
  refNo?: string;
  refDate?: string;
  effectiveDate?: string;
  employeeId?: number;
  customerId?: number;
  agencyId?: number;
  supplierId?: number;
  represent?: string;
  invoiceNo?: string;
  documentNo?: string;
  contents?: string;
  isTransfer?: boolean;
  amount?: number;
  vat?: number;
  amountVat?: number;
  currency?: string;
  treasurerId?: number;
  groupType?: number;
  notes?: string;
  status?: boolean;
  checked?: boolean;
  employeeName?: string;
  accountListName?: string;
  accountingDetails?: AccountingDetail[];
  accountPayments?: AccountsPaymentDetail[];
  ctyName?: string;
  ctyAdd?: string;
  ctyTel?: string;
  tenDonVi?: string;
  tenQuy?: string;
  tenThuQuy?: string;
  createdByName?: string;
  paymentDetailId?: number;
  accountType?: number;
  typeAccount?: number;
  advanceId?: number;
  detailedType?: number;
  dispatchOrderFees?: AcountDispatchOrderFees[];
}

export interface AcountDispatchOrderFees {
  id?: number;
  accountId?: number;
  feeId?: number;
  feeCode?: string;
  feeName?: string;
  refNo?: string;
  contents?: string;
  amount?: number;
  cost?: number;
  vat?: number;
  amountAfterVat?: number;
  totalCost?: number;
  type?: number;
  checked?: boolean;
}
