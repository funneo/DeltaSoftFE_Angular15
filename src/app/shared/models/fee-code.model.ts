export class FeeCode {
    id?: number;
    feeCode?: string;
    feeName?: string;
    feeNameEnglish?: string;
    parentId?: number;
    level?: number;
    status?: number;
    notes?: string;
    paymentFeeGroupId?: number;
    revenueFeeGroupId?: number;
    debitAccount?: string;
    creditAccount?: string;
    mappingFeeIds?: string;
    mappedCodes?: string;
    isInvoiceInput?: boolean;   // cờ "được quét invoice" (lọc dropdown phân nhóm cấp 2)
    checked?: boolean;
    totalRows?: number;
}
