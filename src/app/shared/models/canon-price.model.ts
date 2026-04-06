export interface CanonPrice {
  id?: number;
  customerId?: number | null;
  customerCode?: string;
  customerName?: string;
  roadCode?: string;
  roadName?: string;
  qty?: number | null;
  unit?: string;
  currency?: string;
  feeId?: number | null;
  feeCode?: string;
  feeName?: string;
  amount?: number | null;
  status?: boolean | null;
  notes?: string;
  deleted?: boolean | null;
  createdBy?: string | null;
  createdDate?: string | null;
  updatedBy?: string | null;
  updatedDate?: string | null;
  checked?: boolean;
}
