export interface ContractExtension {
    id?: number;
    branchId?: number;
    branchCode?:string;
    customerId?:number;
    customerName?:string;
    contractId?: number;
    contractNo?:string;
    notes?: string;
    createdBy?: string;
    createdByName?:string
    createdDate?: Date | string;
    newExpiryDate?: string;
    status?: number;
    rStatus?:string;
    managerId?: number;
    checked?:boolean;
}
