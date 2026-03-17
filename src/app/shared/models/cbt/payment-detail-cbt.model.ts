export interface PaymentDetailCbt {
    id?: number;
    paymentId?: number;
    feeId?: number;
    contents?: string;
    quantity?: number;
    unit?: string;
    price?: number;
    amount?: number;
    vat?: number;
    amountAfterVAT?: number;
    invoiceNo?: string;
    invoiceDate?: string;
    invoicePattern?: string;
    taxNumber?: string;
    web?: string;
    code?: string;
    notes?: string;
    hasInvoice?: number;
    tempId?:number;
    checked?:boolean;
}
