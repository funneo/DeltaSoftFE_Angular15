import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, Repayment } from '@app/shared/models';
import { NotificationService, UtilityService, RepaymentService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalRepaymentComponent } from '../modal-repayment/modal-repayment.component';

@Component({
  selector: 'modal-repayment-history',
  templateUrl: './modal-repayment-history.component.html',
  styleUrls: ['./modal-repayment-history.component.css']
})
export class ModalRepaymentHistoryComponent implements OnInit {
  maskNumber = UtilityService.maskNumber;
  listRepaymnet: Repayment[];
  public busy: Subscription;
  public viewModal: boolean = false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalRepaymentComponent, { static: false }) modalRepayment: ModalRepaymentComponent
  constructor(private _notificationService: NotificationService,
    private repaymentService: RepaymentService) {
  }

  ngOnInit() {

  }

  onShow() {
  }

  showList(idLoan: number) {
    const params = new HttpParams()
      .set('personalLoanId', idLoan?.toString());
    this.repaymentService.getAll(params).subscribe((res: ResponseValue<Repayment[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listRepaymnet = res.data;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  showRepayment(item:Repayment){
    this.viewModal=true;
    setTimeout(() => {
      this.modalRepayment.edit(item.id.toString(),true);
    }, 50);
  }

  closeRepayment(){
    this.viewModal=false;
  }

}
