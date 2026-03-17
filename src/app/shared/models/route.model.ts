import { RouteTollStation } from "./route-toll-station.model";

export interface Route {
    id?: number;
    branchId?:number;
    branchCode?:string;
    branchName?:string;
    routeCode?: string;
    routeName?: string;
    routeFullName?:string;
    description?: string;
    startLocationCode?: string;
    startLocationName?:string;
    endLocationCode?: string;
    endLocationName?:string;
    note?: string;
    distance?: number;
    distanceGoogle?: number;
    ticketStations?: number;
    locked?: boolean;
    approved?: boolean;
    createdBy?: string;
    createdByName?:string;
    createdDate?: Date | string;
    updatedBy?: string;
    updatedByName?:string;
    updatedDate?: Date | string;
    routeSurcharge?:number;
    status?:number;
    listRouteTollStation?:RouteTollStation[];
    checked?:boolean;
}
