import { OverTimeWorkflows } from "./over-time-workflows.model";

export interface OverTime {
    id?: number;
    branchId?: number;
    branchName?:string;
    createdDate?: Date | string;
    createdBy?: string;
    createdByName?:string;
    departmentId?: number;
    departmentName?:string;
    reason?: string;
    estimatedStartTime?:string;
    estimatedFinishTime?: string;
    startedTime?: Date | string | null;
    isStarted?: boolean;
    finishedTime?: Date | string | null;
    isFinished?: boolean;
    overTimeMinutes?: number;
    discontinuityTime?: number;
    adjustStartedTime?:  string | null;
    adjustFinishedTime?:  string;
    adjustDiscontinuityTime?: number;
    realityMinutes?: number;
    notes?: string;
    acceptedNotes?: string;
    acceptedBy?: string | null;
    acceptedByName?:string;
    acceptedDate?: Date | string | null;
    status?: number;
    rStatus?:string;
    checked?:boolean;
    isChuyenduyet?:boolean;
    isApprove?:boolean;
    details?:OverTimeWorkflows[];
}
