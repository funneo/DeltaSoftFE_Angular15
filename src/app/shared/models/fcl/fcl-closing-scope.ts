export interface FclClosingScope {
    id?: number;
    userId?: string;
    userName?: string;
    customerId?: number;     // null = Chốt tất cả
    customerName?: string;
    createdBy?: string;
    createdDate?: string;
}

export interface FclClosingScopeSaveRequest {
    userId: string;
    isAll: boolean;
    customerIdsCsv?: string;
}

// Gom theo user để hiển thị list (1 user có thể nhiều dòng CustomerId, hoặc 1 dòng NULL = Chốt tất cả)
export interface FclClosingScopeByUser {
    userId: string;
    userName: string;
    isAll: boolean;
    customers: { id: number; name: string }[];
}
