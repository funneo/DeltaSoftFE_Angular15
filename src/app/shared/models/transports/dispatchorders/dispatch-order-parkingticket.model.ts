export interface DispatchOrderParkingticket {
    id?: number;
    refNo?: string;
    parkingName?: string;
    parkingAddress?: string;
    feeId?:number;
    feeCode?:string;
    feeName?:string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    checked?:boolean;
    flagNew?:boolean;
    index?:number;
}
