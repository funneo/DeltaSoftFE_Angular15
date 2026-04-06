export interface DispatchOrderTicket {
    id?: number;
    refNo?: string;
    feeId?:number;
    feeCode?:string;
    feeName?:string;
    tollStationId?: number;
    tollStationName?: string;
    taxCode?: string;
    patternNumber?: string;
    symbol?: string;
    number?: string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    isPaid?: boolean;
    dateOfPayment?: Date | string | null;
    paymentRefNo?: string;
    path?: string;
    flagNew?:boolean;
    index?:number;
}
