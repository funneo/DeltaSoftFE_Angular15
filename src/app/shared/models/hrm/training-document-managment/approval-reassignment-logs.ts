export interface ApprovalReassignmentLogs {
  id?: string;
  documentId?: string;
  step?: number;
  fromUserId?: string;
  toUserId?: string;
  reassignedDate?: Date | string;
  reason?: string;
}
