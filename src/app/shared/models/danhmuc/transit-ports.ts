
export interface TransitPorts {
  id?: number
  fromPortsId?: number
  fromPortsName?: string;
  toPortsId?: number;
  toPortsName?: string;
  km?: number;
  status?: number;
  rStatus?: string;
  notes?: string;
  createdBy?: string;
  createdDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  checked?: boolean;
  
}
