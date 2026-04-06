import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTransitPortsComponent } from '@app/shared/components/danhmuc/modal-transit-ports/modal-transit-ports.component';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue, Pagination } from '@app/shared/models';
import { TransitPorts } from '@app/shared/models/danhmuc/transit-ports';
import { NotificationService } from '@app/shared/services';
import { TransitPortsService } from '@app/shared/services/danhmuc/transit-ports.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transit-ports',
  templateUrl: './transit-ports.component.html',
  styleUrls: ['./transit-ports.component.css']
})
export class TransitPortsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listTransitPorts:TransitPorts[];
  busy: Subscription;
  viewModal = false;
  @ViewChild(ModalTransitPortsComponent, { static: false }) modalAddEdit: ModalTransitPortsComponent
  
  constructor(
     private notificationService: NotificationService
    ,private _service:TransitPortsService
  ) { }

  ngOnInit(): void {
    
    this.loadData();
  }

  listData: TransitPorts[] = [];
  listFilter: TransitPorts[] = [];

  filterColumns: { [key: string]: any } = {
    fromPortsId: '',
    toPortsId: '',
    km: '',
    status: '',
    notes: '',
  };

  dateTimeFields: string[] = ['createdDate', 'approvedDate'];
  array = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Khởi tạo" },
    { value: 2, text: "Chuyển duyệt" },
    { value: 3, text: "Duyệt" },
  ];
  statusSelected = 0;
  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this._service.getPaging(params).subscribe((res: ResponseValue<Pagination<TransitPorts>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items
          this.totalRows = res.data?.totalRows;
          this.filterData();
        }
        else {
          if(res.code == '204')
          {
            this.listTransitPorts=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  filterData(): void {
      this.listFilter = Object.assign([], this.listData);
      if(this.statusSelected>0){
      this.listFilter = this.listFilter.filter((data) => {
        return  this.statusSelected==1? data.status==0:
                this.statusSelected==2? data.status==1:data.status==2 
        })
      }
      this.listFilter = this.listFilter.filter((item) => {
        return Object.keys(this.filterColumns).every((key) => {
          if (!this.filterColumns[key]) return true;
          const filterValue = this.filterColumns[key].toString().toLowerCase();
          const itemValue = (item as any)[key]?.toString().toLowerCase() || '';
          return itemValue.includes(filterValue);
        });
      });
      debugger;
    }

  update(id:number){
      this.viewModal = true;
      setTimeout(() => {
        this.modalAddEdit.edit(id,false);
      }, 50);
    }
    confirmDelete(id:number): void {
      this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(id));
    }


  
    delete(id:number){
      this._service
      .delete(id)
      .subscribe((res: ResponseValue<TransitPorts>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadData();
          this.filterData();
          this.notificationService.printSuccessMessage(
            MessageContstants.DELETED_OK_MSG
          );
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
    }



  clickRow(item: TransitPorts): void {
    item.checked = !item.checked;
    this.listFilter.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listFilter.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listFilter[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listFilter.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }



  checkAll(ev) {
    this.listFilter.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listFilter)
      return this.listFilter.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listFilter.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
