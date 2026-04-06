export interface DriverFuelApprovalDetailed {
    driverFuelApprovalId?: number;
    refNo?: string;
    vehicleLicensePlates?: string; // Optional field
    driverName?: string; // Optional field
    startVehicleOdor?: number; // Optional field
    finishVehicleOdor?: number; // Optional field
    mergeJobId?: string; // Optional field
    createdDate?: Date; // Optional field
    quantity?: number; // Optional field
}
