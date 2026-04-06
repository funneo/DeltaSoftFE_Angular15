export interface Branch {
  id?: number;
  branchCode?: string;
  branchName?: string;
  parentId?: number;
  address?: string;
  telNo?: string;
  representative?: string;
  longitude?: number;
  latitude?: number;
  note?: string;
  status?:boolean;
  checked?: boolean;
}
