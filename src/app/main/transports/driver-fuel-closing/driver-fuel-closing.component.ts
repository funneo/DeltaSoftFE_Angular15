import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDriverFuelClosingComponent } from '@app/shared/components/transports/modal-driver-fuel-closing/modal-driver-fuel-closing.component';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { FuelClosing } from '@app/shared/models/transports/fuel-closing.model';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { FuelClosingService } from '@app/shared/services/transports/fuel-closing.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'driver-fuel-closing',
  templateUrl: './driver-fuel-closing.component.html',
  styleUrls: ['./driver-fuel-closing.component.css']
})
export class DriverFuelClosingComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  keyword = '';
  flagEdit:boolean=false;

  listEmployee: Employee[]=[];
  listDriverFuelClosing: FuelClosing[]=[];
  userLoged?:Profile;
  driverId:number=0;
  busy: Subscription;
  viewModal = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalDriverFuelClosingComponent, { static: false }) modalAddEdit: ModalDriverFuelClosingComponent
  
  constructor(
    private fuelClosingService:FuelClosingService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private employeeService:EmployeeService
    ,private _utilityService:UtilityService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    //this.loadCustomer();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadEmployee();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('gassiteid',"0")
      .set('driverid',this.driverId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('type','1')
     // .set('usergroupid')
      this.busy = this.fuelClosingService.getPaging(params).subscribe((res: ResponseValue<Pagination<FuelClosing>>) => {
        if (res.code == '200' || res.code == '201') {        
          this.listDriverFuelClosing = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listDriverFuelClosing =[];
            this.totalRows  = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  loadEmployee(): void {
    const params = new HttpParams()
    .set('branchId',this.userLoged.branchId)
      this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listEmployee = res.data;
        }
        else {
          if(res.code=='204'){
            this.listEmployee =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }


  clickRow(item: FuelClosing): void {
    item.checked = !item.checked;
    this.listDriverFuelClosing.forEach(it=>{
      if(it!=item)it.checked=false;
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
      this.modalAddEdit.add(Number.parseInt(this.userLoged.branchId));
    }, 50);
  }

  edit(flag:boolean): void {
    const index = this.listDriverFuelClosing.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listDriverFuelClosing[index].refNo);
    }, 50);
  }

  icheck() {
    let checks = this.listDriverFuelClosing.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagEdit = true;
    }
    else {
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
