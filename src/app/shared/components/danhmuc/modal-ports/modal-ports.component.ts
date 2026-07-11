
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { GroupPorts } from '@app/shared/models/danhmuc/group-ports.model';
import { Ports } from '@app/shared/models/danhmuc/ports.model';
import { UtilityService, NotificationService } from '@app/shared/services';
import { PortsService } from '@app/shared/services/danhmuc/ports.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-ports',
  templateUrl: './modal-ports.component.html',
  styleUrls: ['./modal-ports.component.css']
})
export class ModalPortsComponent implements OnInit {
  public entity: Ports;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  maskNumber = UtilityService.maskNumber;
  mask0 = UtilityService.mask0;
  listGroupPorts: GroupPorts[] = [];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private _notificationService: NotificationService,
    private portsService: PortsService
  ) { }

  ngOnInit(): void {
    this.loadGroupPorts();
  }

  loadGroupPorts() {
    this.portsService.getAllGroupPorts().subscribe((res: ResponseValue<GroupPorts[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listGroupPorts = res.data ?? [];
        console.log(this.listGroupPorts);     
      }
    });
  }

  add() {
    // BranchId do BE tự gán từ token (User.GetBranchId()) — FE không nhập.
    this.entity = { checked: false };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(code: string, flag: boolean) {
    this.portsService.getDetail(code).subscribe((res: ResponseValue<Ports>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      } else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.portsService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            // Ưu tiên thông báo từ BE (vd "Địa chỉ Google Map không đúng") để người dùng nhập lại
            this._notificationService.printErrorMessage(res.message ? res.message : MessageContstants.CREATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => { this.flagSave = false; });
      } else {
        this.portsService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            // Ưu tiên thông báo từ BE (vd "Địa chỉ Google Map không đúng") để người dùng nhập lại
            this._notificationService.printErrorMessage(res.message ? res.message : MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => { this.flagSave = false; });
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
