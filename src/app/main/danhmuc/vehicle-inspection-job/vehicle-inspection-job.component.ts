import { BranchService } from './../../../shared/services/branch.service';
import { ModalVehicleInspectionJobComponent } from '@app/shared/components/danhmuc/modal-vehicle-inspection-job/modal-vehicle-inspection-job.component';
import { VehicleInspectionJob } from '@app/shared/models/transports/vehicle-inspection-job.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, NotificationService } from '@app/shared/services';
import { VehicleInspectionJobService } from '@app/shared/services/danhmuc/vehicle-inspection-job.service';
import { HttpParams } from '@angular/common/http';
import { Pagination, ResponseValue, Branch, Profile } from '@app/shared/models';
import { MessageContstants } from '@app/shared/constants';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-vehicle-inspection-job',
  templateUrl: './vehicle-inspection-job.component.html',
  styleUrls: ['./vehicle-inspection-job.component.css']
})
export class VehicleInspectionJobComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData:VehicleInspectionJob[];
  listBranch:Branch[]=[];
  busy: Subscription;
  viewModal = false;
  branchId?:number=0;
  userLoged:Profile;
  adminPermission?:boolean;
  @ViewChild(ModalVehicleInspectionJobComponent, { static: false }) modalAddEdit: ModalVehicleInspectionJobComponent

  constructor(
     private notificationService: NotificationService
    ,private service:VehicleInspectionJobService, private branchService:BranchService
    ,private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
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
      .set('keyword', this.keyword)
      .set('branchid', this.branchId.toString())
      this.busy = this.service.getPaging(params).subscribe((res: ResponseValue<Pagination<VehicleInspectionJob>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listData=[];
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

  clickRow(item: VehicleInspectionJob): void {
    item.checked = !item.checked;
    this.listData.forEach(it=>{
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
    const index = this.listData.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter(x => x.checked);
    if(listChecks[0].updateBy!=this.userLoged.id)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }


  icheck() {
    let checks = this.listData.filter(x => x.checked);
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

  closeModal(): void {
    this.viewModal = false;
  }
}
