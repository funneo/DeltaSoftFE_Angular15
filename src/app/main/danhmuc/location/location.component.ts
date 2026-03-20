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
  listFilter: Locations[];
  filterColumns: any = {
    locationCode: '',
    locationName: '',
    locationAddress: '',
    area: '',
    provinceName: '',
    districtName: ''
  };
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalLocationComponent, { static: false }) modalAddEdit: ModalLocationComponent
  
  constructor(
    private locationService:LocationService, private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }
  loadData(): void {
    const params = new HttpParams()
      .set('keyword', this.keyword || '');

    this.busy = this.locationService.getAll(params).subscribe((res: ResponseValue<Locations[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listLocation = res.data || [];
        this.filterData();
      }
      else {
        if (res.code == '204') {
          this.listLocation = [];
          this.listFilter = [];
          this.totalRows = 0;
        }
        else
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  filterData(): void {
    this.listFilter = this.listLocation.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        const filterValue = (this.filterColumns[key] || '').toString().toLowerCase();
        const itemValue = (item[key] || '').toString().toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
    this.totalRows = this.listFilter.length;
  }
  clickRow(item: Locations): void {
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
      this.modalAddEdit.edit(this.listFilter[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listFilter.filter(x => x.checked);
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
