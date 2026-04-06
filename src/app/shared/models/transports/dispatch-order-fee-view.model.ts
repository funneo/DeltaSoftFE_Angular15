export interface DispatchOrderFeeView {
    refNo: string;
    createdDate: Date | string;
    createdBy: string;
    createdByName: string;
    branchId: number;
    branchCode: string;
    feeId: number;
    feeCode: string;
    feeName: string;
    quantity: number;
    cost: number;
    vat: number;
    totalCost: number;
    note: string;
}
