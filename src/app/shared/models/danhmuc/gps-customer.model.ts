export interface GpsCustomerVehicle {
	id?: number;
	customerId?: number;
	licensePlate?: string;
	active?: boolean;
	createdDate?: Date;
}

export interface GpsCustomerToken {
	id?: number;
	tokenApi?: string;
	active?: boolean;
	createdDate?: Date;
}
