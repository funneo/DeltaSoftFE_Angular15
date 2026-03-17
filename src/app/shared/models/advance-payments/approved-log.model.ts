export interface ApprovedLog {
    refId?: number;
    refNo?: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedDate?: Date | string;
    status?: number;
    feedback?: string;
}
