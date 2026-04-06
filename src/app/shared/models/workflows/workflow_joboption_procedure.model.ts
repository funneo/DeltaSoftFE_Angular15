export interface WorkflowJobOptionProcedure {
    id?: number;

    workflowId?: number;

    jobGroupId?: number;
    jobGroupName?:string;

    jobOptionId?: number;
    jopOptionName?:string;

    procedureId?: number;

    procedureName?: string;

    handlingTime?: Date | string;

    isFinish?: boolean;

    isPass?: boolean;

    latitude?: number;

    longtitude?: number;

    note?: string;
}