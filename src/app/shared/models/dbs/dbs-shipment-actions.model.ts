export interface DbsShipmentActions {
  id?: number;
  workflowId?: number;
  jobName?:string;
  wfAcitonId?: number;
  procedureName?: string;
  dateTimeZone?: Date | string;
  destinationCode?: string;
  code?: string;
  ediCustomerNumber?: number;
  ediCustomerDepartment?: string;
  ediReference?: string;
  internalNumber?: number;
  status?: number;
  rStatus?:string;
  errormessage?: string;
}
