export interface DriverFuelClosingDetail {
    id?: number;
    driverFuelClosingId?: number;
    source?: number; // 1=Approval, 2=DispatchOrder, 3=FCL, 4=AdditionalFee
    refNo?: string;
    mergeJobId?: string;
    driverName?: string;
    vihicleLicensePlates?: string;
    startVehicleOdor?: number;
    finishVehicleOdor?: number;
    date?: string;
    quantity?: number;
    quantityIgas?: number;
    note?: string;
    checked?: boolean;
}

export interface DriverFuelClosing {
    id?: number;
    refNo?: string;
    branchId?: number;
    branchName?: string;

    vihicleId?: number;
    vihicleLicensePlate?: string;

    driverId?: number;
    driverName?: string;

    fromDate?: string;
    toDate?: string;
    closeReason?: number;
    closeReasonName?: string;

    oilPrice?: number;

    approvalDiffQty?: number;
    dispatchOrderQty?: number;
    additionalFeeQty?: number;
    topUpLiters?: number;

    netLiters?: number;
    netAmount?: number;

    status?: number;
    statusName?: string;
    note?: string;

    createdBy?: string;
    createdByName?: string;
    createdDate?: string;
    updatedBy?: string;
    updatedDate?: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedDate?: string;

    totalRows?: number;
    checked?: boolean;

    detaileds?: DriverFuelClosingDetail[];
}
