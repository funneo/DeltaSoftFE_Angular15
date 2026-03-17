export interface CancelDispatchOrder {
    id?: number;
    branchId?: number;
    refNo?: string;
    reason?: string;
    createdDate?: Date | string;
    createdBy?: string;
    dispatchOrderCreatedByFullName?:string;
    dispatchOrderCreatedBy?:string;
    createdByFullName?:string;
    acceptedBy?: string;
    acceptedByFullName?:string;
    status?: number;
    rStatus?:string;
    notes?: string;
}
