import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, ResponseValue } from '@app/shared/models';
import { DriverFuelDebit } from '@app/shared/models/transports/driver-fuel-debit.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { DriverFuelDebitService } from '@app/shared/services/transports/driver-fuel-debit.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-driver-fuel-debit-credit',
  templateUrl: './driver-fuel-debit-credit.component.html',
  styleUrls: ['./driver-fuel-debit-credit.component.css']
})
export class DriverFuelDebitCreditComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDebitCredits: DriverFuelDebit[];
  busy: Subscription;
  viewModal = false;
  _branchId: number;
  _quyen:number;
  listBranch: Branch[];
  currency: string;
  ngayKetChuyen: Date;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
   constructor(private driverDebitService: DriverFuelDebitService, private notificationService: NotificationService
    , private _utilityService: UtilityService,
     private authService: AuthService,  private router: Router,private branchService:BranchService) {
      let user = this.authService.getLoggedInUser();
      this._quyen=Number.parseInt(user.authorisationLevel);
      this._branchId = Number.parseInt(user.branchId);
     }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
    this.loadBranch();
  }


loadBranch() {
  this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
    this.listBranch = res.data;
  });
}

changedBranch() {
  this.loadData();
}

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this._branchId.toString());
    this.busy = this.driverDebitService.getPaging(params).subscribe((res: ResponseValue<Pagination<DriverFuelDebit>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDebitCredits = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
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

  showDetail(item: DriverFuelDebit) {
    this.router.navigateByUrl('/main/transports/driverfueldebitcredit/detailed/'+ item.driverId);
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
