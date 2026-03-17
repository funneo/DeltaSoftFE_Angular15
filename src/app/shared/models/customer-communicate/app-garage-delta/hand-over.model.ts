import { HandOverDriver } from "./hand-over-driver.model";

export interface HandOver {
    vehicle_id?:number;
    vehicle_plate?:string;
    vehicle_id_delta_erp?:string;
    driver?:HandOverDriver[];
}
