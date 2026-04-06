export interface DispatchOrderEtc {
    id?: number;
    refNo?: string;
    feeId?:number;
    feeCode?:string;
    feeName?:string;
    tollStationId?: number;
    tollStationName?:string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    isPassed?: boolean;//Biễn này xác định xem tài xế có trốn vé hay không?
}
