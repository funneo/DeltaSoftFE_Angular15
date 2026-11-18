import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { QuotationCustomer, ResponseValue } from '@app/shared/models';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { NotificationService, UtilityService } from '@app/shared/services';
import { QuotationCustomerService } from '@app/shared/services/sales-marketing/quotation-customer.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';

/**
 * Gia hạn báo giá khách hàng (chỉ Admin): nhập ngày đến hạn mới + lý do.
 * BE: POST /api/QuotationCustomer/Extend → SP_QuotationCustomer_Extend (mở lại IsFinish=0 + ghi log).
 */
@Component({
  selector: 'modal-quotation-customer-extend',
  templateUrl: './modal-quotation-customer-extend.component.html',
})
export class ModalQuotationCustomerExtendComponent {
  @ViewChild('modalExtend', { static: false }) modalExtend: ModalDirective;
  @Output() SaveSuccess = new EventEmitter<any>();
  @Output() CloseModal = new EventEmitter<any>();

  item: QuotationCustomer;
  _denNgay: string = null;   // DD/MM/YYYY
  reason = '';
  flagSave = false;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(new Date(), false);

  constructor(
    private quotationCustomerService: QuotationCustomerService,
    private _notificationService: NotificationService,
    private _utilityService: UtilityService
  ) { }

  show(item: QuotationCustomer): void {
    this.item = item;
    this.reason = '';
    this.flagSave = false;
    // Gợi ý mặc định: hạn hiện tại + 1 ngày (hoặc hôm nay nếu chưa có hạn)
    const base = item?.fDate ? moment(item.fDate).add(1, 'day') : moment();
    this._denNgay = base.format(FormatContstants.DATEVN);
    this.dateTimeOptions = this._utilityService.dateTimeOptionDays(base.toDate(), false);
    this.modalExtend?.show();
  }

  get currentFDate(): string {
    return this.item?.fDate ? moment(this.item.fDate).format(FormatContstants.DATEVN) : '';
  }

  selectedDenNgay(event): void {
    this._denNgay = moment(event.start).format(FormatContstants.DATEVN);
  }

  closedDenNgay(event): void {
    if (this._denNgay == null) this._denNgay = moment(event.oldStartDate).format(FormatContstants.DATEVN);
  }

  save(): void {
    if (this.flagSave) return;
    if (!this._denNgay || !this.reason?.trim()) {
      this._notificationService.printErrorMessage('Vui lòng nhập ngày đến hạn mới và lý do gia hạn.');
      return;
    }
    const fDate = moment(this._denNgay, FormatContstants.DATEVN);
    if (this.item?.fDate && !fDate.isAfter(moment(this.item.fDate), 'day')) {
      this._notificationService.printErrorMessage('Ngày đến hạn mới phải lớn hơn ngày đến hạn hiện tại.');
      return;
    }
    this.flagSave = true;
    this.quotationCustomerService
      .extend(this.item.id, fDate.format(FormatContstants.CLIENTDATE), this.reason.trim())
      .subscribe((res: ResponseValue<any>) => {
        this.flagSave = false;
        if (res?.code == '200') {
          this._notificationService.printSuccessMessage('Gia hạn báo giá thành công.');
          this.modalExtend?.hide();
          this.SaveSuccess.emit();
        } else {
          this._notificationService.printErrorMessage(res?.message || 'Gia hạn báo giá không thành công.');
        }
      }, () => this.flagSave = false);
  }

  OnHidden(): void {
    this.CloseModal.emit();
  }
}
