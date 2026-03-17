import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { Report01 } from '@app/shared/models/transports/report01.model';
import { AuthService, BranchService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dispatch-order-report01',
  templateUrl: './dispatch-order-report01.component.html',
  styleUrls: ['./dispatch-order-report01.component.css']
})
export class DispatchOrderReport01Component implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listReport: Report01[];
  listBranch:Branch[];
  listDriver:Employee[]=[];

  //Biến kiểm tra quyền thu chi để thêm chi phí cung đường cho lệnh
  account_permission:boolean=false;
  userLoged?:Profile;
  branchId?:number;
  driverId?:number;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  constructor(private dispatchOrderService: DispatchordersService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    ,private _authService:AuthService
    ,private branchService:BranchService
    , private exportService:ExportService
    ,private employeeService:EmployeeService
    ,private spinner: NgxSpinnerService
    ) { }


  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    const permiss: string[] = typeof(this.userLoged.permissions) == "string"? JSON.parse(this.userLoged.permissions): this.userLoged.permissions;
    this.account_permission= permiss.findIndex(x => x === 'DISPATCHORDER_ACCOUNT') != -1;
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    //this.loadCustomer();
    this.loadData();
    this.loadBranch();
    this.loadDriver();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  loadDriver() {
    const params = new HttpParams()
      .set('branchId', this.branchId.toString())
    this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listDriver = res.data;
    });
  }
  
  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '99999')
      .set('branchid',this.branchId?.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('driverid',this.driverId!=null? this.driverId.toString():'0')
     // .set('usergroupid')
     this.busy = this.dispatchOrderService.getReport01(params).subscribe((res: ResponseValue<Pagination<Report01>>) => {
      if (res.code == '200' || res.code == '201') {
        let exelList=res.data?.items;
        //let printList= exelList.map(({ ...item }) => item);
        this.exportService.exportExcel(exelList, 'tongketthanhtoan');
      }
      else {
        if(res.code=='204'){
          this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE)
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      }
    });
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
      .set('branchid',this.branchId?.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('driverid',this.driverId!=null? this.driverId.toString():'0')
      this.spinner.show();
     // .set('usergroupid')
      this.busy = this.dispatchOrderService.getReport01(params).subscribe((res: ResponseValue<Pagination<Report01>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listReport = res.data?.items;
          this.totalRows = res.data?.totalRows;
          this.spinner.hide();
        }
        else {
          if(res.code=='204'){
            this.listReport =[];
            this.totalRows = 0;
            this.spinner.hide();
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
            this.spinner.hide();
          }
        }
      });
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }
  changedDriver(event:Employee){
    this.driverId=event?.id;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

}
