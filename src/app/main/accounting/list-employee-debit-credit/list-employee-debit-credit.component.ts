import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalAdvanceComponent } from '@app/shared/components/advance-payment/modal-advance/modal-advance.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Employee, EmployeeDebit, Pagination, ResponseValue } from '@app/shared/models';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { EmployeeDebitService } from '@app/shared/services/employee-debit.service';
import { ExportService } from '@app/shared/services/export-excel.service';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-employee-debit-credit',
  templateUrl: './list-employee-debit-credit.component.html',
  styleUrls: ['./list-employee-debit-credit.component.css']
})
export class ListEmployeeDebitCreditComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDatas: EmployeeDebit[];
  listFilter:EmployeeDebit[]=[];
  busy: Subscription;
  viewModal = false;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId:number=0;
  _quyen:number;
  _viewAll=-1;
  _functionId=SystemContstants.EMPLOYEEDEBIT;
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  search1: string='';
  search2: string='';
  search3: string='';
  search4: string='';
  search5: string='';
  search6: string='';

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  constructor(private employeeDebitService: EmployeeDebitService, private exportService:ExportService, private notificationService: NotificationService, private _utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,private spinner: NgxSpinnerService,public datepipe: DatePipe, private authService: AuthService, private employeeService: EmployeeService,private router:Router) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=Number.parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {

    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadDataDetail();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadDataDetail();
  }

  loadEmployee() {
    // const params = new HttpParams()
    // .set('branchId', this._branchId.toString());
    this.employeeService.getDetail(this._employeeId.toString()).subscribe((res: ResponseValue<Employee>) => {
      this.listEmployee=[];
      this.listEmployee.push(res.data);
    });
  }

  changedEmployee(event:any):void{
    this.loadDataDetail();
  }

  loadDataDetail(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId', '0')
      .set('branchId', this._branchId.toString());
    this.busy = this.employeeDebitService.getDetail(params).subscribe((res: ResponseValue<Pagination<EmployeeDebit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDatas=res.data.items;
        this.filter();
        this.spinner.hide();
      }
      else if (res.code=='204'){
        this.listDatas=[];
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        this.spinner.hide();
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
  filter(){
    this.listFilter = Object.assign([], this.listDatas);

    if(this.search1?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.employeeName.toString().toLowerCase().includes(this.search1.trim().toLocaleLowerCase());
      });
    if(this.search2?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.refNo?.toLowerCase().includes(this.search2.trim().toLocaleLowerCase());
    });
    if(this.search4?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debit?.toString().toLowerCase().includes(this.search4.trim().toLocaleLowerCase());
    });

    if(this.search3?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.updatedDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.search3.trim().toLocaleLowerCase());
    });


    if(this.search5?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.credit?.toString().toLowerCase().includes(this.search5.trim().toLocaleLowerCase());
    });
    if(this.search6?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitBalance?.toString().toLowerCase().includes(this.search6.trim().toLocaleLowerCase());
    });
    this.totalRows=this.listFilter.length;
  }

  @ViewChild(ModalAdvanceComponent, { static: false }) modalTamUng: ModalAdvanceComponent;
  showModal(item: EmployeeDebit) {
    this.viewModal = true;
    if (item.type == 'TAM_UNG') {
      setTimeout(() => {
        this.modalTamUng.edit(item.tableId.toString(), true);
      }, 50);
    }
    else if (item.type == 'THANH_TOAN') {
      let _id=item.tableId;
      if(_id!=null)
        this.router.navigateByUrl('/main/advance-payment/payment/detail/' + _id.toString() + '/' + 'true');
     }
     else{
       alert('Không tìm thấy dữ liệu phù hợp!');
     }
  }

  closeModal(): void {
    this.viewModal = false;
  }

  exportExcel():void{
    // if(this._employeeId==null || this._employeeId.toString()==''){
    //   return;
    // }
    // let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    // let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    // const params = new HttpParams()
    //   .set('pageIndex', this.pageIndex.toString())
    //   .set('pageSize', this.pageSize.toString())
    //   .set('fromDate', tuNgay)
    //   .set('toDate', denNgay)
    //   .set('employeeId', this._employeeId?.toString())
    //   .set('branchId', this._branchId.toString());
    // this.busy = this.employeeDebitService.exportExcel(params).subscribe((res: ResponseValue<Pagination<EmployeeDebit>>) => {
    //   if (res.code == '200' || res.code == '201') {
    //     var a = document.createElement("a");
    //     a.href = environment.apiUrl  + res.data;
    //     a.download;
    //     a.click();
    //   }
    //   else {
    //     this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
    //   }
    // });
    let printList= this.listFilter.map(({ id,branchId,updatedBy,totalRows,employeeId,hanMucTong,hanMucCon,debtInventoryId,tableId, ...item }) => item);
     this.exportService.exportExcel(printList, 'chi-tiet-du-no-nhan-vien');
  }

}
