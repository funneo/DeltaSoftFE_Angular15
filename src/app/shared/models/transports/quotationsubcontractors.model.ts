import { Quotationsubcontractorsdetailed } from "./quotationsubcontractorsdetailed.model";

export interface Quotationsubcontractors {
    id?: number;
    quotationCode?: string;
    branchId?: number;
    branchName?:string;
    branchCode?:string
    supplierId?: number;
    supplierName?:string;
    tollRouteCode?: string;
    tollRouteName?:string;
    note?: string;
    isActived?: boolean;
    oilPrice?:number;
    validUntil?:string;
    rActived?:string;
    status?: number;
    rStatus?:string;
    createdBy?: string;
    createdByName?:string;
    createdDate?: Date | string;
    isApproved?: boolean;
    checked?:boolean;
    vihicleTypeId?:number;
    quotationSubcontractorsDetaileds?:Quotationsubcontractorsdetailed[];
}
