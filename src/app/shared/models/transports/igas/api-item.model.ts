import { IgasHistory } from "./igas-history.model";

export interface ApiItem {
    couponCode?: string;
    commandNo?: string;
    expiredTime?: Date | string;
    deliveryTime?: Date | string;
    amount?: number;
    compensateAmount?: number;
    extractAmount?: number;
    totalAmount?: number;
    vehicleName?: string;
    customerName?: string;
    driverName?: string;
    km?: number;
    cost?: number;
    createdByUser?: string;
    description?: string;
    paymentStatus?: number;
    orderType?: number;
    unitType?: number;
    status?: number;
    valid?: boolean;
    nextTime?: number;
    cardAddress?: number;
    nozzleCode?: number;
    quotaValue?: number;
    statusExpiredTime?: number;
    history?: IgasHistory[];
    id: number;
    created: Date | string;
}
