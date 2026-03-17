export interface ShippingTaskAttachFile {
  id?: number;
  shippingTaskId?: number;
  title?: string;
  fileName?: string;
  userId?: string;
  attachFileType?: number;
  initialTime?: string;
  jobId?: string;
  size?: number;
  pathFile?: string;
  deleted?: boolean;
  deletedBy?: string;
  checked?: boolean;
}
