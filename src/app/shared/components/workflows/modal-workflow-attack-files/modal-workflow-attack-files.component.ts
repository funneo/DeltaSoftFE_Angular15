import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue, Workflow } from '@app/shared/models';
import { WorkflowAttackFiles } from '@app/shared/models/workflows/workflow-attack-files.model';
import { AuthService, NotificationService, WorkflowsService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-workflow-attack-files',
  templateUrl: './modal-workflow-attack-files.component.html',
  styleUrls: ['./modal-workflow-attack-files.component.css']
})
export class ModalWorkflowAttackFilesComponent implements OnInit {
  public entity?: Workflow;
  public listFiles: WorkflowAttackFiles[] = [];
  public isLock: boolean = false;

  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAttachFiles', { static: false }) modalAttachFiles: ModalDirective;
  busy: any;
  constructor(private _notificationService: NotificationService
    , private workflowService: WorkflowsService
    , private _authService: AuthService
  ) { }

  ngOnInit(): void {

  }

  onFileChanged(event, item: WorkflowAttackFiles) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (item.id == undefined) {
        this.busy = this.workflowService.attackfiles_add(item, file).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.loadAttachFiles();
          } else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code);
          }
        });
      }
    }
  }
  newAttachFile() {
    let item: WorkflowAttackFiles = {
      workflowId: this.entity.id,
      checked: false,
      type: 0
    }
    this.listFiles.push(item);
  }

  loadAttachFiles() {
    const params = new HttpParams()
    let item: WorkflowAttackFiles = {
      workflowId: this.entity.mainJobId,
      type: 0
    }
    this.workflowService.attackfiles_get(item).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFiles = res.data;
      } else {
        this.listFiles = [];
      }
    });
  }
  clickLink(item: WorkflowAttackFiles) {
    let url = environment.apiUrl + item.pathFile.replace('~', '');
    window.open(url, "_blank");
  }

  deleteFile(item: WorkflowAttackFiles) {
    this.workflowService.attackfiles_delete(item).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this._notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
        this.loadAttachFiles();
      } else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
      }
    });
  }

  edit(item: Workflow, flag: boolean) {
    this.isLock = flag;
    this.entity = item;
    this.loadAttachFiles();
    this.modalAttachFiles.show();
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
