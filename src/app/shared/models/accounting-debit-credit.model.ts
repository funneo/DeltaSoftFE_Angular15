export interface AccountingDebitCredit {
    categoryCode?: string;
    categoryName?: string;
    refNo?: string;
    refDate?: string;
    contents?: string;
    notes?: string;
    documentNo?: string;
    represent?: string;
    debitAccount?: string;
    dbitDescription?: string;
    creditAccount?: string;
    creditDescription?: string; 
    totalRows?: number;
    debit?:number;
    credit?:number;
    id?:number;
    type?:number;
}