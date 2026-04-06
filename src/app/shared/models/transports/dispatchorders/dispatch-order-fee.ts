export interface DispatchOrderFee {
    id?: number;
    refNo?: string;
    feeId?: number;
    feeCode?: string;
    feeName?: string;
    quantity?: number;
    contentsId?: number;
    contents?: string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    checked?: boolean;
    type?: number;
}
