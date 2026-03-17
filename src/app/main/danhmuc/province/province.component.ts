import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalProvinceComponent } from '@app/shared/components/danhmuc/modal-province/modal-province.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, Province, ResponseValue } from '@app/shared/models';
import { NotificationService } from '@app/shared/services';
import { ProvinceService } from '@app/shared/services/province.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-province',
  templateUrl: './province.component.html',
  styleUrls: ['./province.component.css']
})
export class ProvinceComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listProvince: Province[];
  provinceCode?:string;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalProvinceComponent, { static: false }) modalAddEdit: ModalProvinceComponent
  
  constructor(
    private provinceServices:ProvinceService, private notificationService: NotificationService

  ) { }

  
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.provinceServices.getPaging(params).subscribe((res: ResponseValue<Pagination<Province>>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listProvince = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listProvince=[];
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


  clickRow(item: Province): void {
    item.checked = !item.checked;
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
    const index = this.listProvince.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listProvince[index].provinceCode.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listProvince.filter(x => x.checked);
    let checks: string[] = [];
    for (let items of listChecks) {
      checks.push(items.provinceCode)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.provinceServices.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listProvince.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listProvince)
      return this.listProvince.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listProvince.filter(x => x.checked);
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
