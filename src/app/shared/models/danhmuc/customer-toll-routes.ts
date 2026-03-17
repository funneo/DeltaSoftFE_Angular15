export interface CustomerTollRoutes {
  id?: number;
  customerId?: number;
  name?: string;
  notes?: string;
  status?: number;
  createdDate?: string; // ISO 8601 string (e.g., 2025-05-19T10:00:00)
  createdBy?: string;   // GUID
  createdByName?: string;   // GUID
  approvedDate?: string;
  apporvedBy?: string;
  apporvedByName?: string;
  deleted?: boolean;
  checked?: boolean;
}
