export interface AccountsPaymentDetail {
  id?: number;
  accountId?: number;
  paymentDetailId?: number;
  type?: number;
  checked?: boolean;
  amount?: number;
  vat?: number;
  amountAfterVat?: number;
}
