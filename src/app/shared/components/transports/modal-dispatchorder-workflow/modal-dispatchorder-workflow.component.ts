import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, Workflow } from '@app/shared/models';
import { Dispatchorderdetailed } from '@app/shared/models/transports/dispatchorders/dispatchorderdetailed';
import { WorkflowSearchDispatchOrder } from '@app/shared/models/workflows/workflow-search-dispatch-order.model';
import { NotificationService, WorkflowsService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalSearchWorkflowComponent } from '../../workflows/modal-search-workflow/modal-search-workflow.component';

@Component({
  selector: 'modal-dispatchorder-workflow',
  templateUrl: './modal-dispatchorder-workflow.component.html',
  styleUrls: ['./modal-dispatchorder-workflow.component.css']
})
export class ModalDispatchorderWorkflowComponent implements OnInit {
  public entity: Dispatchorderdetailed;
  public listEntity: Dispatchorderdetailed[] = [];
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;
  public busy: Subscription;
  public branchId?: number;
  public selectedWorkflows?: Workflow
  public flagOk: boolean = false;
  viewSearchJobId: boolean = false;
  @Input() item: any;
  @Input() listItem: any;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalWorkflow', { static: false }) modalWorkflow: ModalDirective;
  constructor(private _notificationService: NotificationService
    , private workflowService: WorkflowsService
  ) { }

  ngOnInit(): void {

  }

  loadWorkflow(event: string) {
    this.workflowService.getDetail(event).subscribe((res: ResponseValue<Workflow>) => {
      if (res.code == '200' || res.code == '201') {
        this.selectedWorkflows = res.data;
        if (this.selectedWorkflows.isJobFinish) {
          this._notificationService.printConfirmationDialog("Công việc đã hoàn thành, không thể gán vào lệnh " + this.selectedWorkflows.refNo + ", kiểm tra lại!", () => { });
          this.entity.id = null;
        } else
          if (this.selectedWorkflows.refNo) {
            this._notificationService.printConfirmationDialog("Id Công việc đã được gán vào lệnh " + this.selectedWorkflows.refNo + ", kiểm tra lại!", () => { });
            this.entity.id = null;
          } else
            if (this.selectedWorkflows.jobGroupId != environment.transportGroupId) {
              this._notificationService.printConfirmationDialog("Id Công việc không phải là vận chuyển, kiểm tra lại!", () => { });
              this.entity.id = null;
            } else {
              if (this.selectedWorkflows.status < 1) {
                this.flagOk = false;
                this._notificationService.printConfirmationDialog("Id Công việc chưa được điều vận tiếp nhận, kiểm tra lại!", () => { });
                this.entity.id = null;
              } else {
                this.entity.id = this.selectedWorkflows.id;
                this.entity.jobId = this.selectedWorkflows.jobId;
                this.entity.customerCode = this.selectedWorkflows.customerCode;
                this.entity.customerName = this.selectedWorkflows.customerName;
                this.flagOk = true;
              }
            }
      } else {
        this.flagOk = false;
        this._notificationService.printConfirmationDialog("Id Công việc không tồn tại, kiểm tra lại!", () => { });
        this.entity.id = null;
      }
    });
  }

  add() {
    this.entity = {};
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.modalWorkflow.show();
  }

  edit() {
    this.entity = this.item;
    this.flagOk = this.entity.id > 0;
    this.flagNew = false;
    this.flagSave = false;
    this.modalWorkflow.show();
  }

  @ViewChild(ModalSearchWorkflowComponent, { static: false }) modalSearchJob: ModalSearchWorkflowComponent
  findWorkflow(): void {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalSearchJob.view(this.branchId);
    }, 50);
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      if (this.flagNew && this.listItem.findIndex(x => x.workflowId == this.entity.id) >= 0) {
        this._notificationService.printErrorMessage("Id công việc đã tồn tại, kiểm tra lại!");
      } else {
        //Đoạn này sẽ check xem job đã khóa chưa
        this.modalWorkflow.hide();
        this.flagSave = true;
        this.SaveSuccess.emit(this.entity);
      }
    }
  }

  saveSuccessSearchJob(job: WorkflowSearchDispatchOrder): void {
    this.entity.workflowId = job.id;
    this.entity.jobId = job.jobId;
    this.loadWorkflow(job.id.toString());
  }
  closeSearchJob() {
    this.viewSearchJobId = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
