import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalVehicleInspectionPermissionComponent } from '@app/shared/components/garage/modal-vehicle-inspection-permission/modal-vehicle-inspection-permission.component';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { VehicleInspectionPermission } from '@app/shared/models/garage/vehicle-inspection-permission.model';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { VehicleInspectionPermissionService } from '@app/shared/services/garage/vehicle-inspection-permission.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-inspection-permission',
  templateUrl: './vehicle-inspection-permission.component.html',
  styleUrls: ['./vehicle-inspection-permission.component.css']
})
export class VehicleInspectionPermissionComponent implements OnInit {
  keyword = '';
  listData: VehicleInspectionPermission[]=[];
  listFilter:VehicleInspectionPermission[]=[];
  listEmployee:Employee[]=[];
  userLoged?:Profile;
  vehicleId?:number=0;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  branchId?:number;
  tenSearch='';
  bksSearch='';
  loginNameSearch='';
  totalRows=0;
  _userId?:string;
  @ViewChild(ModalVehicleInspectionPermissionComponent, { static: false }) modalAddEdit: ModalVehicleInspectionPermissionComponent

  constructor(
    private _services:VehicleInspectionPermissionService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private _utilityService:UtilityService,private userService:EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.adminPermission=this.userLoged.isAdmin
    this.loadData();
    this.loadEmployee();
  }

  selectedDate(event) {
    this.loadData();
  }

  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.tenSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.userFullName.toString().toLowerCase().includes(this.tenSearch.trim().toLocaleLowerCase());
      });
    if(this.bksSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.licensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });
  }

  loadEmployee(){
    const params = new HttpParams()
    .set('branchid',this.userLoged.branchId.toString());
        this.busy = this.userService.getbyUser(params).subscribe((res: ResponseValue<Employee[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listEmployee = res.data
          }
        });
  }
  changedEmployee(event:Employee){
    this._userId=event?.userId;
    this.loadData();
  }
  
  loadData(): void {
    let item:VehicleInspectionPermission={userId:this._userId};
     // .set('usergroupid')
      this.busy = this._services.get(item).subscribe((res: ResponseValue<VehicleInspectionPermission[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data;
          this.totalRows=this.listData.length;
          this.filter();
        }
        else {
          if(res.code=='204'){
            this.listData =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  confirmDelete(event:VehicleInspectionPermission){
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.deletePermision(event));
  }

  deletePermision(item:VehicleInspectionPermission){

    this.busy = this._services.delete(item.id).subscribe((res: ResponseValue<VehicleInspectionPermission[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
        this.loadData();
      }
      else {
        if(res.code=='204'){
          this.listData =[];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
  }
  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }
 
  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
}
