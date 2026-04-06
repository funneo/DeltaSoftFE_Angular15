export interface Fund {
  id?: number;
  branchId?: number;
  accountListId?: number;
  amount?: number;
  refDate?: string;
  documentNo?: string;
  notes?: string;
  status?:boolean;
  checked?: boolean;
  accountListName?:string;
  currency?:string;
}
