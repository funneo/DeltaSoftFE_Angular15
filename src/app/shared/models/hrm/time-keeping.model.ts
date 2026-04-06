export interface TimeKeeping {
    id?: number;
    branchId?: number;
    branchCode?:string;
    branchName?:string;
    userName?: string;
    employeeFullName?:string;
    timeKeepingDate?: string;
    isComming?: boolean;
    commingTime?: string;
    commingNote?: string;
    commingIp?: string;
    commingComputer?: string;
    isOutgoing?: boolean;
    outgoingTime?: string;
    outgoingNote?: string;
    outgoingIp?: string;
    outgoingComputer?: string;
}
