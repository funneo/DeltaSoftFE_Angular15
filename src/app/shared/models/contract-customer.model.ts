export interface ContractCustomer{
  id?: number;
  contractNo?: string;
  contractName?: string;
  customerId?: number | null;
  reference?: string;
  contents?: string;
  quotationConditions?: string;
  currency?: string;
  otherPrices?: string;
  serviceConditions?: string;
  notes?: string;
  receivedEmail?: string;
  ccEmails?: string;
  refDate?: string;
  sDate?: string;
  fDate?: string;
  employeeId?: number | null;
  employeeFullName?:string;
  managerId?:number | null;
  branchId?: number | null;
  acceptedBy?: string | null;
  contractCustomerDetails?: ContractCustomerDetail[];
  status?:boolean;
  checked?: boolean;
  customerName?:string;
  isFinish?:boolean;
  step?: number | null;
  contractId?:string;
  appendixNo?:string
  isDeny?:boolean;
  reason?:string;
  parentId?: number;
}

export interface ContractCustomerDetail {
  id?: number;
  contractId?: number;
  feeId?: number | null;
  content?: string;
  amount?: number | null;
  notes?: string;
  tempId?:number;
}
