export interface DriverFuelDebit {
    id?: number;
    branchId?: number | null;
    driverId?: number | null;
    vihiclelLicensePlates?:string;
    debit?: number | null;
    credit?: number | null;
    debitBalance?: number | null;
    updatedDate?: string;
    refNo?: string;
    notes?: string;
    updatedBy?: string;
    type?: string;
    employeeCode?: string;
    employeeFullName?: string;
    telephone?: string;
    totalRows?: number;
    checked?:boolean;
    
}
