import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { Jobgroup } from '@app/shared/models/jobgroup';
import { Jobgroupoption } from '@app/shared/models/jobgroupoption';
import { NotificationService } from '@app/shared/services';
import { JobgroupService } from '@app/shared/services/jobgroup.service';
import { JobgroupoptionService } from '@app/shared/services/jobgroupoption.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-jobgroupoption',
  templateUrl: './modal-jobgroupoption.component.html',
  styleUrls: ['./modal-jobgroupoption.component.css']
})
export class ModalJobgroupoptionComponent implements OnInit {
  public entity:Jobgroupoption;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listJobGroup:Jobgroup[];
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,private jobGroupOptionService:JobgroupoptionService
,private jobGroupService:JobgroupService
  ) { }

  ngOnInit(): void {
    this.loadJobGroup();
  }

  loadJobGroup(): void {
    const params = new HttpParams()
      this.busy = this.jobGroupService.getAll().subscribe((res: ResponseValue<Jobgroup[]>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listJobGroup = res.data
        }
      });
  }
  add() {
    this.entity={
      checked:false
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.jobGroupOptionService.getDetail(id).subscribe((res: ResponseValue<Jobgroupoption>) => {
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
        this.jobGroupOptionService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.jobGroupOptionService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
