export interface EmployeeContract {
  id?: number;
  employeeId?: number;
  branchId?: number;
  contractNumber?: string;
  contractTypeId?: number;
  contractTypeName?: string;
  contractTypeCode?: string;
  contractDate?: string;       // dd/MM/yyyy khi gửi; ISO khi đọc
  effectiveDate?: string;
  endDate?: string;
  contractDuration?: string;
  signingPlace?: string;
  workLocation?: string;
  isActived?: boolean;
  note?: string;
  // tracking (read)
  daysToExpire?: number;
  isExpiringSoon?: boolean;
  trackingStatus?: string;
  employeeFullName?: string;
  employeeCode?: string;
  branchName?: string;
  branchCode?: string;
  departmentName?: string;
  titleName?: string;
  mainSalary?: number;
  insuranceSalary?: number;
  totalRows?: number;
}

export interface ContractNumberSuggestion {
  nextSeq?: number;
  token?: string;
  branchCode?: string;
  suggestedNumber?: string;
}

export interface EmployeeSalary {
  id?: number;
  employeeId?: number;
  mainSalary?: number;
  insuranceSalary?: number;
  effectiveDate?: string;      // dd/MM/yyyy khi gửi; ISO khi đọc
  isActived?: boolean;
  note?: string;
}
