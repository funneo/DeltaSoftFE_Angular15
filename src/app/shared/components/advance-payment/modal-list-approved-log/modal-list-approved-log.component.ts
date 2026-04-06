import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { ApprovedLog } from '@app/shared/models/advance-payments/approved-log.model';
import { NotificationService, PaymentsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-list-approved-log',
  templateUrl: './modal-list-approved-log.component.html',
  styleUrls: ['./modal-list-approved-log.component.css']
})
export class ModalListApprovedLogComponent implements OnInit {

  listData: ApprovedLog[]
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private paymentService: PaymentsService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
  }

  view(id: number) {
    console.log(id);

    this.paymentService.getApprovedLogById(id).subscribe((res: ResponseValue<ApprovedLog[]>) => {
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
