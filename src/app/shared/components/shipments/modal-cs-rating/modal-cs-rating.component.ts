import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output,  ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OpenShipment, RatingCS, ResponseValue } from '@app/shared/models';
import { DebitNotesService, NotificationService, OpenShipmentService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { InteractivityChecker } from '@angular/cdk/a11y';

@Component({
  selector: 'modal-cs-rating',
  templateUrl: './modal-cs-rating.component.html',
  styleUrls: ['./modal-cs-rating.component.css']
})
export class ModalCsRatingComponent implements OnInit {
  public entity: RatingCS;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  _rate=0;
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
  constructor(private _notificationService: NotificationService, private debitNotesService: DebitNotesService,
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

  onModelChange(event:any):void{
    console.log(event);
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

  changedRating(event:any){
    this.entity.rating=event;
  }

  add(item: RatingCS) {
    this.entity = {
      status: true,
      debitId:item.debitId,
      employeeId: item.employeeId,
      rating:0,
      debitNo:item.debitNo,
      feedback: '',
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.debitNotesService.rating(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
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
