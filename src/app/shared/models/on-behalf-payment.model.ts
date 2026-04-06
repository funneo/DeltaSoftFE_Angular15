export class OnBehalfPayment {
    id: number;
    jobId: string;
    shipmentId?: number;
    vendorId?: number;
    chargeTypeId?: number;
    estimatedAmount: number;
    actualAmount: number;
    vatAmount: number;
    currency: string;
    paymentStatus: number;
    invoiceStatus: number;
    recoveryStatus: number;
    description: string;
    createdBy: string;
    createdDate: Date;
    approvedBy: string;
    approvedDate: Date;
    status: boolean;
    deleted: boolean;
    checked?: boolean;
}

export class OnBehalfPaymentPayment {
    id: number;
    paymentId: number;
    amount: number;
    paymentMethod: number; // 1: Cash, 2: Transfer (QR)
    bankTransactionId: string;
    paymentDate: Date;
    note: string;
    createdBy: string;
    createdDate: Date;
}

export class OnBehalfPaymentInvoice {
    id: number;
    paymentId: number;
    invoiceNo: string;
    invoiceDate: Date;
    vendorId: number;
    amount: number;
    vatAmount: number;
    filePath: string;
    createdDate: Date;
}

export class OnBehalfPaymentRecovery {
    id: number;
    paymentId: number;
    customerId: number;
    arInvoiceId?: number;
    amount: number;
    recoveryDate: Date;
    createdDate: Date;
}
