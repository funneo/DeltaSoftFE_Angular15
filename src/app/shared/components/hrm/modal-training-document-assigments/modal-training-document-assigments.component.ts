import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Customer, Profile, ResponseValue } from '@app/shared/models';
import { ApproverPermissions } from '@app/shared/models/hrm/training-document-managment/approver-permissions';
import { TrainingDocumentContents } from '@app/shared/models/hrm/training-document-managment/training-document-contents';
import { TrainingDocuments } from '@app/shared/models/hrm/training-document-managment/training-documents';
import { TrainingTemplates } from '@app/shared/models/hrm/training-document-managment/training-templates';
import { NotificationService, AuthService, UtilityService, CustomerService } from '@app/shared/services';
import { ApproverPermissionsService } from '@app/shared/services/hrm/training-document-managment/approver-permissions.service';
import { TrainingDocumentManagmentService } from '@app/shared/services/hrm/training-document-managment/training-document-managment.service';
import { TrainingTemplatesService } from '@app/shared/services/hrm/training-document-managment/training-templates.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-training-document-assigments',
  templateUrl: './modal-training-document-assigments.component.html',
  styleUrls: ['./modal-training-document-assigments.component.css']
})
export class ModalTrainingDocumentAssigmentsComponent implements OnInit {
  public entity: TrainingDocuments;
  public flagSave = false;
  reason?: string;
  listApproval:ApproverPermissions[] = [];
  public viewModal?: boolean = false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private _service: TrainingDocumentManagmentService,
    private _serviceApprover: ApproverPermissionsService,

  ) {}

  ngOnInit(): void {

  }
    
    loadApprover(level:number) {
      const params = new HttpParams();
      this._serviceApprover
        .getAll(level)
        .subscribe((res: ResponseValue<ApproverPermissions[]>) => {
          this.listApproval = res.data;
        });
    }
  view(id: string) {
    this._service
      .getDetail(id)
      .subscribe((res: ResponseValue<TrainingDocuments>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.loadApprover(this.entity.steps+1);
          this.entity.contents.forEach((content) => {
            content.isExpanded=content.contents?.length > 0; // Mở rộng nếu có nội dung
          });
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
        this._service.assignment(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(true);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
    }
  }
  chuyenduyet() {
    let copy = Object.assign({}, this.entity);
    copy.status = 1; // Cập nhật trạng thái thành "Đã duyệt"
    this._service.update(copy).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
  }
  //Chuyển duyệt
  approved() {
    let copy = Object.assign({}, this.entity);
        this._service
          .accept(copy)
          .subscribe((res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.SYSTEM_ERROR_MSG
              );
            }
          });
  }
  

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
