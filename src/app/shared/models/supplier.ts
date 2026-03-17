import { SupplierDrivers } from "./danhmuc/supplier-drivers.model";
import { SupplierVehicles } from "./danhmuc/supplier-vehicles.model";

export interface Supplier {
    id?: number;
    supplierCode?: string;
    supplierName?: string;
    englishName?: string;
    abbreviationName?: string;
    address?: string;
    tel?: string;
    contact?: string;
    contactTel?: string;
    contactPosition?: string;
    email?: string;
    fax?: string;
    website?: string;
    countryCode?: string;
    provinceCode?: string;
    provinceName?: string;
    districtCode?: string;
    districtName?: string;
    accountNumber?: string;
    bank?: string;
    bankId?: number;
    industrialZoneId?: number;
    industrialZoneName?: string;
    supplierServiceId?: number;
    supplierServiceName?: string;
    lock?: boolean;
    note?: string;
    symbol?: string;
    employeeCode?: string;
    employeeFullName?: string;
    branchId?: number;
    branchName?: string
    createdBy?: string;
    createdByName?: string;
    createdDate?: Date | string;
    updatedBy?: string;
    updatedDate?: Date | string;
    deleted?: boolean;
    checked?: boolean;
    listSupplierDrivers?: SupplierDrivers[];
    listSupplierVehicles?: SupplierVehicles[];
}
