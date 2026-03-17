import { EmployeeDebitClosingDetail } from "./employee-debit-closing-detail.model";

export interface EmployeeDebitClosing {
    id?: number;
    branchId?: number;
    refNo?: string;
    employeeId?: number;
    employeeFullName?: string;
    contents?: string;
    note?: string;
    previousDebit?: number;
    debit?: number;
    credit?: number;
    debitBalance?: number;
    status?: number;
    deleted?: boolean;
    createdBy?: string;
    createdDate?: Date | string;
    approvedBy?: string;
    approvedDate?: Date | string;
    details?: EmployeeDebitClosingDetail[];
    checked?: boolean;
    isTransfer?: boolean;
}
