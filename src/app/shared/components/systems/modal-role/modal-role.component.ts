import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Role } from '@app/shared/models';
import { NotificationService, RolesService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-role',
  templateUrl: './modal-role.component.html',
  styleUrls: ['./modal-role.component.css']
})
export class ModalRoleComponent implements OnInit {

  entity: Role;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  @Output() SaveSuccess = new EventEmitter<any>();
  @Output() CloseModal = new EventEmitter<any>();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private roleService: RolesService) { }

  ngOnInit() {

  }

  add() {
    this.entity = {
      status: true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.busy = this.roleService.getDetail(id).subscribe((res: Role) => {
      this.entity = res;
      this.flagXem = flag;
      this.flagSave = false;
      this.modalAddEdit.show();
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.roleService.add(this.entity).subscribe((res: Role) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.roleService.update(this.entity).subscribe((res: Role) => {
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

  OnHidden() {
    this.CloseModal.emit();
  }

}
