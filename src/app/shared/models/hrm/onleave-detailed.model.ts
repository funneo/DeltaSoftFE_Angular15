export interface OnleaveDetailed {
    id?: number;
    onLeaveId?: number;
    onLeaveDate?: string;
    type?: string;
    quantity?: number;
    notes?: string;
    userId?: string | null;
    isApproved?: boolean;
}
