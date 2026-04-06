export interface CustomerLocations {
	id?: number;
	branchId?: number;
	customerId?: number;
	code?:string;
	address?: string;
	contactName?:string;
	contactTel?:string;
	googleLocations?: string;
	longtitude?: number;
	latitude?: number;
	distanceToWB?:number;
	status?:number;
	locked?: boolean;
	checked?:boolean;
}
