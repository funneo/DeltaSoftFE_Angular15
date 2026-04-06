import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue } from '@app/shared/models';
import { Tolllocations } from '@app/shared/models/tolllocations.model';
import { NotificationService } from '@app/shared/services';
import { TollLocationsService } from '@app/shared/services/toll-locations.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tolllocations',
  templateUrl: './tolllocations.component.html',
  styleUrls: ['./tolllocations.component.css']
})
export class TolllocationsComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listTollLocation:Tolllocations[];
  busy: Subscription;
  constructor(
    private tollLocationService:TollLocationsService
    ,private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.tollLocationService.getPaging(params).subscribe((res: ResponseValue<Pagination<Tolllocations>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listTollLocation = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listTollLocation=[];
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

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  get(){
    
  }

}
