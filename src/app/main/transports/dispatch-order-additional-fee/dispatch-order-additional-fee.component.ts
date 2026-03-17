import { HttpParams } from '@angular/common/http';
import { BranchService } from './../../../shared/services/branch.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDispatchOrderAdditionalFeeComponent } from '@app/shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.component';
import { Branch, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { DispatchOrderAdditionalFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-additional-fee.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { AdditionalFeeService } from '@app/shared/services/transports/additional-fee.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ModalDispatchorderComponent } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component';

@Component({
  selector: 'app-dispatch-order-additional-fee',
  templateUrl: './dispatch-order-additional-fee.component.html',
  styleUrls: ['./dispatch-order-additional-fee.component.css']
})
export class DispatchOrderAdditionalFeeComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: DispatchOrderAdditionalFee[]=[];
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
  @ViewChild(ModalDispatchOrderAdditionalFeeComponent, { static: false }) modalAddEdit: ModalDispatchOrderAdditionalFeeComponent
  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent

  constructor(
    private _utilityService: UtilityService,
    private additionalFeeService:AdditionalFeeService,
    private notificationService: NotificationService, private _authService:AuthService,
    private branchService:BranchService
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
    this.branchId=event?.id;
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId==null?'0':this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this.additionalFeeService.getPaging(params).subscribe((res: ResponseValue<Pagination<DispatchOrderAdditionalFee>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data?.items;
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
  viewDispatchOrder(refNo:string){
    this.viewDispatchModal = true;
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.edit(refNo, true);
    }, 50);
  }

  clickRow(item: DispatchOrderAdditionalFee): void {
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

  edit(): void {
    const index = this.listData.findIndex(x => x.checked);
    this.viewModal = true;
    let permission=this.listData[index].createdBy!=this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id, permission);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter(x => x.checked);
    if(listChecks[0].createdBy!=this.userLoged.id)return;
    if(listChecks[0].status>0)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.additionalFeeService.delete(id).subscribe((res: ResponseValue<any>) => {
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
