export interface DispatchOrderPurchasePrice {
    id?: number;
    refNo?: string;
    feeId?:number;
    feeCode?: string;
    feeName?: string;
    contents?: string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
}
