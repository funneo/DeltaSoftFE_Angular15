export interface OpenShipment {
  id?: number;
  branchId?: number;
  employeeId?: number;
  customerId?: number;
  shipmentId?: number;
  notes?: string;
  step?: number;
  feedback?: string;
  status?:boolean;
  checked?: boolean;
  jobId?:string;
  customerName?:string;
  cdsNumber?: string;
  hawB_HBL?: string;
  mawB_MBL?: string;
  invoiceNo?: string;
  accept?:boolean;
  createdBy?:string;
  updatedBy?:string;
  updatedDate?:string;
  createdDate?:Date | string;
  createdByName?:string;
  rStatus?:string;
}
