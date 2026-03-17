import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Employee, Pagination, ResponseValue } from '@app/shared/models';
import { DriverFuelDebit } from '@app/shared/models/transports/driver-fuel-debit.model';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { DriverFuelDebitService } from '@app/shared/services/transports/driver-fuel-debit.service';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'driver-fuel-debit-credit-detailed',
  templateUrl: './driver-fuel-debit-credit-detailed.component.html',
  styleUrls: ['./driver-fuel-debit-credit-detailed.component.css']
})
export class DriverFuelDebitCreditDetailedComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDatas: DriverFuelDebit[];
  busy: Subscription;
  viewModal = false;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId:number;
  _quyen:number;
  _viewAll=2;
  _functionId=SystemContstants.DRIVERFUELDEBIT;
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  constructor(private employeeDebitService: DriverFuelDebitService, private notificationService: NotificationService, private _utilityService: UtilityService,
    private activatedRoute: ActivatedRoute, private authService: AuthService
    ,private driverfuelService:DriverFuelDebitService
    , private employeeService: EmployeeService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=Number.parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    let list: any[] =UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i=list?.findIndex(x=>x.id==this._functionId);
    if(i!=-1){
      this._viewAll=list[i].value;
    }

    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this._employeeId = +this.activatedRoute.snapshot.params["id"];

    this.listDatas=[];
    this.loadEmployee();
    this.loadDataDetail();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadDataDetail();
  }

  loadEmployee() {
    const params = new HttpParams()
    .set('branchId', this._branchId.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event:any):void{
    this.loadDataDetail();
  }

  loadDataDetail(): void {
    if(this._employeeId==null || this._employeeId.toString()==''){
      return;
    }
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.driverfuelService.getDetail(params).subscribe((res: ResponseValue<Pagination<DriverFuelDebit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDatas=[];
        let item:DriverFuelDebit={};
        if(res.data?.items?.length>0){
          item={refNo:'Đầu kỳ',debitBalance:res.data?.items[0].debitBalance+res.data?.items[0].credit-res.data?.items[0].debit}
          this.listDatas.push(item)
         }
        res.data?.items?.forEach(x=>{
          this.listDatas.push(x);
          item=x;
        });
        this.listDatas.push({refNo:'Cuối kỳ',debitBalance:item.debitBalance});
        this.totalRows = res.data?.totalRows;
        this.listDatas=[...this.listDatas];
      }
      else if (res.code=='204'){
        this.listDatas=[];
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadDataDetail();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;

    this.loadDataDetail();
  }


  exportExcel():void{
    if(this._employeeId==null || this._employeeId.toString()==''){
      return;
    }
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', this._employeeId?.toString())
      .set('branchId', this._branchId.toString());
    this.busy = this.employeeDebitService.exportExcel(params).subscribe((res: ResponseValue<Pagination<DriverFuelDebit>>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl  + res.data;
        a.download;
        a.click();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

}
