import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FeeCode, ResponseValue } from '@app/shared/models';
import { NotificationService, FeeCodeService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-fee-code-lvl2',
  templateUrl: './modal-fee-code-lvl2.component.html',
  styleUrls: ['./modal-fee-code.component.css']
})
export class ModalFeeCodeLvl2Component implements OnInit {
  public entity: FeeCode;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  public listParentLvl1: FeeCode[] = [];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private _notificationService: NotificationService, 
    private feeCodeService: FeeCodeService
  ) { }

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents() {
    this.feeCodeService.getAll(null, 1, 2).subscribe((res: ResponseValue<FeeCode[]>) => {
      this.listParentLvl1 = res.data;
    });
  }

  add() {
    this.entity = {
      level: 2,
      status: 0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.feeCodeService.getDetail(id).subscribe((res: ResponseValue<FeeCode>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.feeCodeService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            this._notificationService.printErrorMessage(res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.feeCodeService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  onHidden() {
    this.CloseModal.emit();
  }
}
