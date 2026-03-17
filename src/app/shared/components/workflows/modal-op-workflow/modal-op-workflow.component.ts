import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild, } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue, Workflow, WorkflowJobOptionProcedure } from '@app/shared/models';
import { WorkflowAttackFiles } from '@app/shared/models/workflows/workflow-attack-files.model';
import { AuthService, NotificationService, WorkflowsService } from '@app/shared/services';
import { DispatchOrderServiceService } from '@app/shared/services/reports/dispatch-order-service.service';
import { HttpClient } from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';




@Component({
  selector: 'modal-op-workflow',
  templateUrl: './modal-op-workflow.component.html',
  styleUrls: ['./modal-op-workflow.component.css']
})
export class ModalOpWorkflowComponent implements OnInit {
  public entity: Workflow;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public haveProcedure: boolean = false;

  listFiles: WorkflowAttackFiles[] = [];
  userLoged?: Profile;
  public listTientrinh: WorkflowJobOptionProcedure[];
  public busy: Subscription;
  public isOk = false;
  public gradecs: number = 0;
  public gradeopman: number = 0;
  public evaluationcs: string;
  public evaluationopman: string;
  public noteFinish: string;
  public latitue: number = 0.0;
  public longtitude: number = 0.0;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalOpAction', { static: false }) modalOpAction: ModalDirective;
  blob: Blob;
  constructor(private notificationService: NotificationService, private workflowService: WorkflowsService
    , private _authService: AuthService
    , private _reportService: DispatchOrderServiceService

  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
  }

  edit(id: string) {
    this.workflowService.getDetail(id).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.listTientrinh = this.entity.workflowJobOptionProcedures;
        this.haveProcedure = this.listTientrinh?.length > 0;
        this.listFiles = this.entity.listWorkflowImages;
        this.modalOpAction.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  checkValue() {
    let tmpValue: boolean = true;
    this.listTientrinh.forEach(element => {
      tmpValue = element.isFinish || element.isPass;
    })
    if (tmpValue) {
      tmpValue = this.gradecs > 0 && this.gradeopman > 1;
    }
    this.isOk = tmpValue;
  }
  getLocation(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      this.latitue = position.coords.latitude;
      this.longtitude = position.coords.longitude;
    })
  }

  done(id: number, flag: boolean) {
    this.getLocation();
    console.log(flag);
    const params = new HttpParams()
      .set('id', id.toString())
      .set('latitude', this.latitue.toString())
      .set('longtitude', this.longtitude.toString())
      .set('isfinish', flag === true ? "1" : "0")
    this.workflowService.setDone(params).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(flag ? MessageContstants.PROCEDURE_DONE : MessageContstants.PROCEDURE_PASS);
        this.listTientrinh.forEach(value => {
          if (value.id == id) {
            value.isFinish = flag;
            value.isPass = !flag;
          }
        });
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
      }
    }, () => {
      this.flagSave = false;
    });
    this.checkValue();
  }

  onFileChanged(event, item: WorkflowAttackFiles) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (item.id == undefined) {
        item.type = 1;
        this.busy = this.workflowService.attackfiles_add(item, file).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.loadAttachFiles();
          } else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code);
          }
        });
      }
    }
  }
  newAttachFile() {
    let item: WorkflowAttackFiles = {
      workflowId: this.entity.id,
      checked: false,
      type: 1
    }
    this.listFiles.push(item);
  }
  print() {
    console.log('here');
    this._reportService.report_delivery(this.entity).subscribe(data => {
      console.log(data);
      var fileURL = window.URL.createObjectURL(data);
      let tab = window.open();
      tab.location.href = fileURL;
    })
  }

  loadAttachFiles() {
    const params = new HttpParams()
    let item: WorkflowAttackFiles = {
      workflowId: this.entity.id,
      type: 1
    }
    this.workflowService.attackfiles_get(item).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFiles = res.data;
      } else {
        this.listFiles = [];
      }
    });
  }
  viewAll() {

  }
  deleteFile(item: WorkflowAttackFiles) {
    this.workflowService.attackfiles_delete(item).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
        this.loadAttachFiles();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
      }
    });
  }

  clickLink(item: WorkflowAttackFiles) {
    let url = environment.apiUrl + item.pathFile.replace('~', '');
    window.open(url, "_blank");
  }
  ketthuc() {
    const params = new HttpParams()
      .set('id', this.entity.id.toString())
      .set('noteFinish', this.noteFinish)
      .set('gradecs', this.gradecs.toString())
      .set('evaluationcs', this.evaluationcs)
      .set('gradeopman', this.gradeopman.toString())
      .set('evaluationopman', this.evaluationopman)
    this.workflowService.setFinishWorkflow(params).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalOpAction.hide();
        this.notificationService.printSuccessMessage(MessageContstants.ASSIGNING_OK_MSG);
        this.SaveSuccess.emit(res.data);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
        this.flagSave = false;
      }
    }, () => {
      this.flagSave = false;
    });
  }
  hide() {
    this.CloseModal.emit();
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
