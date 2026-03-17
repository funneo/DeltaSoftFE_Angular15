import { VehicleInspectionJobService } from './../../../services/danhmuc/vehicle-inspection-job.service';
import { VehicleInspectionJob } from './../../../models/transports/vehicle-inspection-job.model';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Profile, ResponseValue } from '@app/shared/models';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AuthService, NotificationService } from '@app/shared/services';
import { MessageContstants } from '@app/shared/constants';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'modal-vehicle-inspection-job',
  templateUrl: './modal-vehicle-inspection-job.component.html',
  styleUrls: ['./modal-vehicle-inspection-job.component.css']
})
export class ModalVehicleInspectionJobComponent implements OnInit {
  public entity:VehicleInspectionJob;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew?:boolean=true;

  public userLoged:Profile;
  public busy: Subscription;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    ,private _authService:AuthService
    ,private service:VehicleInspectionJobService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
  }

  add() {
    this.entity={
      checked:false,isPeriodic:true,isFrequent:true,actived:true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew=true;
    this.modalAddEdit.show();
  }

  edit(id: number,flag:boolean) {

    this.service.getDetail(id).subscribe((res: ResponseValue<VehicleInspectionJob>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.flagNew=false;
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
      if (this.flagNew) {
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
