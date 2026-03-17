import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { NotificationService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalDispatchorderComponent } from '../modal-dispatchorder/modal-dispatchorder.component';
import { DispatchOrderFclService } from '@app/shared/services/fcl/dispatch-order-fcl.service';
import { ModalDispatchOrderFclComponent } from '../modal-dispatch-order-fcl/modal-dispatch-order-fcl.component';
import { DispatchOrderFcl } from '@app/shared/models/fcl/dispatch-order-fcl';

@Component({
  selector: 'modal-list-dispatch-order',
  templateUrl: './modal-list-dispatch-order.component.html',
  styleUrls: ['./modal-list-dispatch-order.component.css']
})
export class ModalListDispatchOrderComponent implements OnInit {
  public isFcl=false;
  public busy: Subscription;
  public listDispatchorder: Dispatchorder[] = [];
  isSelected = false;
  viewModal?: boolean = false;
  title:string='';
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalListDispatchOrder', { static: false }) modalListDispatchOrder: ModalDirective;
  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent
  @ViewChild(ModalDispatchOrderFclComponent, { static: false }) modalFclAddEdit: ModalDispatchOrderFclComponent

  constructor(
    private dispatchOrderService: DispatchordersService,
    private fclService: DispatchOrderFclService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {

  }
  viewFcl=false;
  viewDispatchOrder(refNo: string) {
    debugger;
    if(!this.isFcl){
      this.viewModal = true;
      setTimeout(() => {
        this.modalDispatchOrderAddEdit.edit(refNo, true);
      }, 50);
    }else{
      debugger;
      this.viewFcl = true;
      setTimeout(() => {
        this.modalFclAddEdit.edit(refNo, true);
      }, 50);
    }
  }

  view(jobId: string,isFcl: boolean) {
    this.isFcl=isFcl;
    if(!isFcl){
    this.dispatchOrderService.getByJobId(jobId).subscribe((res: ResponseValue<Dispatchorder[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDispatchorder = res.data;
        this.modalListDispatchOrder.show();
      }
      else {
        if (res.code == '204') {
          this.listDispatchorder = [];
          this.modalListDispatchOrder.show();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }else{ 
    this.fclService.getByJobId(jobId).subscribe((res: ResponseValue<Dispatchorder[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDispatchorder = res.data;
        this.modalListDispatchOrder.show();
      }
      else {
        if (res.code == '204') {
          this.listDispatchorder = [];
          this.modalListDispatchOrder.show();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
   }
}

  OnHidden() {
    this.CloseModal.emit();
  }
  closeModal() {
    this.viewModal = false;
  }
  closeModalFcl() {
    this.viewFcl = false;
  }

}
