import { DriverFuelApproval } from "./driver-fuel-approval.model";
import { FuelClosingDetailed } from "./fuel-closing-detailed.model";
import { ImportGas } from "./import-gas.model";

export interface FuelClosing {
    id?:number;
    refNo?: string;
    branchId?: number;
    branchName?:string;
    gasSiteId?: number;
    siteName?:string;
    contents?:string;
    createdDate?:string;
    createdBy?: string;
    createdByName?:string;
    oldInventory?: number;
    import?: number;
    export?:number;
    newInventory?: number;
    realInverntory?: number;
    differential?:number;
    price?:number;
    note?: string;
    status?:number;
    acceptBy?:string;
    acceptByName?:string;
    acceptDate?:string;
    deleted?:boolean;
    checked?:boolean;
    listFuelClosingDetailed?:FuelClosingDetailed[];
    importGasList?:ImportGas[];
    driverFuelApprovalList?:DriverFuelApproval[];
}
