import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Branch, EmployeeLimit, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { DriverFuelLimit } from '@app/shared/models/transports/driver-fuel-limit.model';
import { AuthService, BranchService, NotificationService } from '@app/shared/services';
import { DriverFuelLimitService } from '@app/shared/services/transports/driver-fuel-limit.service';
import { ModalDriverFuelLimitComponent } from '@app/shared/components/transports/modal-driver-fuel-limit/modal-driver-fuel-limit.component';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driver-fuel-limit',
  templateUrl: './driver-fuel-limit.component.html',
  styleUrls: ['./driver-fuel-limit.component.css']
})
export class DriverFuelLimitComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDriverFuelLimit: DriverFuelLimit[]=[];
  listBranch:Branch[];
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  adminPermission=false;
  userLoged?:Profile;
  @ViewChild(ModalDriverFuelLimitComponent, { static: false }) modalAddEdit: ModalDriverFuelLimitComponent
  constructor(
    private driverFuelLimitService: DriverFuelLimitService,
    private notificationService: NotificationService,
    private branchService: BranchService,private authService: AuthService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    }

  ngOnInit(): void {
    this.userLoged=this.authService.getLoggedInUser();
    this._branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch(event: Branch) {
    this._branchId = event?.id;
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString())
      .set('driverId', '0');
    this.busy = this.driverFuelLimitService.getPaging(params).subscribe((res: ResponseValue<Pagination<DriverFuelLimit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDriverFuelLimit = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: DriverFuelLimit): void {
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

  deleteConfirm(): void {
    let listChecks = this.listDriverFuelLimit.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.driverFuelLimitService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listDriverFuelLimit.filter(x => x.checked);
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

  showModal(item:DriverFuelLimit) {
    this.viewModal = true;
    if(item.id){
      setTimeout(() => {
        this.modalAddEdit.edit(item.id, false);
      }, 50);
    }
    else{
      setTimeout(() => {
        this.modalAddEdit.add({id:item.employeeId,branchId: this._branchId});
      }, 50);
    }

  }

  closeModal(): void {
    this.viewModal = false;
  }
}
