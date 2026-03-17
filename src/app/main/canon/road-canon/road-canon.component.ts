import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalRoadCanonComponent } from '@app/shared/components/canon/modal-road-canon/modal-road-canon.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { CanonRoad, Customer, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, CanonRoadService, CustomerService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-road-canon',
  templateUrl: './road-canon.component.html',
  styleUrls: ['./road-canon.component.css']
})
export class RoadCanonComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listCanonRoad: CanonRoad[];
  busy: Subscription;
  viewModal = false;
  customerId:number;
  listCustomer:Customer[];
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalRoadCanonComponent, { static: false }) modalAddEdit: ModalRoadCanonComponent
  constructor(private canonRoadService: CanonRoadService,private customerService:CustomerService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadCustomer();
    this.loadData();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event:Customer){
    this.customerId=event?.id;
    this.timKiem();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('customerId', this.customerId?.toString())
      .set('keyword', this.keyword)
      this.busy = this.canonRoadService.getPaging(params).subscribe((res: ResponseValue<Pagination<CanonRoad>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listCanonRoad = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: CanonRoad): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(item:CanonRoad=null, flag: boolean=true): void {
    let id=item?.id;
    if(!id){
      const index = this.listCanonRoad.findIndex(x => x.checked);
      id=this.listCanonRoad[index]?.id;
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listCanonRoad.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.canonRoadService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listCanonRoad.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listCanonRoad)
      return this.listCanonRoad.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listCanonRoad.filter(x => x.checked);
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
