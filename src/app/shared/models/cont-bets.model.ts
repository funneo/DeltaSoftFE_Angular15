export interface ContBets {
  id?: number;
  branchId?: number ;
  employeeId?: number ;
  customerId?:number;
  refDate?: string;
  refNo?: string;
  advanceGroupId?: number;
  type?: number ;
  amount?: number ;
  acceptStep?: number ;
  isComplete?: boolean ;
  isPayment?: boolean ;
  reason?: string;
  carriers?: string;
  feedback?: string;
  notes?: string;
  status?:boolean;
  checked?: boolean;
  employeeName?:string;
  step?:string;
  createdDate?:string;
  createdBy?:string;
  carriersId?:number;
  reBetsDate?:  string | null;
  paymentDate?: string | null;
  explanationStatus?: number;
  explanationContents?: string;
  explanationDate?: string;
  explanationFeedback?: string;
  explanationAcceptBy?: string | null;
  //Biến này sẽ hiển thị cảnh báo mầu đối với các phiếu cược cont không đủ tiêu chí
  isAlert?:boolean;
}
