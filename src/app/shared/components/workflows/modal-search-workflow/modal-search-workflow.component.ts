import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ResponseValue, Workflow } from '@app/shared/models';
import { WorkflowSearchDispatchOrder } from '@app/shared/models/workflows/workflow-search-dispatch-order.model';
import { WorkflowsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-search-workflow',
  templateUrl: './modal-search-workflow.component.html',
  styleUrls: ['./modal-search-workflow.component.css']
})
export class ModalSearchWorkflowComponent implements OnInit {

  public busy: Subscription;
  public listWorkflows:WorkflowSearchDispatchOrder[]=[];
  public filteredWorkflows:WorkflowSearchDispatchOrder[];
  public _branchId?:number;
  filterColumns: { [key: string]: string } = {};
  IdSearch:String=''
  jobIdSearch:String='';
  sortKey: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  selectedWorkflows:WorkflowSearchDispatchOrder={};
  isSelected=false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @Input() branchId : number;

  @ViewChild('modalListWorkflow', { static: false }) modalListWorkflow: ModalDirective;
  constructor(
    private workflowService:WorkflowsService
  ) { }

  ngOnInit(): void {

  }

  filterData(): void {
    this.filteredWorkflows = this.listWorkflows.filter(item => {
      return Object.keys(this.filterColumns).every(key => {
        const filterValue = this.filterColumns[key].toLowerCase();
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  }
  sortData(key: string): void {
    if (this.sortKey === key) {
      // Đảo chiều sắp xếp nếu cùng một cột được nhấp
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Sắp xếp theo cột mới
      this.sortOrder = 'asc';
    }
    this.sortKey = key;
    this.filteredWorkflows.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
    
      if (aValue === null || aValue === '') {
        return 1; // Đặt giá trị null và rỗng cuối cùng
      } else if (bValue === null || bValue === '') {
        return -1;
      }else if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  loadWorkflows() {
    this.workflowService.getSearching(this.branchId).subscribe((res: ResponseValue<WorkflowSearchDispatchOrder[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listWorkflows = res.data;
        this.filterData();
      } else {
        this.listWorkflows =[];
        this.filterData();
      }
    });
  }

  view(branchId:number) {
    this.isSelected=false;
    this.branchId=branchId;
    this.loadWorkflows();
    this.modalListWorkflow.show();
  }

  clickRow(item:WorkflowSearchDispatchOrder){
    if(item!=null){
      for (var i = 0; i < this.listWorkflows.length; i++) {
        this.listWorkflows[i].checked = false;
    }
      item.checked=true
      this.isSelected=true;
      this.selectedWorkflows=item;
      this.jobIdSearch=item.jobId;
      this.IdSearch=item.id.toString();
    }
  }

  saveChange() {
    if(this.selectedWorkflows.jobId.length>0){
      this.modalListWorkflow.hide();
        this.SaveSuccess.emit(this.selectedWorkflows);
    }
  }

  OnHidden() {
      this.CloseModal.emit();
  }

  showSearchJob():void{
    this.branchId=this._branchId;
    this.loadWorkflows();
    this.modalListWorkflow.show();
  }

  onSelect(item: WorkflowSearchDispatchOrder):void{
    this.modalListWorkflow.hide();
    this.SaveSuccess.emit(item);
  }
}
