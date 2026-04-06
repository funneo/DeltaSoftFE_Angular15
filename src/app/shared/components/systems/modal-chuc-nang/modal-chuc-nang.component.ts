import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Functions, TapTin, User } from '@app/shared/models';
import { FunctionService, NotificationService, UserService, UtilityService, AuthService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { combineLatest, Subscription } from 'rxjs';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-modal-chuc-nang',
  templateUrl: './modal-chuc-nang.component.html',
  styleUrls: ['./modal-chuc-nang.component.css']
})
export class ModalChucNangComponent implements OnInit {
  entity: Functions;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  viewModalFile = false;
  IdTemp: number = 1;
  public _functions: any[];
  flagEdit: boolean = false;

  @Output() SaveSuccess = new EventEmitter<any>();
  @Output() CloseModal = new EventEmitter<any>();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  public maskNumber = UtilityService.maskNumber;
  public dateOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  public listUser: User[];

  constructor(private _notificationService: NotificationService, private functionService: FunctionService, private userService: UserService, private _utilityService: UtilityService, private authService: AuthService) { }

  ngOnInit() {
    this.loadChucNang();
  }

  loadChucNang(refresh: boolean = false): void {
    this.busy = this.functionService.getAll().subscribe((res: Functions[]) => {
      var lst = res.filter(x => x.parentId == null).sort((a, b) => a.sortOrder - b.sortOrder);
      this._functions = [];
      lst.forEach(element => {
        this._functions.push(element);
        var temp = res.filter(x => x.parentId == element.id).sort((a, b) => a.sortOrder - b.sortOrder);
        temp.forEach(child => {
          child.name = child.name;
          this._functions.push(child);
        });
      });
    });
  }

  add() {
    setTimeout(() => {
      this.entity = {
        status: true,
        isMenu: true
      };
    }, 0);
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.busy = this.functionService.getDetail(id).subscribe((res: Functions) => {
      this.entity = {};
      this.entity = res;
      this.flagXem = flag;
      this.flagEdit = true;
      this.flagSave = false;
      this.modalAddEdit.show();
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (!this.flagEdit) {
        this.functionService.add(this.entity).subscribe((res: Functions) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.functionService.update(this.entity).subscribe((res: Functions) => {
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
