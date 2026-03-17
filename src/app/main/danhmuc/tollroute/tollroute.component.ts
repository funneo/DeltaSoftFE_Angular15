import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTollrouteComponent } from '@app/shared/components/danhmuc/modal-tollroute/modal-tollroute.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue } from '@app/shared/models';
import { Tollroute } from '@app/shared/models/tollroute.model';
import { NotificationService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { TollrouteService } from '@app/shared/services/tollroute.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tollroute',
  templateUrl: './tollroute.component.html',
  styleUrls: ['./tollroute.component.css']
})
export class TollrouteComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listTollRoute:Tollroute[];
  busy: Subscription;
  viewModal = false;
  @ViewChild(ModalTollrouteComponent, { static: false }) modalAddEdit: ModalTollrouteComponent

  constructor(
     private notificationService: NotificationService
    ,private tollRouteService:TollrouteService, private _export:ExportService
  ) { }

  ngOnInit(): void {

    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.tollRouteService.getPaging(params).subscribe((res: ResponseValue<Pagination<Tollroute>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listTollRoute = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listTollRoute=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  export(): void {
    const params = new HttpParams()
      .set('pageIndex', "1")
      .set('pageSize', "99999")
      .set('keyword', '')
      this.busy = this.tollRouteService.getPaging(params).subscribe((res: ResponseValue<Pagination<Tollroute>>) => {
        if (res.code == '200' || res.code == '201') {
          let list = res.data?.items
          let printList=list.map(({id,branchId, ...item }) => item);
          this._export.exportExcel(printList,'cung-duong-tinh-phi');
        }
        else { 
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  clickRow(item: Tollroute): void {
    item.checked = !item.checked;
    this.listTollRoute.forEach(it=>{
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
    const index = this.listTollRoute.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listTollRoute[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listTollRoute.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.tollRouteService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  isAllChecked() {
    if (this.listTollRoute)
      return this.listTollRoute.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listTollRoute.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
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
