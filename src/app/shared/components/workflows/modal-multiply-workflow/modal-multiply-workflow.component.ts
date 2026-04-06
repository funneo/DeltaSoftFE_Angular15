import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, Workflow } from '@app/shared/models';
import { NotificationService, WorkflowsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-multiply-workflow',
  templateUrl: './modal-multiply-workflow.component.html',
  styleUrls: ['./modal-multiply-workflow.component.css']
})
export class ModalMultiplyWorkflowComponent implements OnInit {
  multiValue?:number;
  entity:Workflow;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalMultiply', { static: false }) modalMultiply: ModalDirective;
  constructor(
    private workflowService:WorkflowsService,
    private notificationService:NotificationService
  ) { }

  ngOnInit(): void {
  }

  edit(item:Workflow){
    this.entity=item;
    this.multiValue=0;
    this.modalMultiply.show();
  }

  multiply(){
    if(this.multiValue<1)return;
    const params = new HttpParams()
      .set('id',this.entity.id.toString())
      .set('number', this.multiValue.toString())
        this.workflowService.multiply(params).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
              this.modalMultiply.hide();
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(true);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
          }
        }, () => {
        });
  }

}
