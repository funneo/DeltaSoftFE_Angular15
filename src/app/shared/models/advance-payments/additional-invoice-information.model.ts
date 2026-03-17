import { AdditionalInvoiceInformationDetail } from "./additional-invoice-information-detail.model";

export interface AdditionalInvoiceInformation {
    id?: number;
    branchId?: number;
    refNo?: string;
    contents?: string;
    invoiceNo?: string;
    invoiceDate?: string;
    invoicePattern?: string;
    taxNumber?: string;
    web?: string;
    code?: string;
    note?: string;
    status?: number;
    createdBy?: string;
    createdByName?: string;
    createdDate?: Date | string;
    acceptedBy?: string;
    acceptedDate?: Date | string;
    details?: AdditionalInvoiceInformationDetail[];
    checked?: boolean;
    detailRefNos?: string;
    paymentIds?: string;
}
