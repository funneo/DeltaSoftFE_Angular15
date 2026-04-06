export interface VehicleInspectionJob {
  id?: number;
  branchId?: number;
  branchCode?:string;
  jobName?: string;
  note?: string;
  isPeriodic?: boolean;
  isFrequent?: boolean;
  sortOrder?: number;
  actived?: boolean;
  updateBy?:string;
  updateDate?:string;
  checked?:boolean;
}
