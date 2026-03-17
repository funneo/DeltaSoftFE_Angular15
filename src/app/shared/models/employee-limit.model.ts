export interface EmployeeLimit {
  id?: number;
  branchId?: number ;
  employeeId?: number ;
  debitLimit?: number ;
  debitTransferLimit?: number ; 
  type?: number ;
  status?: boolean ;
  updatedBy?: string ;
  updatedDate?: string;
  checked?: boolean;
  employeeName?:string;
  tel?:string;
  notes?:string;
}
