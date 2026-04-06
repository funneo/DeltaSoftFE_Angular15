import { CanonQuotationsubcontractorsdetailed } from "./canon-quotationsubcontractorsdetailed.model";

export interface CanonQuotationsubcontractors {
    id?: number;
    quotationCode?: string;
    branchId?: number;
    supplierId?: number;
    supplierName?: string;
    vihicleTypeId?: number;
    vihicleTypeName?: string;
    note?: string;
    isActived?: boolean;
    oilPrice?: number;
    validUntil?: string;
    status?: number;
    createdBy?: string;
    createdByName?: string;
    createdDate?: Date | string;
    isApproved?: boolean;
    isLocked?: boolean;
    deleted?: boolean;
    checked?: boolean;
    reason?: string;
    canonQuotationSubcontractorsDetaileds?: CanonQuotationsubcontractorsdetailed[];
}
