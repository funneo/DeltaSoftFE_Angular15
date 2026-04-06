export interface DriverFuelLimit {
    id?: number;
    branchId?: number;
    branchName?:string;
    driverId?: number;
    driverName?:string;
    fuelLimit?: number | null;
    status?: boolean | null;
    updatedBy?: string | null;
    updatedByName?:String;
    updatedDate?: string;
    notes?: string;
    employeeId?:number;
    checked?:boolean;
}
