export interface AdditionalInvoiceInformationDetail {
    additionalInvoiceInformationId?:number;
    paymentDetailId?:number;
    paymentId?:number;
    paymentRefNo?:string;
    feeId?: number;
    feeCode?: string;
    feeName?: string;
    contents?: string;
    amount?: number | null;
    vat?: number | null;
    amountAfterVAT?: number | null;
    notes?: string;
}
