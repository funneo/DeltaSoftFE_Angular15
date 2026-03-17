import { UserHandlingGroup } from ".";
import { UserRole } from "./user-role.model";

export default interface User {
  id?: string;
  userName?: string;
  password?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  description?: string;
  status?: boolean;
  userRoles?: UserRole[];
  employeeId?:number;
  employeeFullName?:string;
  branchId?:number;
  checked?: boolean;
  isExternal?:boolean;
  userHandlingGroups?:UserHandlingGroup[];
}
