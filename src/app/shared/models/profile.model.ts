import { UserHandlingGroup } from ".";
import Permissions from "./permissions.model";

export default interface Profile {
    id?: string;
    access_token: string;
    userName?: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    permissions?: Permissions[];
    status?: boolean;
    roles?: string[];
    branchId?:string;
    branchName?:string;
    employeeId?:string;
    authorisationLevel?:string;
    advanceConfirmLevel?:string;
    paymentConfirmLevel?:string;
    transportConfirmLevel?:string;
    listAdvanceGroupId?:string;
    listPaymentGroupId?:string;
    userHandlingGroups?: UserHandlingGroup[];
    isAdmin?:boolean;
    isAccManager?:boolean;
}
