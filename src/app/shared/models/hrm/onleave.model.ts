import { OnleaveDetailed } from "./onleave-detailed.model";

export interface Onleave {
    id?: number;
    branchId?: number;
    branchName?:string;
    createdDate?: Date | string;
    createdBy?: string;
    createdByName?:string;
    departmentId?: number;
    departmentName?:string;
    type?: number;
    reason?: string;
    numberOfLeaveDay?: number;
    remainingOfLeaveDay?: number;
    total?:number;
    approvedNotes?: string;
    approvedBy?: string | null;
    approvedByName?:string;
    approvedDate?: Date | string | null;
    status?: number;
    rStatus?:string;
    checked?:boolean;
    isApprove?:boolean;
    isChuyenduyet?:boolean;
    onLeaveDay?:number;
    checkValue?:boolean;
    listOnLeaveDetailed?:OnleaveDetailed[];
}
