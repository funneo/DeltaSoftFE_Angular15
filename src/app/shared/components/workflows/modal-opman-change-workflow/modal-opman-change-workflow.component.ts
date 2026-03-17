import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Profile, ResponseValue, Workflow, WorkflowJobOption } from '@app/shared/models';
import { AuthService, NotificationService, UtilityService, WorkflowsService } from '@app/shared/services';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-opman-change-workflow',
  templateUrl: './modal-opman-change-workflow.component.html',
  styleUrls: ['./modal-opman-change-workflow.component.css']
})
export class ModalOpmanChangeWorkflowComponent implements OnInit {
  public entity:Workflow;
  public userLoged:Profile;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  opManchangeNgaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  opManchangeNgayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  public flagOk:boolean=false;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalOpUpdate', { static: false }) modalOpUpdate: ModalDirective;
  constructor(private notificationService: NotificationService,
  private workflowService:WorkflowsService,private _authService:AuthService 
  ,private _utilityService:UtilityService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
  }

  edit(id: string) {
    this.workflowService.getDetail(id).subscribe((res: ResponseValue<Workflow>): void => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if(this.entity.estimatedStartTime){
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)),true
          );
          this.entity.estimatedStartTime = moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if(this.entity.estimatedFinishTime){
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)),true
          );
          this.entity.estimatedFinishTime = moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if(this.entity.opManChangedEstimatedStartTime){
          this.opManchangeNgaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.opManChangedEstimatedStartTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)),true
          );
          this.entity.opManChangedEstimatedStartTime = moment(this.entity.opManChangedEstimatedStartTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if(this.entity.opManChangedEstimatedFinishTime){
          this.opManchangeNgayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.opManChangedEstimatedFinishTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN)),true
          );
          this.entity.opManChangedEstimatedFinishTime = moment(this.entity.opManChangedEstimatedFinishTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        this.modalOpUpdate.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  changeOpMan() {
    let s=this.entity.opManChangedEstimatedStartTime.toString();
    let f=this.entity.opManChangedEstimatedFinishTime.toString();
    let cs=this.entity.estimatedStartTime.toString();
    if(f<=s || s<cs){
      this.notificationService.printErrorMessage(MessageContstants.OPMAN_CHANGE_ERR_MSG);
    }else{
      this.workflowService.opManUpdate(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalOpUpdate.hide();
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
          }
        }, () => {
        });
    }   
  }
  selectedNgaybatdauOpMan(event) {
    this.entity.opManChangedEstimatedStartTime = moment(event.start).format('DD/MM/YYYY hh:mm:ss');
  }
  closedNgaybatdauOpMan(event) {
    if (this.entity.opManChangedEstimatedStartTime == null)
      this.entity.opManChangedEstimatedStartTime = moment(event.oldStartDate).format('DD/MM/YYYY hh:mm:ss');
  }
  selectedNgayhoanthanhOpMan(event) {
    this.entity.opManChangedEstimatedFinishTime = moment(event.start).format('DD/MM/YYYY hh:mm:ss');
  }
  closedNgayhoanthanhOpMan(event) {
    if (this.entity.opManChangedEstimatedFinishTime == null)
      this.entity.opManChangedEstimatedFinishTime = moment(event.oldStartDate).format('DD/MM/YYYY hh:mm:ss');
  }
  
  OnHidden() {
    this.CloseModal.emit();
  }
  hide() {
    this.CloseModal.emit();
  }
}
