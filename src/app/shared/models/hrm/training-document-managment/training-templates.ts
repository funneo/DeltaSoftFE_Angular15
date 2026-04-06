export interface TrainingTemplates {
  id?: number;
  name?: string;
  level?: number;
  groupL1Id?: number;
  groupL2Id?: number;
  isActive?: boolean;
  isExpanded?: boolean; // Thêm thuộc tính này để quản lý trạng thái mở rộng
}
