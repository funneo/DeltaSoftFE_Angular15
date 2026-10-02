import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { GaragePaymentRequest } from '@app/shared/models/accounting/garage-payment-request.model';
import { NotificationService } from '@app/shared/services';
import { GaragePaymentRequestService } from '@app/shared/services/accounting/garage-payment-request.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

// F051 — Xem chi tiết 1 yêu cầu thu/chi của Xưởng (chỉ đọc). Phần partner/vehicle/invoice/lines/totals
// dựng từ RawJson (nguyên văn body Xưởng gửi); tab "JSON gốc" hiện nguyên văn để đối soát.
@Component({
  selector: 'modal-garage-payment-request',
  templateUrl: './modal-garage-payment-request.component.html',
  styleUrls: ['./modal-garage-payment-request.component.css']
})
export class ModalGaragePaymentRequestComponent {
  entity: GaragePaymentRequest;
  raw: any = {};
  rawPretty = '';
  busy: Subscription;

  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalView', { static: false }) modalView: ModalDirective;

  constructor(private service: GaragePaymentRequestService, private notificationService: NotificationService) { }

  show(id: number) {
    this.busy = this.service.getById(id).subscribe((res: ResponseValue<GaragePaymentRequest>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        try {
          this.raw = JSON.parse(this.entity.rawJson || '{}') || {};
          this.rawPretty = JSON.stringify(this.raw, null, 2);
        } catch {
          this.raw = {};
          this.rawPretty = this.entity.rawJson;
        }
        this.modalView.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  get lines(): any[] {
    return Array.isArray(this.raw?.lines) ? this.raw.lines : [];
  }

  requestTypeText(type: number): string {
    switch (type) {
      case 1: return 'Chi phí trả trước';
      case 2: return 'Chi phí trả sau';
      case 3: return 'Doanh thu trả trước';
      case 4: return 'Doanh thu trả sau';
      default: return '';
    }
  }

  statusText(status: number): string {
    switch (status) {
      case 0: return 'Chờ viết phiếu';
      case 1: return 'Đã viết phiếu';
      case 2: return 'Xưởng đã hủy';
      default: return '';
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
