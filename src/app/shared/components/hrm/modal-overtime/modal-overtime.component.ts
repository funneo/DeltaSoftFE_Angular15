import { OverTimeWorkflows } from './../../../models/hrm/over-time-workflows.model';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { OverTime } from '@app/shared/models/hrm/over-time.model';
import { AuthService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { OverTimeService } from '@app/shared/services/hrm/over-time.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalSearchOpWorkflowComponent } from '../../workflows/modal-search-op-workflow/modal-search-op-workflow.component';

@Component({
  selector: 'modal-overtime',
  templateUrl: './modal-overtime.component.html',
  styleUrls: ['./modal-overtime.component.css']
})
export class ModalOvertimeComponent implements OnInit {
  public entity: OverTime;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;


  listDepartment: OtherCategories[] = [];
  viewAttachFiles: boolean = false;
  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;
  _idpccv: string = '';
  viewSearchModal = false;
  hasPermissionApproved = false;
  isChuyenduyet: boolean = false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayketthucOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngaydieuchinhbatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngaydieuchinhketthucOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalSearchOpWorkflowComponent, { static: false }) modalListWorkflow: ModalSearchOpWorkflowComponent
  constructor(
    private _notificationService: NotificationService
    , private otherCategoriesService: OtherCategoriesService
    , private _authService: AuthService
    , private _utilityService: UtilityService
    , private overTimeService: OverTimeService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadDepartment();
  }


  loadDepartment() {
    const params = new HttpParams()
      .set('type', 'DEPT');
    this.busy = this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDepartment = res.data
      }
    });
  }

  add() {
    this.entity = {
      checked: false, overTimeMinutes: 0, discontinuityTime: 0, status: 0, details: []
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.isChuyenduyet = true;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean, permission: boolean) {
    this.overTimeService.getDetail(id).subscribe((res: ResponseValue<OverTime>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagNew = false;
        this.flagXem = (flag && !permission);
        this.flagSave = false;
        this.hasPermissionApproved = this.entity.isApprove;
        this.entity.details.forEach(item => {
          this._idpccv = this._idpccv + (this._idpccv.length > 0 ? ';' : '') + item.workflowId.toString();
        });
        if (this.entity.estimatedStartTime) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.estimatedStartTime = moment(this.entity.estimatedStartTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.estimatedFinishTime) {
          this.ngayketthucOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.estimatedFinishTime = moment(this.entity.estimatedFinishTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.adjustStartedTime) {
          this.ngaydieuchinhbatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.adjustStartedTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.adjustStartedTime = moment(this.entity.adjustStartedTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.adjustFinishedTime) {
          this.ngaydieuchinhketthucOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.adjustFinishedTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.adjustFinishedTime = moment(this.entity.adjustFinishedTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
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
      this.entity.branchId = Number.parseInt(this.userLoged.branchId);
      this.entity.createdBy = this.userLoged.id;
      if (this.entity.id == undefined) {
        this.overTimeService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(true);
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
        this.overTimeService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }
  startStop(status: number) {
    this.overTimeService.startStop(this.entity, status == 0).subscribe((res: ResponseValue<OverTime>) => {
      if (res.code == '200' || res.code == '201') {
        this.SaveSuccess.emit(true);
        this.modalAddEdit.hide();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  //Chuyển duyệt
  changeStatus(type: number) {
    this.entity.acceptedBy = this.userLoged.id;
    //Kiểm tra nếu trạng thái là từ chối
    if (type == 1) {
      this.overTimeService.update(this.entity).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.overTimeService.updateState(this.entity, type).subscribe((res: ResponseValue<OverTime>) => {
            if (res.code == '200' || res.code == '201') {
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            }
            else {
              this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
            }
          });
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
          this.flagSave = false;
        }
      }, () => {
        this.flagSave = false;
      });
    } else {
      this.overTimeService.updateState(this.entity, type).subscribe((res: ResponseValue<OverTime>) => {
        if (res.code == '200' || res.code == '201') {
          this.SaveSuccess.emit(true);
          this.modalAddEdit.hide();
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
        }
      });
    }

  }

  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'OVERTIME',
      functionName: 'OVERTIME',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, this.userLoged.id != this.entity.createdBy);
    }, 50);
  }
  viewSearch() {
    this.viewSearchModal = true;
    setTimeout(() => {
      this.modalListWorkflow.add();
    }, 50);
  }
  viewDetails() {
    this.viewSearchModal = true;
    setTimeout(() => {
      this.modalListWorkflow.view(this.entity);
    }, 50);
  }
  selectedNgaybatdau(event) {
    this.entity.estimatedStartTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdau(event) {
    if (this.entity.estimatedStartTime == null)
      this.entity.estimatedStartTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');

  }
  selectedNgayketthuc(event) {
    this.entity.estimatedFinishTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgayketthuc(event) {
    if (this.entity.estimatedFinishTime == null)
      this.entity.estimatedFinishTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedNgaybatdauDieuchinh(event) {
    this.entity.adjustStartedTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdauDieuchinh(event) {
    if (this.entity.adjustStartedTime == null)
      this.entity.adjustStartedTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');

  }
  selectedNgayketthucDieuchinh(event) {
    this.entity.adjustFinishedTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgayketthucDieuchinh(event) {
    if (this.entity.adjustFinishedTime == null)
      this.entity.adjustFinishedTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
  closeModalAttachFiles() {
    this.viewAttachFiles = false;
  }
  closeSearch() {

    this.viewSearchModal = false;
  }
  saveSuccess(value): void {
    this.entity.details = [];
    this._idpccv = ''
    value.forEach(item => {
      let value: OverTimeWorkflows = {
        workflowId: item.id,
        jobId: item.jobId
      };
      this.entity.details.push(value);
      this._idpccv = this._idpccv + (this._idpccv.length > 0 ? ';' : '') + item.id.toString();
    })
  }

}
