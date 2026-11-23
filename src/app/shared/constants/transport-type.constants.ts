/**
 * Loại vận chuyển (FCL / LCL / CBT) — chốt 10/11/2026 + 19/11/2026.
 *
 * - Công việc (`ShippingTask.TaskType`): 1 = FCL, 2 = LCL, 3 = CBT; 0/NULL = công việc cũ chưa phân loại, coi là FCL.
 * - Job (`Shipment.ShippingType`, cột sẵn có "Loại hàng"): GIỮ 0 = FCL, 1 = LCL, thêm 2 = CBT
 *   (không đổi 41k dòng cũ) ⇒ quy đổi sang TaskType = ShippingType + 1.
 * - Job dịch vụ Cross Border Trucking (ShipmentType 1171) luôn là CBT, khóa cứng.
 */
export class TransportTypeConstants {
  public static readonly FCL = 1;
  public static readonly LCL = 2;
  public static readonly CBT = 3;

  /** ShipmentType (OtherCategories SHIPMENT_T02) của dịch vụ Cross Border Trucking. */
  public static readonly SHIPMENT_TYPE_CBT = 1171;

  /** Giá trị Job.ShippingType (quy ước cũ 0/1 + thêm 2). */
  public static readonly JOB_FCL = 0;
  public static readonly JOB_LCL = 1;
  public static readonly JOB_CBT = 2;

  /** Lựa chọn trên Công việc. */
  public static readonly TASK_TYPES = [
    { id: 1, text: 'FCL' },
    { id: 2, text: 'LCL' },
    { id: 3, text: 'CBT' }
  ];

  /** Lựa chọn trên Job (theo giá trị Shipment.ShippingType). */
  public static readonly JOB_TYPES = [
    { id: 0, text: 'FCL' },
    { id: 1, text: 'LCL' },
    { id: 2, text: 'CBT' }
  ];

  /** Job.ShippingType → TaskType; null nếu Job chưa có loại. */
  public static fromJobType(shippingType?: number | null): number | null {
    if (shippingType === 0 || shippingType === 1 || shippingType === 2) return shippingType + 1;
    return null;
  }

  /** TaskType đã chuẩn hóa: 0/NULL (cũ) → FCL. */
  public static normalize(taskType?: number | null): number {
    return taskType === 2 || taskType === 3 ? taskType : 1;
  }

  /** Tên hiển thị của TaskType (0/NULL hiện FCL). */
  public static nameOf(taskType?: number | null): string {
    switch (TransportTypeConstants.normalize(taskType)) {
      case 2: return 'LCL';
      case 3: return 'CBT';
      default: return 'FCL';
    }
  }
}
