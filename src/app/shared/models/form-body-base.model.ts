export interface FromBodyBase<T> {
  id?: string;
  tokenKey?: string;
  branchId?: number;
  employeeId?: number;
  keyWord?: string;
  pageIndex?: number;
  pageSize?: number;
  listId?: string;
  userId?:string;
  userName?: string;
  fromDate?: string;
  toDate?: string;
  customerId?:number;
  gType?: string;
  tValue?: number;
  dValue?:number;
  bValue?:boolean;
  item?: T;
  year?:number;
}
