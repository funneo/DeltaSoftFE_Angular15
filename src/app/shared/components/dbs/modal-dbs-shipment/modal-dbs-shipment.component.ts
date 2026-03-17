import { FileName } from './../../../pipes/file.pipe';
import { tap } from 'rxjs/operators';
import { Accept } from './../../../pipes/accept.pipe';
import { DbsShipmentService } from '@app/shared/services/dbs-shipment.service';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Profile, ResponseValue } from '@app/shared/models';
import { DbsShipment } from '@app/shared/models/dbs/dbs-shipment.model';
import {
  AuthService,
  NotificationService,
  UtilityService,
  WorkflowsService,
} from '@app/shared/services';
import { NgForm } from '@angular/forms';
import { DbsShipmentWorkflow } from '@app/shared/models/dbs/dbs-shipment-workflow.model';
import { DbsShipmentListAttachFiles } from '@app/shared/models/dbs/dbs-shipment-list-attach-files.model';
import { Subscription } from 'rxjs';
import { DbsShipmentActions } from '@app/shared/models/dbs/dbs-shipment-actions.model';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageContstants } from '@app/shared/constants';

@Component({
  selector: 'modal-dbs-shipment',
  templateUrl: './modal-dbs-shipment.component.html',
  styleUrls: ['./modal-dbs-shipment.component.css'],
})
export class ModalDbsShipmentComponent implements OnInit {
  public entity: DbsShipment;
  public userLoged: Profile;
  wfId?: number;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalDbsAddEdit', { static: false })
  modalDbsAddEdit: ModalDirective;
  constructor(
    private workflowService: WorkflowsService,
    private _service: DbsShipmentService,
    private _utilityService: UtilityService,
    private notificationService: NotificationService,
    private wfSer: WorkflowsService,
    private _authService:AuthService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
  }

  edit(id: number) {
    this._service.getDetail(id).subscribe((res: ResponseValue<DbsShipment>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.modalDbsAddEdit.show();
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.SYSTEM_ERROR_MSG
        );
      }
    });
  }

  onFileChanged(event) {
    if (event.target.files.length > 0) {
      let p: DbsShipmentListAttachFiles = {
        ediReference: this.entity.ediReference,
        fileName:event.target.files[0].FileName,
        isPod: true,createdBy:this.userLoged.id
      };
      const file = event.target.files[0];
      this.busy = this._service.uploadFiles(p, file).subscribe((res: ResponseValue<DbsShipmentListAttachFiles[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.entity.shipmentListAttachFiles.push(p);
          this.modalDbsAddEdit.hide();
          this.SaveSuccess.emit(res.data);
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
        }
      });
    }
  }
  saveChange(form: NgForm) {
    if (form.valid) {
    }
  }

  clickLink(item: DbsShipmentListAttachFiles) {
    let url = environment.apiUrl + item.pathFile.replace('~', '');
    window.open(url, '_blank');
  }

  acceptEDI() {
    this.notificationService.printConfirmationDialog(
      'Xác nhận EDI từ DBS',
      () => {
        this.entity.acceptBy=this.userLoged.id;
        this.busy = this._service
          .accept(this.entity)
          .subscribe((res: ResponseValue<DbsShipment>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalDbsAddEdit.hide();
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
            }
          });
      }
    );
  }
  acceptDocument() {
    this.notificationService.printConfirmationDialog(
      'Xác nhận chứng từ DBS',
      () => {
        this.entity.sendDocBy=this.userLoged.id;
        this.busy = this._service
          .acceptDocument(this.entity)
          .subscribe((res: ResponseValue<DbsShipment>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalDbsAddEdit.hide();
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
            }
          });
      }
    );
  }
  updateNotes(){
    if(this.entity.notes.length<1)return;
    this.entity.updatedBy=this.userLoged.id;
    this.busy = this._service
          .updateNotes(this.entity)
          .subscribe((res: ResponseValue<DbsShipment>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalDbsAddEdit.hide();
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
            }
          });
  }
  updateDone(){
    if(this.entity.notes.length<1)return;
    this.busy = this._service
          .done(this.entity)
          .subscribe((res: ResponseValue<DbsShipment>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalDbsAddEdit.hide();
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
            }
          });
  }

  reSendConfirm(item: DbsShipmentActions): void {
    this.notificationService.printConfirmationDialog(
      MessageContstants.UPDATE_STATE,
      () => this.reSendDbs(item)
    );
  }

  reSendDbs(item: DbsShipmentActions) {
    this._service.updateState(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(
          MessageContstants.UPDATED_OK_MSG
        );
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.DELETE_ERR_MSG + '\n' + res.code
        );
      }
    });
  }

  newWorkflow() {
    if (!this.wfId) return;
    if (this.wfId < 1) return;
    this.wfSer
      .getDetail(this.wfId.toString())
      .subscribe((res: ResponseValue<DbsShipment>) => {
        if (res.code == '200' || res.code == '201') {
          let item: DbsShipmentWorkflow = {
            ediReference: this.entity.ediReference,
            workflowId: this.wfId,
          };
          this.busy = this._service
            .addWorkflow(item)
            .subscribe((res: ResponseValue<DbsShipment>) => {
              if (res.code == '200' || res.code == '201') {
                this.entity.shipmentListWorkflows.push(item);
              } else {
                this.notificationService.printErrorMessage(
                  MessageContstants.WORKFLOW_ID_NOT_EXIST
                );
              }
            });
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.WORKFLOW_ID_NOT_EXIST
          );
        }
      });
  }

  deleteWorkflow(item: DbsShipmentWorkflow) {
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => {
        this.busy = this._service
          .deleteWorkflow(item)
          .subscribe((res: ResponseValue<DbsShipment>) => {
            if (res.code == '200' || res.code == '201') {
              var _index = this.entity.shipmentListWorkflows.findIndex(
                (it) => it.workflowId == item.workflowId
              );
              this.entity.shipmentListWorkflows.splice(_index, 1);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.WORKFLOW_ID_NOT_EXIST
              );
            }
          });
      }
    );
  }
  OnHidden() {
    this.modalDbsAddEdit.hide();
  }
}
