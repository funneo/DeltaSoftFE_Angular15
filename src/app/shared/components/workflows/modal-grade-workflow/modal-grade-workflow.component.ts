import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, Workflow } from '@app/shared/models';
import { NotificationService, WorkflowsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-grade-workflow',
  templateUrl: './modal-grade-workflow.component.html',
  styleUrls: ['./modal-grade-workflow.component.css']
})
export class ModalGradeWorkflowComponent implements OnInit {

  public entity:Workflow;
  public isCs: boolean = false;
  public flagGrade:boolean=false;
  
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalGrade', { static: false }) modalGrade: ModalDirective;
  constructor(
    private workflowService:WorkflowsService
    ,private notificationService:NotificationService
  ){}

  ngOnInit(): void {
  }

  checkValue(){
    let tmpValue:boolean=true;
      if(this.isCs){
        tmpValue=this.entity.opGradeByCS>0 && this.entity.opManGradeByCS>0 ;
      }else{
        tmpValue=this.entity.opGradeByOpMan>0 && this.entity.csGradeByOpMan>0 ;
      }
    this.flagGrade=tmpValue;
  }
  edit(id:number,flag:boolean){
    this.workflowService.getDetail(id.toString()).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.isCs=flag;
        this.checkValue();
        this.modalGrade.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  setGrade(){
    if(this.isCs){
      this.entity.gradeType='0';
      this.entity.grade1=this.entity.opManGradeByCS;
      this.entity.evaluation1=this.entity.opManEvaluationByCS;
      this.entity.grade2=this.entity.opGradeByCS;
      this.entity.evaluation2=this.entity.opEvaluationByCS;
    }else{
      this.entity.gradeType='1';
      this.entity.grade1=this.entity.csGradeByOpMan;
      this.entity.evaluation1=this.entity.csEvaluationByOpMan;
      this.entity.grade2=this.entity.opGradeByOpMan;
      this.entity.evaluation2=this.entity.opEvaluationByOpMan;
    }
      this.workflowService.updateGrade(this.entity).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalGrade.hide();
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(this.entity);
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
        }
      }, () => {
      });
  }
}
