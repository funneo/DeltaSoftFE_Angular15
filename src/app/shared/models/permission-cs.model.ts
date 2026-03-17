export interface PermissionCS{
  id?: number;
  branchId?: number;
  userName?: string;
  customerId?: number;
  isCS?: boolean;
  isOpenJob?: boolean;
  isAcceptDebit?: boolean;
  isOpenDebit?: boolean;
  isOk?: boolean;
  isClosingDebit?:boolean;
  notes?: string;
  status?:boolean;
  checked?: boolean;
  customerCode?:string;
  customerName?:string;
  listItem?: PermissionCS[];
}
