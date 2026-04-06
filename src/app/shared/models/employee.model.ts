export interface Employee {
  id?: number;
  branchId?: number;
  employeeCode?: string;
  employeeFullName?: string;
  dateOfBirth?: string;
  sex?: boolean;
  idNumber?: string;
  issueedDate?: string;
  issueedPlace?: string;
  taxCode?: string;
  address?: string;
  telephone?: string;
  email?: string;
  departmentId?: number;
  departmentName?:string;
  titleName?:string;
  titleId?: number;
  accountNumber?: string;
  bank?: string;
  status?: boolean;
  startDate?: string;
  contractDate?: string;
  note?: string;
  imagePath?: string;
  checked?: boolean;
  userId?:string;
  paymentLevel?:number;
}
