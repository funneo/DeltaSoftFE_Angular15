export interface IgasHistory {
    id?: number;
    orderId?: number;
    orderNumber?: string;
    amount?: number;
    price?: number;
    cost?: number;
    deviceTime?: Date | string;
    serverTime?: Date | string;
    nozzleCode?: number;
    stationId?: number;
    quotaValue?: number;
    odometer?: number;
    note?: string;
}
