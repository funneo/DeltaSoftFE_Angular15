import { Component, OnInit, ViewChild, Output, ViewChildren, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { NotificationService, UserService } from '@app/shared/services';
import { MessageContstants } from '@app/shared/constants';

@Component({
  selector: 'modal-mat-khau',
  templateUrl: './modal-mat-khau.component.html',
  styleUrls: ['./modal-mat-khau.component.css']
})


export class ModalMatKhauComponent implements OnInit {
  public entityPass: any = {};

  @ViewChild('modalEditPass') public modalEditPass: ModalDirective;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;

  constructor(private _userService: UserService, private _notificationService: NotificationService) {
  }

  ngOnInit() {
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  saveChangePass(form: NgForm) {
    this.entityPass.currentPassword = '000000';

    if (form.valid) {
      this._userService.resetPass(this.entityPass)
        .subscribe((response: any) => {
          this.modalEditPass.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(response);
        }, () => {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        });
    }
    else {

    }
  }

  viewModal(id: string) {
    this.entityPass.userName = id;
    this.modalEditPass.show();
  }
}
