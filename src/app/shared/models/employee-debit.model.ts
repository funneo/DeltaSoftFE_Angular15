export interface EmployeeDebit {
  id?: number;
  branchId?: number | null;
  branchCode?: string;
  employeeId?: number | null;
  debit?: number | null;
  credit?: number | null;
  debitBalance?: number | null;
  updatedDate?: string;
  refNo?: string;
  notes?: string;
  updatedBy?: string;
  type?: string;
  tableId?: number | null;
  employeeCode?: string;
  employeeName?: string;
  telephone?: string;
  totalRows?: number;

  hanMucTong?: number;
  hanMucCon?: number;

  checked?: boolean;
  debtInventoryId?: number;
  isTransfer?: boolean;
}
