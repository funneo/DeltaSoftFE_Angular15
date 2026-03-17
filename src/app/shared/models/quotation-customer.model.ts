export interface QuotationCustomer{
  id?: number;
  quotationNo?: string;
  quotationName?: string;
  type?: number | null;
  potentialCustomerId?: number | null;
  reference?: string;
  contents?: string;
  quotationConditions?: string;
  currency?: string;
  otherPrices?: string;
  serviceConditions?: string;
  notes?: string;
  receivedEmail?: string;
  ccEmails?: string;
  customerId?: number | null;
  refDate?: string;
  sDate?: string;
  fDate?: string;
  employeeId?: number | null;
  employeeFullName?:string;
  managerId?:number;
  managerFullName?:string;
  branchId?: number | null;
  acceptedBy?: string | null;
  status?:boolean;
  checked?: boolean;
  customerName?:string;
  step?: number | null;
  isFinish?: boolean | null;
  isDeny?:boolean;
  quotationId?:string;
  contractId?:number;
  reason?:string;
  parentId?: number;
  quotationCustomerDetails?: QuotationCustomerDetail[];
}

export interface QuotationCustomerDetail {
  id?: number;
  quotationId?: number;
  feeId?: number | null;
  contents?: string;
  amount?: number | null;
  notes?: string;
  tempId?:number;

  code?: string;
  serviceId?: number | null;
  serviceName?: string;
  branchId?: number | null;
  unit?: string;
  currency?: string;
}
