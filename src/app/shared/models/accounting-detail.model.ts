export interface AccountingDetail {
    id?: number;
    accountId?: number;
    debitAccount?: string;
    debitAmount?: number;
    dbitDescription?: string;
    creditAccount?: string;
    creditAmount?: number;
    creditDescription?: string;
    tempId?:number;
}