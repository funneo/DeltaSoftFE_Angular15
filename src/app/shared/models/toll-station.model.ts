import { TicketPrices } from "./danhmuc/ticket-prices.model";

export interface TollStation {
    id?:number;
    tollStationName?:string;
    tollStationAddress?:string;
    investorName?:string;
    investorAddress?:string;
    taxCode?:string;
    actived?:boolean;
    deleted?:boolean;
    checked?:boolean;
    startLocation?:number;
    startLocationName?:string;
    endLocation?:number;
    endLocationName?:string;
    listTicketPrices?:TicketPrices[]
}
