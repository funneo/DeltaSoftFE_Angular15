export interface PersonalLoan{
  id?: number;
  branchId?: number;
  employeeId?: number;
  refDate?: string;
  refNo?: string;
  advanceGroupId?: number;
  type?: number;
  isTransfer?: boolean;
  amount?: number;
  acceptStep?: number;
  isComplete?: boolean;
  isPayment?: boolean;
  reason?: string;
  notes?: string;
  feedback?:string;
  status?:boolean;
  checked?: boolean;
  employeeName?:string;
  step?:string;
  amountRepayment?:number;
  repaymentPlan?:string;
}
