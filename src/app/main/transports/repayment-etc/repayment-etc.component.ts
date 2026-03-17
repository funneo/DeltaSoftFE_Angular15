import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDispatchOrderAdditionalFeeComponent } from '@app/shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.component';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';
import { ModalRepaymentEtcComponent } from '@app/shared/components/transports/modal-repayment-etc/modal-repayment-etc.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { DispatchOrderAdditionalFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-additional-fee.model';
import { RepaymentEtcDetail } from '@app/shared/models/transports/repayment-etc-detail.model';
import { RepaymentEtc } from '@app/shared/models/transports/repayment-etc.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { AdditionalFeeService } from '@app/shared/services/transports/additional-fee.service';
import { RepaymentEtcService } from '@app/shared/services/transports/repayment-etc.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-repayment-etc',
  templateUrl: './repayment-etc.component.html',
  styleUrls: ['./repayment-etc.component.css']
})
export class RepaymentEtcComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: RepaymentEtc[]=[];
  listBranch:Branch[]=[];
  branchId:number=0;
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  adminPerrmission=false;
  viewDispatchModal=false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalRepaymentEtcComponent, { static: false }) modalAddEdit: ModalRepaymentEtcComponent

  constructor(
    private _utilityService: UtilityService,
    private _service:RepaymentEtcService,
    private notificationService: NotificationService, private _authService:AuthService,
    private branchService:BranchService   , private exportService:ExportService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    //this.loadCustomer();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.adminPerrmission=this.userLoged.isAdmin;
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  changedBranch(event:Branch){
    this.branchId=event!.id;
    this.loadData();
  }

  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this._service.getPaging(params).subscribe((res: ResponseValue<Pagination<RepaymentEtc>>) => {
        if (res.code == '200' || res.code == '201') {
          let listExport = res.data?.items;
          this.exportService.exportExcel(listExport, 'hoanungveEtc');
        }
        else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
      });
  }
  exportDetail(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this._service.exportDetail(params).subscribe((res: ResponseValue<RepaymentEtcDetail[]>) => {
        if (res.code == '200' || res.code == '201') {
          let listExport = res.data
          this.exportService.exportExcel(listExport, 'hoanungEtcChitiet');
        }
        else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
      });
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this._service.getPaging(params).subscribe((res: ResponseValue<Pagination<RepaymentEtc>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
          console.log(this.listData);
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listData =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  clickRow(item: RepaymentEtc): void {
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

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add(){
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flagView:boolean): void {
    const index = this.listData.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id,this.listData[index].createdBy!=this.userLoged.id);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter(x => x.checked);
    console.log(listChecks[0]);

    if(listChecks[0].createdBy!=this.userLoged.id)return;
    if(listChecks[0].status>0)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this._service.delete(id).subscribe((res: ResponseValue<any>) => {
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
  closeDispatchModal(){
    this.viewDispatchModal=false;
  }

}
