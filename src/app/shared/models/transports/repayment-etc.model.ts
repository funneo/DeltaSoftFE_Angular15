import { RepaymentEtcDetail } from "./repayment-etc-detail.model";

export interface RepaymentEtc {
  id?: number;
  refNo?:string;
  branchId?: number;
  branchCode?:string;
  vehicleId?:number;
  licensePlates?:string;
  employeeId?: number;
  employeeFullName?:string;
  totalCost?: number;
  contents?: string;
  notes?: string;
  status?: number;
  createdBy?: string;
  createdByName?:string;
  createdDate?: Date | string;
  acceptBy?: string;
  acceptByName?:string;
  acceptDate?: Date | string;
  acceptNotes?: string;
  deleted?: boolean;
  checked?:boolean;
  rStatus?:string;
  detaileds?: RepaymentEtcDetail[];
}
