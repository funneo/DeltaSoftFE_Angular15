import { Customer } from "./customer.model";

export interface PermissionPayment {
  id?: number;
  branchId?: number;
  userName?: string;
  listPaymentFeeGroupId?: string;
  listCustomerId?: string;
  listUserName?: string;
  type?: number;
  notes?: string;
  status?:boolean;
  checked?: boolean;
  paymentGroupName?:string;
  customers?:Customer[];
  branchCode?:string;
}
