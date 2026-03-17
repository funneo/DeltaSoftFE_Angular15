export interface TrainingDocumentAssignments {
  id?: string;
  documentId?: string;
  step?: number;
  assigneeId?: string;
  assignedBy?: string;
  assignedDate?: Date | string;
}
