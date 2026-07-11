export interface Ports {
    id?: number;
    code?: string;
    name?: string;
    address?: string;
    googleLocations?: string;
    longtitude?: number;
    latitude?: number;
    distance?: number;
    km?: number;
    deleted?: boolean;
    groupPort?: string;
    /** Chi nhánh quản lý. null/0 = dùng chung cho mọi chi nhánh. */
    branchId?: number;
    branchCode?: string;
    checked?: boolean;
}
