export interface DispatchOrderProcedure {
    id?: number;
    refNo?: string;
    procedureId?: number;
    procedureName?: string;
    handlingTime?: Date | string;
    isFinish?: boolean;
    isPass?: boolean;
    latitude?: number;
    longtitude?: number;
    note?: string;
}
