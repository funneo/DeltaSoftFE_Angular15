import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { AuthService, UtilityService } from '@app/shared/services';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-list-shipping-task',
  templateUrl: './modal-list-shipping-task.component.html',
  styleUrls: ['./modal-list-shipping-task.component.css']
})
export class ModalListShippingTaskComponent implements OnInit {
  public busy: Subscription;
  public listWorkflows:ShippingTask[]=[];
  public filteredWorkflows:ShippingTask[]=[];
  public _branchId?:number;
  filterColumns: { [key: string]: string } = {};
  IdSearch:String=''
  jobIdSearch:String='';
  sortKey: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  selectedWorkflows:ShippingTask[]=[];
  isSelected=false;
  public ngayBatDau: Date = new Date();
  public dateOptions = this._utilityService.dateTimeOptionDays(this.ngayBatDau,false);
  selecteDate: string = moment(new Date()).format('DD/MM/YYYY');
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  branchId : number;
  userLoged:Profile;
  @ViewChild('modalListWorkflow', { static: false }) modalListWorkflow: ModalDirective;
  constructor(
    private service:ShippingTaskService, private _utilityService: UtilityService,
    private _authService:AuthService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
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
    selectedDate(event) {
      this.ngayBatDau = new Date(event.start);
      this.selecteDate= moment(this.ngayBatDau).format('DD/MM/YYYY');
      this.loadData();
    }

    loadData(): void {
        let tuNgay = moment(this.selecteDate,FormatContstants.DATEVN).format('YYYYMMDD');
        const params = new HttpParams()
          .set('fromDate', tuNgay)
          .set('branchId', this.branchId?this.branchId.toString():'0')
        this.busy = this.service.getBySearch(params).subscribe((res: ResponseValue<ShippingTask[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listWorkflows = res.data;  
            this.filterData();
          }
          else {
            this.listWorkflows=[]
            this.filterData();
          }
        });
      } 
    

  view() {
    this.loadData();
    this.modalListWorkflow.show();
  }

  clickRow(item:ShippingTask){
    item.checked = !item.checked;
    this.isSelected = this.listWorkflows.some(it=>it.checked);
  }


  saveChange() {
    this.selectedWorkflows=this.listWorkflows.filter(it=>it.checked);
    if(this.selectedWorkflows.length>0){
      this.modalListWorkflow.hide();
      this.SaveSuccess.emit(this.selectedWorkflows);
    }
  }

  OnHidden() {
      this.CloseModal.emit();
  }

  showSearchJob():void{
    this.loadData();
    this.modalListWorkflow.show();
  }

}
