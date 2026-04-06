import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCancelDispatchOrderApprovedComponent } from '@app/shared/components/transports/modal-cancel-dispatch-order-approved/modal-cancel-dispatch-order-approved.component';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { CancelDispatchOrder } from '@app/shared/models/transports/cancel-dispatch-order.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cancel-dispatchorder',
  templateUrl: './cancel-dispatchorder.component.html',
  styleUrls: ['./cancel-dispatchorder.component.css']
})
export class CancelDispatchorderComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  keyword = '';
  listCancelDispatchorder: CancelDispatchOrder[];
  userLoged?:Profile;
  busy: Subscription;
  accept_permission:boolean=false;
  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  viewModal=false;
  @ViewChild(ModalCancelDispatchOrderApprovedComponent, { static: false }) modalDispatchOrderAddEdit: ModalCancelDispatchOrderApprovedComponent
  constructor(private dispatchOrderService: DispatchordersService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    ,private _authService:AuthService
    ) { }


  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    const permiss: string[] = typeof(this.userLoged.permissions) == "string"? JSON.parse(this.userLoged.permissions): this.userLoged.permissions;
    this.accept_permission= permiss.findIndex(x => x === 'CANCELDISPATCHORDER_ACCEPT') != -1;
    //this.loadCustomer();
    this.loadData();


  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }



  view(item:CancelDispatchOrder): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.edit(item);
    }, 50);
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('branchid',this.userLoged.branchId)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('refno',this.keyword)
     // .set('usergroupid')
      this.busy = this.dispatchOrderService.CancelDispatchOrder_GetAll(params).subscribe((res: ResponseValue<CancelDispatchOrder[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listCancelDispatchorder = res.data;
          this.totalRows = res.data?.length;
        }
        else {
          if(res.code=='204'){
            this.listCancelDispatchorder =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  timKiem(): void {
    this.loadData();
  }

  closeModal(){
    this.viewModal=false;
  }

}
