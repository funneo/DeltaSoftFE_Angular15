import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalLocationComponent } from '@app/shared/components/danhmuc/modal-location/modal-location.component';
import { MessageContstants } from '@app/shared/constants';
import { District, Locations, Pagination, Province, ResponseValue } from '@app/shared/models';
import { NotificationService } from '@app/shared/services';
import { DistrictService } from '@app/shared/services/district.service';
import { LocationService } from '@app/shared/services/location.service';
import { ProvinceService } from '@app/shared/services/province.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listLocation: Locations[];
  listProvince:Province[];
  listDistrict:District[];
  provinceCode?:string;
  districtCode?:string;
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalLocationComponent, { static: false }) modalAddEdit: ModalLocationComponent
  
  constructor(
    private locationService:LocationService, private notificationService: NotificationService
    ,private provinceService:ProvinceService,private districtService:DistrictService
  ) { }

  ngOnInit(): void {
    this.loadProvince();
    this.loadData();
  }

  loadProvince(): void{
    const params = new HttpParams()
      this.busy = this.provinceService.getAll(params).subscribe((res: ResponseValue<Province[]>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listProvince = res.data
        }
      });
  }
  loadDistrict():void{
    this.busy = this.districtService.getbyProvinceCode(this.provinceCode).subscribe((res: ResponseValue<District[]>) => {
      console.log(res);
      if (res.code == '200' || res.code == '201') {
        this.listDistrict = res.data
      }
    });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('provinceCode',this.provinceCode)
      .set('districtCode',this.districtCode)
      this.busy = this.locationService.getPaging(params).subscribe((res: ResponseValue<Pagination<Locations>>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listLocation = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listLocation=[];
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

  changedProvince(event:Province){
    this.provinceCode=event?.provinceCode;
    this.loadDistrict();
    this.loadData();
  }
  changedDistrict(event:District){
    this.districtCode=event?.districtCode;
    this.loadData();
  }

  clickRow(item: Locations): void {
    item.checked = !item.checked;
    this.listLocation.forEach(it=>{
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
    const index = this.listLocation.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listLocation[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listLocation.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.locationService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listLocation.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listLocation)
      return this.listLocation.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listLocation.filter(x => x.checked);
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
