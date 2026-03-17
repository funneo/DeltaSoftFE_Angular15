import { Accounts } from ".";

export interface FundReserve {
  id?: number;
  tenQuy?: string;
  dauKy?: number;
  thu?: number;
  chi?: number;
  cuoiKy?: number;
  currency?: string;
  totalRows?: number;
  checked?:boolean;
  type?: number ;
  refNo?: string;
  refDate?: string;
  effectiveDate?:string;
  invoiceNo?: string;
  documentNo?: string;
  contents?: string;
  soDu?:number;
  notes?: string;
}

export interface FundReserveDetail {
  listAccounts?:Accounts[];
  totalRows?: number;
  tonDauKy?:number;
  tonCuoiKy?:number;
  ngayKetChuyen?:string;
}

