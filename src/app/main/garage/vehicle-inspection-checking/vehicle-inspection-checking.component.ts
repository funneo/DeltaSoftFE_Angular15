import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalVehicleInspectionComponent } from '@app/shared/components/garage/modal-vehicle-inspection/modal-vehicle-inspection.component';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Profile, ResponseValue } from '@app/shared/models';
import { VehicleInspection } from '@app/shared/models/garage/vehicle-inspection.model';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { VehicleInspectionService } from '@app/shared/services/garage/vehicle-inspection.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-inspection-checking',
  templateUrl: './vehicle-inspection-checking.component.html',
  styleUrls: ['./vehicle-inspection-checking.component.css']
})
export class VehicleInspectionCheckingComponent implements OnInit {
  keyword = '';
  listData: VehicleInspection[]=[];
  userLoged?:Profile;
  vehicleId?:number=0;
  busy: Subscription;
  viewModal = false;
  listEmployee:Employee[]=[];
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date()
  );
  _userId?:string;
  public ngayBatDau: string;
  @ViewChild(ModalVehicleInspectionComponent, { static: false }) modalAddEdit: ModalVehicleInspectionComponent

  constructor(
    private _services:VehicleInspectionService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private _utilityService:UtilityService,private userService:EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this._userId=this.userLoged.id;
    this.ngayBatDau=moment(new Date()).format('DD/MM/YYYY'),
    this.loadData();
    this.loadEmployee();
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

  selectedNgaybatdau(event) {
    this.ngayBatDau = moment(event.start).format('DD/MM/YYYY');
    this.loadData();
  }

  closedNgaybatdau(event) {
    if (this.ngayBatDau == null)
      this.ngayBatDau=moment(new Date()).format('DD/MM/YYYY');
  }
  showModal(item: VehicleInspection) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.type, true);
    }, 50);
  }
 
  loadData(): void {
    let tuNgay = this._utilityService.convertDateStringToYMD(this.ngayBatDau);
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('userId', this._userId)
      this.busy = this._services.getChecking(params).subscribe((res: ResponseValue<VehicleInspection[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data;
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

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
}
