export interface Repayment {
  id?: number;
  branchId?: number;
  employeeId?: number;
  refNo?: string;
  refDate?: string;
  type?: number;
  personalLoanId?: number;
  amount?: number;
  isComplete?: boolean;
  reason?: string;
  notes?: string;
  feedback?: string;
  status?:boolean;
  checked?: boolean;
  employeeName?:string;
  step?:number;
  styleStep?:string;
}
