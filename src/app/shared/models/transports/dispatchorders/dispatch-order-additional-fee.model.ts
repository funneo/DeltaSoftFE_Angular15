import { DispatchOrderAdditionalFeeDetailed } from "./dispatch-order-additional-fee-detailed.model";

export interface DispatchOrderAdditionalFee {
  id?: number;
  refNo?: string;
  branchId?: number;
  dispatchOrderRefNo?: string;
  reason?: string;
  createdBy?: string;
  createdByName?:string;
  createdDate?: Date | string;
  status?: number;
  acceptNotes?: string;
  acceptBy?: string | null;
  acceptByName?:string;
  acceptDate?: Date | string | null;
  deleted?: boolean;
  type?:number;
  detaileds?: DispatchOrderAdditionalFeeDetailed[];
  checked?:boolean;
  rStatus?:string;
}
