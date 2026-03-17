import { WorkflowReportBc01 } from './../../../shared/models/workflows/report-bc01.model';
import { Component, OnInit } from '@angular/core';
import { AuthService, BranchService, NotificationService, UtilityService, WorkflowsService } from '@app/shared/services';
import { Subscription } from 'rxjs';
import { Branch, Customer, Pagination, Profile, ResponseValue } from '@app/shared/models';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';
import { MessageContstants } from '@app/shared/constants';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ExportService } from '@app/shared/services/export-excel.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-workflow-report-bc01',
  templateUrl: './workflow-report-bc01.component.html',
  styleUrls: ['./workflow-report-bc01.component.css']
})
export class WorkflowReportBc01Component implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  keyword = '';
  listData: WorkflowReportBc01[];
  listCustomer: Customer[];
  listBranch:Branch[]=[];
  branchId?:number;
  userLoged?: Profile;
  busy: Subscription;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  constructor(private workflowService: WorkflowsService,private spinner: NgxSpinnerService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    , private _authService: AuthService
    , private branchService:BranchService,private exportService:ExportService
  ) { }


  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch();
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
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
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this.branchId?this.branchId.toString():'0')
      .set('handlinggroupid', '0')
      .set('keyword',this.keyword)
    this.busy = this.workflowService.report01(params).subscribe((res: ResponseValue<Pagination<WorkflowReportBc01>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.spinner.hide();
      }
      else {
        if (res.code == '204') {
          this.listData = [];
          this.totalRows = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        this.spinner.hide();
      }
    });
  }
  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '999999')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this.branchId?this.branchId.toString():'0')
      .set('handlinggroupid', '0')
      .set('keyword',this.keyword)
    this.busy = this.workflowService.report01(params).subscribe((res: ResponseValue<Pagination<WorkflowReportBc01>>) => {
      if (res.code == '200' || res.code == '201') {
        let listExport = res.data?.items;
        this.exportService.exportExcel(listExport, 'baocaocongviec01');
      }
      else {
        if (res.code == '204') {
          this.notificationService.printErrorMessage(MessageContstants.EMPTY_VALUE)
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
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
