import { TollStation } from "../toll-station.model";
import { CustomerRoutesTollStation } from "./customer-routes-toll-station.model";

export interface CustomerRoutes {
    id?: number;
    branchId?: number;
    customerId?: number;
    code?: string;
    name?: string;
    locationsId?: number;
    locationsName?: string;
    portsId?: number;
    portsName?: string;
    distance?: number;
    distanceThrough?: number;
    locked?: boolean;
    status?: number;
    createdBy?: string;
    createdDate?: Date | string;
    checked?:boolean;
    listTollStation?:CustomerRoutesTollStation[];
}
