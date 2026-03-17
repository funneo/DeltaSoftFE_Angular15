export interface CanonRoad {
  id?: number;
  code?: string;
  name?: string;
  customerId?: number | null;
  customerCode?: string;
  customerName?: string;
  status?: boolean | null;
  notes?: string;
  deleted?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
  checked?: boolean;
}
