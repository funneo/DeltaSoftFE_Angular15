export interface GasManagement {
    id?: number;
    gasName?: string;
    branchId?:number;
    effectiveDate?: Date | string;
    updatedBy?: string;
    updatedByName?:string
    updatedDate?: Date | string;
    cost?: number;
    oldCost?: number;
    changed?: number;
    rate?: number;
    checked?:boolean;
}
