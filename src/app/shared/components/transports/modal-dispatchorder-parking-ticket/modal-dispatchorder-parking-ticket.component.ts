import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Fee, ResponseValue } from '@app/shared/models';
import { DispatchOrderParkingticket } from '@app/shared/models/transports/dispatchorders/dispatch-order-parkingticket.model';
import { FeeService, NotificationService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-dispatchorder-parking-ticket',
  templateUrl: './modal-dispatchorder-parking-ticket.component.html',
  styleUrls: ['./modal-dispatchorder-parking-ticket.component.css']
})
export class ModalDispatchorderParkingTicketComponent implements OnInit {

  public entity: DispatchOrderParkingticket;
  public flagXem: boolean = false;
  public index?:number=0;
  public flagNew: boolean = false;
  public busy: Subscription;
  public flagOk: boolean = false;
  public listFee: Fee[]=[];
  feeName?:string='';
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalParkingTicket', { static: false }) modalParkingTicket: ModalDirective;
  constructor(private _notificationService: NotificationService
    , private feeService:FeeService
  ) { }

  ngOnInit(): void {
    this.loadFee();
  }

  loadFee() {
    const params = new HttpParams()
      .set('groupFeeId', 'CP01')
    this.busy = this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFee = res.data;
        var index= this.listFee.findIndex(x => x.id ==environment.parkingFeeId);
        if(this.flagNew)
          this.entity={cost:0,vat:0,feeId:environment.parkingFeeId,feeName:this.listFee[index]?.feeName};
      }
    });
  }
  changedFee(event:Fee){
    this.entity.feeCode=event?.feeCode;
    this.entity.feeName=event?.feeName;
  }

  add() {
    this.flagXem = false;
    this.flagNew = true;
    this.modalParkingTicket.show();
  }

  edit(item:DispatchOrderParkingticket) {
    this.entity=item;
    this.flagNew = false;
    this.modalParkingTicket.show();
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.modalParkingTicket.hide();
      this.entity.flagNew=this.flagNew;
      this.SaveSuccess.emit(this.entity);
    }
  }
  OnHidden() {
    this.CloseModal.emit();
  }

}
