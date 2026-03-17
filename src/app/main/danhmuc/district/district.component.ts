import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDistrictComponent } from '@app/shared/components/danhmuc/modal-district/modal-district.component';
import { MessageContstants } from '@app/shared/constants';
import { District, Pagination, Province, ResponseValue } from '@app/shared/models';
import { NotificationService } from '@app/shared/services';
import { DistrictService } from '@app/shared/services/district.service';
import { ProvinceService } from '@app/shared/services/province.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.css']
})
export class DistrictComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDistrict: District[];
  listProvince:Province[];
  provinceCode?:string;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalDistrictComponent, { static: false }) modalAddEdit: ModalDistrictComponent
  
  constructor(
    private districtServices:DistrictService, private notificationService: NotificationService
,private provinceService:ProvinceService
  ) { }

  
  ngOnInit(): void {
    this.loadProvince();
    this.loadData();
  }

  loadProvince():void{
    const params = new HttpParams()
    this.busy = this.provinceService.getAll(params).subscribe((res: ResponseValue<Province[]>) => {
      console.log(res);
      if (res.code == '200' || res.code == '201') {
        this.listProvince = res.data   
      }
      else {
        if(res.code == '204')
        {
          this.listProvince=[];
        }
        else
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.districtServices.getPaging(params).subscribe((res: ResponseValue<Pagination<District>>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listDistrict = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listDistrict=[];
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


  clickRow(item: District): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  changedprovinceCode(event:Province):void{
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('provinceCode',this.provinceCode)
      .set('keyword', this.keyword)
      this.busy = this.districtServices.getPaging(params).subscribe((res: ResponseValue<Pagination<District>>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listDistrict = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listDistrict=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listDistrict.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listDistrict[index].provinceCode.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDistrict.filter(x => x.checked);
    let checks: string[] = [];
    for (let items of listChecks) {
      checks.push(items.provinceCode)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.districtServices.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listDistrict.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listDistrict)
      return this.listDistrict.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listDistrict.filter(x => x.checked);
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
