export interface TrainingDocumentApprovalHistory {
  id?: string;
  documentId?: string;
  step?: number;
  evaluatorId?: string;
  score?: number;
  comments?: string;
  evaluatedDate?: Date | string;
}
