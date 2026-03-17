import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm} from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, ResponseValue } from '@app/shared/models';
import { Handlinggroup } from '@app/shared/models/handlinggroup';
import { NotificationService, BranchService } from '@app/shared/services';
import { HandlinggroupService } from '@app/shared/services/handlinggroup.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-handlinggroup',
  templateUrl: './modal-handlinggroup.component.html',
  styleUrls: ['./modal-handlinggroup.component.css']
})
export class ModalHandlinggroupComponent implements OnInit {
  public entity: Handlinggroup;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listBranch:Branch[];
  _branchId:number;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    ,private handlingGroupService:HandlinggroupService
    ,private branchService:BranchService
    ) { }

  ngOnInit(): void {
    this.loadChiNhanh();
  }
  public typehandlingList = [
    {id: 0, name: 'Nhóm khác'},
    {id: 1, name: 'Nhóm vận chuyển'},
  ];

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  add() {
    this.entity={
      type:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.handlingGroupService.getDetail(id).subscribe((res: ResponseValue<Handlinggroup>) => {
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
        this.handlingGroupService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.handlingGroupService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
            this.flagSave = false;
          }
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
