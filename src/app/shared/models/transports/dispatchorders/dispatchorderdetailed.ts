import { Workflow } from "../../workflows/workflow.model";

export interface Dispatchorderdetailed {
    id?: number;
    refNo?: string;

    workflowId?: number;
    shipmentId?:number;
    jobId?: string;
    refDate?:string | Date;
    customerCode?:string;
    customerName?:string;
    debitNo?:string;
    contSeal?: string;
    referCode?: string;
    note?: string;

    jobLocked?:boolean;
    jobLockedName?:string;

    item?:Workflow;
}
