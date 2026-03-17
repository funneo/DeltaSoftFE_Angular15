export interface SupplierVehicles {
     id?: number;
	 branchId?: number;
	 supplierId?: number;
	 licensePlates?: string;
	 vehicleTypeId?: number;
	 vehicleTypeName?: string;
	 manufacturer?: string;
	 yearMade?: number;
	 note?: string;
	 status?: number;
	 locked?: boolean;
	 deleted?: boolean;
     checked?:boolean;
}
