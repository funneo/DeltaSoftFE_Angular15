export interface GasSite {
    id?: number;
    siteName?: string;
    capacity?: number;
    startInventory?:number;
    gasType?: number;
    stationId?: number;
    nozzleCode?: number;
    customerId?: number;
    vehicleId?: number;
    driverId?: number;
    nextTime?: number;
    branchId?: number;
    branchName?:string;
    gasTypeName?:string;
    checked?:boolean;
}
