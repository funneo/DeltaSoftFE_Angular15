import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Employee, ResponseValue } from '@app/shared/models';
import { NotificationService, PaymentsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-list-payment-accept',
  templateUrl: './modal-list-payment-accept.component.html',
  styleUrls: ['./modal-list-payment-accept.component.css']
})
export class ModalListPaymentAcceptComponent implements OnInit {
  public busy: Subscription;
  public listData: Employee[] = [];
  isSelected = false;
  viewModal?: boolean = false;

  @ViewChild('modalList', { static: false }) modalList: ModalDirective;
  constructor(
    private service: PaymentsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {

  }

  view(id: number) {
    this.busy = this.service.getUserAccept(id).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201' || res.code=='204') {
        this.listData = res.data;
        this.modalList.show();
      }
         else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  closeModal() {
    this.viewModal = false;
  }

}
