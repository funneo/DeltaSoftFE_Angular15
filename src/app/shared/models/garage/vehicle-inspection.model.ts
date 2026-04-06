import { VehicleInspectionDetailed } from "./vehicle-inspection-detailed.model";

export interface VehicleInspection {
  id?: number;
  refNo?: string;
  branchId?: number;
  vehicleId?: number;
  licensePlates?:string;
  startWorkingTime?: string;
  endWorkingTime?: string;
  driverHealth?: number;
  createdBy?: string;
  createdByName?:string;
  createdDate?: Date | string;
  acceptBy?: string;
  acceptByName?:string;
  acceptDate?: Date | string;
  acceptNotes?: string;
  type?: number;
  status?: number;
  checked?:boolean;
  detaileds?:VehicleInspectionDetailed[];
  rStatus?:string;
  result?:number;
}
