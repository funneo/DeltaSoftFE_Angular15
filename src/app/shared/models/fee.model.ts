export interface Fee {
  id?: number;
  feeCode?: string;
  feeNameEnglish?: string;
  feeName?: string;
  groupFeeId?: number;
  paymentFeeGroupId?: number;
  revenueFeeGroupId?: number;
  debitAccount?: string;
  creditAccount?: string;
  notes?: string;
  status?: boolean;
  checked?: boolean;
  groupName?: string;
  groupCode?: string;
  paymentGroupName?: string;
  revenueGroupName?: string;
  isDef?: boolean;
}
