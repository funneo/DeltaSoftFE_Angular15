import { PaymentDetailCbt } from "./payment-detail-cbt.model";

export interface PaymentCbt {
    id?: number;
    branchId?: number;
    dispatchOrderRefNo?: string;
    customerId?:number;
    employeeId?: number;
    employeeName?:string;
    employeeFullName?:string;
    refNo?: string;
    refDate?:string;
    type?: number;
    contents?: string;
    totalAmount?: number;
    notes?: string;
    pelatedDocuments?: string;
    status?: boolean;
    step?: number;
    isPayment?:boolean;
    isComplete?:boolean;
    deleted?: boolean;
    createdBy?: string;
    createdByName?:string;
    createdDate?: Date | string;
    updatedBy?: string;
    updatedDate?: Date | string;
    shipmentId?: number;
    currency?: string;
    exchangeRate?: number;
    acceptedBy?: string;
    feedback?: string;
    details?: PaymentDetailCbt[];
    checked?:boolean;
    has_accept?:boolean;
}
