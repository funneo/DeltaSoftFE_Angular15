export interface Locations {
        id?: number;
        locationCode?: string;
        locationName?: string;
        locationAddress?: string;
        latitude?: number;
        longtitude?: number;
        area?: string;
        provinceCode?: string;
        provinceName?:String;
        districtCode?: string;
        districtName?:string;
        locked?: boolean;
        approved?: boolean;
        createdBy?: string;
        createdNyName?:string;
        createdDate?: Date | string;
        updatedBy?: string;
        updatedByName?:string;
        updatedDate?: Date | string;
        deleted?: boolean;
        checked?:boolean;
}
