import { HttpParams } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ResponseValue, Workflow } from '@app/shared/models';
import { OverTime } from '@app/shared/models/hrm/over-time.model';
import { WorkflowsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalViewWorkflowsComponent } from '../modal-view-workflows/modal-view-workflows.component';

@Component({
  selector: 'modal-search-op-workflow',
  templateUrl: './modal-search-op-workflow.component.html',
  styleUrls: ['./modal-search-op-workflow.component.css'],
})
export class ModalSearchOpWorkflowComponent implements OnInit {
  public entity:OverTime;
  public flagView:boolean;
  public busy: Subscription;
  public listWorkflows: Workflow[] = [];
  public filteredWorkflows: Workflow[];
  public _branchId?: number;
  IdSearch: String = '';
  jobIdSearch: String = '';
  hawB_HBLSearch: String = '';
  viewModalWorkflows=false;

  selectedWorkflows: Workflow[] = [];
  isSelected = false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();

  @Input() userId: string;
  @ViewChild(ModalViewWorkflowsComponent, { static: false }) modalViewWorkflows: ModalViewWorkflowsComponent
  @ViewChild('modalListWorkflow', { static: false })
  modalListWorkflow: ModalDirective;
  constructor(private workflowService: WorkflowsService) {}

  ngOnInit(): void {}

  filter() {
    this.filteredWorkflows = Object.assign([], this.listWorkflows);
    if (this.IdSearch?.length > 0)
      this.filteredWorkflows = this.filteredWorkflows.filter((data) => {
        return data.id
          .toString()
          .toLowerCase()
          .includes(this.IdSearch.trim().toLocaleLowerCase());
      });
    if (this.jobIdSearch?.length > 0)
      this.filteredWorkflows = this.filteredWorkflows.filter((data) => {
        return data.jobId
          .toLowerCase()
          .includes(this.jobIdSearch.trim().toLocaleLowerCase());
      });
    if (this.hawB_HBLSearch?.length > 0)
      this.filteredWorkflows = this.filteredWorkflows.filter((data) => {
        return data.jobDescription
          ?.toLowerCase()
          .includes(this.hawB_HBLSearch.trim().toLocaleLowerCase());
      });
  }

  viewNhanviec(id: number): void {
    this.viewModalWorkflows = true;
    setTimeout(() => {
      this.modalViewWorkflows.edit(id.toString());
    }, 0);
  }

  loadWorkflows() {
    const params = new HttpParams();
    this.workflowService
      .getByAssignedUser(params)
      .subscribe((res: ResponseValue<Workflow[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listWorkflows = res.data;
          this.filter();
        } else {
          this.listWorkflows = [];
          this.filter();
        }
      });
  }

  view(item:OverTime) {
    this.entity=item;
    this.entity.details.forEach(it=>{
      let value:Workflow={
        id:it.workflowId,
        jobId:it.jobId,
        jobName:it.jobName,
        jobDescription:it.jobDescription
      }
      this.listWorkflows.push(value);
    })
    this.flagView=true;
    this.filter();
    this.modalListWorkflow.show();
  }
  add(){
    this.isSelected = false;
    this.loadWorkflows();
    this.modalListWorkflow.show();
  }

  clickRow(item: Workflow) {
    item.checked = !item.checked;
    this.isSelected = false;
    this.listWorkflows.forEach((it) => {
      if (it.checked === true) this.isSelected = true;
    });
  }

  saveChange() {
    this.listWorkflows.forEach((it) => {
      if (it.checked) this.selectedWorkflows.push(it);
    });
    this.modalListWorkflow.hide();
    this.SaveSuccess.emit(this.selectedWorkflows);
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  showSearchJob(): void {
    this.loadWorkflows();
    this.modalListWorkflow.show();
  }
}
