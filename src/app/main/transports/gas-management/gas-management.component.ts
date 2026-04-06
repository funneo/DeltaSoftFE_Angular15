import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalGasManagementComponent } from '@app/shared/components/transports/modal-gas-management/modal-gas-management.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { GasManagement } from '@app/shared/models/transports/gas-management.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { GasManagementService } from '@app/shared/services/transports/gas-management.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gas-management',
  templateUrl: './gas-management.component.html',
  styleUrls: ['./gas-management.component.css']
})
export class GasManagementComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listGasManagement: GasManagement[]=[];
  listBranch:Branch[]=[];
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  branchId?:number;
  adminPermission=false;

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalGasManagementComponent, { static: false }) modalAddEdit: ModalGasManagementComponent

  constructor(
    private _utilityService: UtilityService,
    private gasManagementService:GasManagementService,
    private notificationService: NotificationService, private _authService:AuthService,
    private branchService:BranchService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    //this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }
  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword',this.keyword)
      .set('branchid',this.branchId.toString())
     // .set('usergroupid')
      this.busy = this.gasManagementService.getPaging(params).subscribe((res: ResponseValue<Pagination<GasManagement>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listGasManagement = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listGasManagement =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }


  clickRow(item: GasManagement): void {
    item.checked = !item.checked;
    this.listGasManagement.forEach(it=>{
      if(it.id!=item.id)it.checked=false;
    })
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

  edit(flag:boolean): void {
    const index = this.listGasManagement.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listGasManagement[index].id, flag);
    }, 50);
  }


  icheck() {
    let checks = this.listGasManagement.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagEdit = true;
    }
    else {
      this.flagEdit = false;
      this.flagDelete=false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
