import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ApprovedLog } from '@app/shared/models/advance-payments/approved-log.model';
import { ResponseValue } from '@app/shared/models';
import { NotificationService, PaymentsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-list-personal-loan-log',
  templateUrl: './modal-list-personal-loan-log.component.html',
  styleUrls: ['./modal-list-personal-loan-log.component.css']
})
export class ModalListPersonalLoanLogComponent implements OnInit {

  listData: ApprovedLog[]
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private paymentService: PaymentsService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
  }

  view(id: number) {
    this.paymentService.getApprovedLogByType(id, 'PERSONAL_LOAN').subscribe((res: any) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        this.listData = res.data;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
}
