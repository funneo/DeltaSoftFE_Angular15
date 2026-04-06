export interface TrainingDocumentContents {
  id?: string;
  documentId?: string;
  contents?: string;
  templateId?: number;
  templateName?: string;
  templateNotes?: string;
  isExpanded?: boolean; // Thêm thuộc tính này để quản lý trạng thái mở rộng
}
