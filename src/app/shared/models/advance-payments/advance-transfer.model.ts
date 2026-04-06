export interface AdvancesTransfer {
    id?: number;
    branchId?: number;
    invoiceBranchId?: number;
    invoiceBranchCode?: string;
    employeeId?: number;
    refNo?: string;
    refDate?: string;
    advanceGroupId?: number;
    supplierId?: number;
    supplierCode?: string;
    supplierName?: string;
    shipmentId?: number;
    customerId?: number;
    jobId?: string;
    amount?: number;
    currency?: string;
    acceptStep?: number;
    isComplete?: boolean;
    isPayment?: boolean;
    status?: boolean;
    reason?: string;
    feedback?: string;
    notes?: string;
    relatedDocuments?: string;
    accountNumber?: string;
    bank?: string;
    bankId?: number;
    deleted?: boolean;
    createdBy?: string; // Guid
    createdDate?: string;
    updatedBy?: string; // Guid
    updatedDate?: string;
    acceptedBy?: string; // Guid
    isEmployeeDebitClosing?: boolean;
    employeeName?: string;
    styleStep?: string;
    has_accept?: boolean;
    checked?: boolean;
}
