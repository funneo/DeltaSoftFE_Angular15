export interface SupplierDrivers {
     id?: number;
	 branchId?: number;
	 supplierId?: number;
	 driverName?: string;
	 dateOfBirth?: string;
	 idNumber?: string;
	 address?: string;
	 telephone?: string;
	 email?: string;
	 driversLicenseNo?: string;
	 issuedDate?: string;
	 expiredDate?: string;
	 note?: string;
	 status?: number;
	 locked?: boolean;
	 deleted?: boolean;
     checked?:number;
}
