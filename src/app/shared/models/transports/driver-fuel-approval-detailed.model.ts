export interface DriverFuelApprovalDetailed {
    driverFuelApprovalId?: number;
    refNo?: string;
    vehicleLicensePlates?: string; // Optional field
    driverName?: string; // Optional field
    startVehicleOdor?: number; // Optional field
    finishVehicleOdor?: number; // Optional field
    mergeJobId?: string; // Optional field
    fuelDriverName?: string; // Người nhận dầu (snapshot từ DispatchOrder.FuelDriverId)
    createdDate?: Date; // Optional field
    quantity?: number; // Optional field
}
