import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, Workflow } from '@app/shared/models';
import { DispatchOrderAttachfiles } from '@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles';
import { WorkflowAttackFiles } from '@app/shared/models/workflows/workflow-attack-files.model';
import { AuthService, NotificationService, WorkflowsService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-workflow-images',
  templateUrl: './modal-workflow-images.component.html',
  styleUrls: ['./modal-workflow-images.component.css']
})
export class ModalWorkflowImagesComponent implements OnInit {
  public entity: Workflow;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public haveProcedure: boolean = false;
  listImage: WorkflowAttackFiles[] = [];
  listPod: WorkflowAttackFiles[] = [];
  public busy: Subscription;
  public isOpMan=false;
 
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalImagePod', { static: false }) modalImagePod: ModalDirective;
  constructor(private notificationService: NotificationService, private workflowService: WorkflowsService
    , private _authService: AuthService
  ) { }

  ngOnInit(): void {

  }

  edit(id: string,flag:boolean) {
    this.workflowService.getDetail(id).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.isOpMan=flag;
        this.loadImagePod();
        this.modalImagePod.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  loadImagePod() {
    this.workflowService.imagesPod_get(this.entity).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.listImage = this.entity.listWorkflowImages;
        this.listPod=this.entity.listWorkflowPod;
        this.modalImagePod.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  
  viewAll() {

  }
  onFileChanged(event, item: WorkflowAttackFiles) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (item.id == undefined) {
        item.type = 0;
        this.busy = this.workflowService.attackfiles_add(item, file).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.loadImagePod();
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
    this.listImage.push(item);
  }
  deleteFile(item: WorkflowAttackFiles) {
    this.workflowService.attackfiles_delete(item).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
        this.loadImagePod();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
      }
    });
  }

  clickLink(item: WorkflowAttackFiles) {
    let url = environment.apiUrl + item.pathFile.replace('~', '');
    window.open(url, "_blank");
  }

  hide() {
    this.CloseModal.emit();
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
