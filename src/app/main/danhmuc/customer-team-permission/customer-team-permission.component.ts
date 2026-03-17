import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomerComponent } from '@app/shared/components/danhmuc/modal-customer/modal-customer.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Customer, Profile, ResponseValue, Pagination, OtherCategories } from '@app/shared/models';
import { BranchService, NotificationService, CustomerService, AuthService, OtherCategoriesService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-team-permission',
  templateUrl: './customer-team-permission.component.html',
  styleUrls: ['./customer-team-permission.component.css']
})
export class CustomerTeamPermissionComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listBranch: Branch[];
  listCustomer: Customer[];
  listLocked: Customer[];
  busy: Subscription;
  viewModal = false;
  flagLinkEdit: boolean = false;
  _accept: boolean = false;
  user: Profile;
  listTeam:OtherCategories[];
  constructor(private branchService: BranchService, private notificationService: NotificationService, private customerService: CustomerService,
    private authService: AuthService,private _export:ExportService,private otherService:OtherCategoriesService) {
    this.user = this.authService.getLoggedInUser();
    // this._branchId = Number.parseInt(user.branchId);
    this._accept = this.authService.hasPermission('CUSTOMER_ACCEPT');
  }

  ngOnInit(): void {
    this.loadData();
    this.loadTeam();
  }
  loadTeam(){
    const params = new HttpParams()
    .set('type','TEAM')
      this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listTeam = res.data
        }
      });
  }
  
  updateteamId(event:Customer){
  this.busy = this.customerService.updateTeamId(event).subscribe((res: ResponseValue<Customer>) => {
    (res);
    if (res.code == '200' || res.code == '201') {
      this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG)
    }
    else {
      this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
    }
  });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchid', this.user.branchId)
      .set('locked', '0')
    this.busy = this.customerService.getPaging(params).subscribe((res: ResponseValue<Pagination<Customer>>) => {
      (res);
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }


  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

}
