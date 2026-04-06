export interface VehicleOilQuota {
    id?: number;            // optional, since `Id` might not be set for new entries
    vehicleId?: number;
    oilQuotaId?: number;
    oilQuotaName?  :string;
    value?: number;          // nullable in C#, so optional here
    shortWayValue?: number;          // nullable in C#, so optional here
    notes?: string;          // nullable in C#, so optional here
    updatedBy?: string;      // nullable Guid in C#, represented as a string
    updateDate?: Date;       // nullable DateTime in C#, represented as Date
}
