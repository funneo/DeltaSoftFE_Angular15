import { ApproverPermissionCustomers } from "../training-document-management/approver-permission-customers";

export interface ApproverPermissions {
  id?: number;
  step?: number;
  userId?: string;
  userName?: string;
  employeeFullName?: string;
  isActive?: boolean;
  branchId?: number;
  branchName?: string;
  groupL1Id?: number;
  groupL1Name?: string;
  groupL2Id?: number;
  groupL2Name?: string;
  grantedBy?: string;
  grantedByName?: string;
  grantedDate?: Date | string;
  checked?: boolean;
  customers?:ApproverPermissionCustomers[];
}
