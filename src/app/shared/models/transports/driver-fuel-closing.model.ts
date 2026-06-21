export interface DriverFuelClosingDetail {
    id?: number;
    driverFuelClosingId?: number;
    source?: number; // 1=Tạm ứng, 2=DispatchOrder, 3=FCL định mức, 4=Phát sinh, 5=FCL máy phát
    bucket?: number; // 1=Vận hành, 2=Máy phát
    refNo?: string;
    mergeJobId?: string;
    driverName?: string;
    vihicleLicensePlates?: string;
    reasonName?: string;
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

    // Bucket VẬN HÀNH
    supplyOperQty?: number;
    demandOperQty?: number;
    netOperLiters?: number;
    netOperAmount?: number;

    // Bucket MÁY PHÁT
    supplyGenQty?: number;
    demandGenQty?: number;
    netGenLiters?: number;
    netGenAmount?: number;

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
