import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output,  ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OpenDebitNote, ResponseValue } from '@app/shared/models';
import { NotificationService, OpenDebitNoteService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { InteractivityChecker } from '@angular/cdk/a11y';

@Component({
  selector: 'modal-open-debit-note',
  templateUrl: './modal-open-debit-note.component.html',
  styleUrls: ['./modal-open-debit-note.component.css']
})
export class ModalOpenDebitNoteComponent implements OnInit {
  public entity: OpenDebitNote;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  @ViewChild('aForm') aForm: ElementRef;
  @ViewChild('addEditForm') f: NgForm;
  @HostListener('keyup', ['$event'])
  keyevent(event) {
    if (event.keyCode === 38) {
      this.setPrevFocus(event.target.name);
    }
    if (event.keyCode === 40) {
      //this.setValue(event);
      this.setNextFocus(event.target.name);
    }
  }
  constructor(private _notificationService: NotificationService, private openDebitNoteService: OpenDebitNoteService,
    private interactivityChecker: InteractivityChecker) { }

  ngOnInit(): void {

  }

  setFocus(name) {
    const ele = this.aForm.nativeElement[name];
    if (ele) {
      ele.focus();
    }
  }

  onShow() {
    this.setFocus("openjobfeedback");
  }

  setPrevFocus(currentId) {
    const ctrls = Object.keys(this.f.controls);
    for (let key = ctrls.indexOf(currentId) - 1; key >= 0; key--) {
      const control = this.aForm.nativeElement[ctrls[key]];
      if (control && this.interactivityChecker.isFocusable(control)) {
        control.focus();
        control.select();
        break;
      }
    }
  }

  setNextFocus(currentId) {
    const ctrls = Object.keys(this.f.controls);
    for (let key = ctrls.indexOf(currentId) + 1; key < ctrls.length; key++) {
      const control = this.aForm.nativeElement[ctrls[key]];
      if (control && this.interactivityChecker.isFocusable(control)) {
        control.focus();
        control.select();
        break;
      }
    }
  }

  add(item: any) {
    this.entity = {
      status: true,
      debitNoteId:item.debitNoteId,
      customerId:item.customerId,
      debitNo:item.debitNo,
      notes: '',
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.openDebitNoteService.getDetail(id).subscribe((res: ResponseValue<OpenDebitNote>) => {
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
        this.openDebitNoteService.add(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.openDebitNoteService.update(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res);
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
