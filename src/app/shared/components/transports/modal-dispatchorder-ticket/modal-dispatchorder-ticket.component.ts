import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DispatchOrderTicket, Fee, ResponseValue } from '@app/shared/models';
import { TollStation } from '@app/shared/models/toll-station.model';
import { FeeService, NotificationService } from '@app/shared/services';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-dispatchorder-ticket',
  templateUrl: './modal-dispatchorder-ticket.component.html',
  styleUrls: ['./modal-dispatchorder-ticket.component.css']
})
export class ModalDispatchorderTicketComponent implements OnInit {

  public entity: DispatchOrderTicket;
  public flagXem: boolean = false;
  public index?: number = 0;
  public flagNew: boolean = false;
  public busy: Subscription;
  public flagOk: boolean = false;
  public listTollStation: TollStation[] = [];
  public listFee: Fee[] = [];
  feeName?: string = '';
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalTicket', { static: false }) modalTicket: ModalDirective;
  constructor(private _notificationService: NotificationService
    , private tollStationService: TollStationService
    , private feeService: FeeService
  ) { }

  ngOnInit(): void {
    this.loadTollStation();
    this.loadFee();
  }

  loadTollStation() {
    this.tollStationService.getAll().subscribe((res: ResponseValue<TollStation[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTollStation = res.data;
      }
    });
  }
  loadFee() {
    const params = new HttpParams()
      .set('groupFeeId', 'CP01')
    this.busy = this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFee = res.data;
        var index = this.listFee.findIndex(x => x.id == environment.tollFeeId);
        if (this.flagNew)
          this.entity = { cost: 0, vat: 0, feeId: environment.tollFeeId, feeName: this.listFee[index]?.feeName };
      }
    });
  }
  changedFee(event: Fee) {
    this.entity.feeCode = event?.feeCode;
    this.entity.feeName = event?.feeName;
  }

  add() {
    this.flagXem = false;
    this.flagNew = true;
    var index = this.listFee.findIndex(x => x.id == environment.tollFeeId);
    this.entity = { cost: 0, vat: 0, feeId: environment.tollFeeId, feeName: this.listFee[index]?.feeName };
    this.modalTicket.show();
  }

  edit(item: DispatchOrderTicket) {
    this.entity = item;
    this.flagNew = false;
    this.modalTicket.show();
  }
  changeTollStation(item: TollStation) {
    this.entity.tollStationName = item?.tollStationName;
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.modalTicket.hide();
      this.entity.flagNew = this.flagNew;
      this.SaveSuccess.emit(this.entity);
    }
  }
  OnHidden() {
    this.CloseModal.emit();
  }

}
