export interface ApiFrombodyCreateOrder {
    commandNo?: string;
    stationId?: number;
    nozzleCode?: number;
    customerId?: number;
    vehicleId?: number;
    driverId?: number;
    paymentStatus?: number;
    nextTime?: number;
    deliveryTime?: string;
    expiredTime?: string;
    unitType?: number;
    quotaValue?: number;
    amount?: number;
    km?: number;
    description?: string;
}
