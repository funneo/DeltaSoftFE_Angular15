import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTollstationComponent } from '@app/shared/components/danhmuc/modal-tollstation/modal-tollstation.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue } from '@app/shared/models';
import { TollStation } from '@app/shared/models/toll-station.model';
import { NotificationService } from '@app/shared/services';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tollstation',
  templateUrl: './tollstation.component.html',
  styleUrls: ['./tollstation.component.css']
})
export class TollstationComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listTollStation:TollStation[];
  busy: Subscription;
  viewModal = false;
  @ViewChild(ModalTollstationComponent, { static: false }) modalAddEdit: ModalTollstationComponent
  
  constructor(
     private notificationService: NotificationService
    ,private tollStationService:TollStationService
  ) { }

  ngOnInit(): void {
    
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.tollStationService.getPaging(params).subscribe((res: ResponseValue<Pagination<TollStation>>) => {
        if (res.code == '200' || res.code == '201') {
          console.log(res);
          
          this.listTollStation = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listTollStation=[];
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

  clickRow(item: TollStation): void {
    item.checked = !item.checked;
    this.listTollStation.forEach(it=>{
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
    const index = this.listTollStation.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listTollStation[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listTollStation.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.tollStationService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listTollStation.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listTollStation)
      return this.listTollStation.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listTollStation.filter(x => x.checked);
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
