export interface UserRole {
  id?:number;
  userId?: string;
  roleId?: string;
  branchId: number;
  authorisationLevel?: number;
  advanceConfirmLevel?: number;
  paymentConfirmLevel?: number;
  transportConfirmLevel?:number;
  checked?:boolean;
}
