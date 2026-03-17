export interface VehicleType {
  id?: number;
  typeCode?: string;          // '00', '01', '02', ...
  typeName?: string;          // 'Mooc 20ft', 'Xe tải AC990', ...
  categoryId?: number;        // FK -> OtherCategories.id (VEHICLECATEGORY)
  externalCode?: string | null;

  createdDate?: string | Date | null;
  updatedDate?: string | Date | null;

  // Thường dùng khi API trả về kèm join
  categoryCode?: string | null;   // 'TRUCK', 'HEAD', ...
  categoryName?: string | null;   // 'Xe tải thùng', 'Đầu kéo container', ...
}
