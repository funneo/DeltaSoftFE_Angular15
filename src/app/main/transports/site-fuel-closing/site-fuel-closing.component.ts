import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalFuelClosingComponent } from '@app/shared/components/transports/modal-fuel-closing/modal-fuel-closing.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, Profile, ResponseValue } from '@app/shared/models';
import { GasSite } from '@app/shared/models/gas-site.model';
import { FuelClosing } from '@app/shared/models/transports/fuel-closing.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { GasSiteService } from '@app/shared/services/gas-site.service';
import { FuelClosingService } from '@app/shared/services/transports/fuel-closing.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'site-fuel-closing',
  templateUrl: './site-fuel-closing.component.html',
  styleUrls: ['./site-fuel-closing.component.css']
})
export class SiteFuelClosingComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  keyword = '';
  flagEdit:boolean=false;
  flagDelete:boolean=false;
  listSite: GasSite[]=[];
  listSiteFuelClosing: FuelClosing[]=[];
  userLoged?:Profile;
  siteId?:number=0;
  busy: Subscription;
  viewModal = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalFuelClosingComponent, { static: false }) modalAddEdit: ModalFuelClosingComponent
  
  constructor(
    private fuelClosingService:FuelClosingService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private gasSiteService:GasSiteService
    ,private _utilityService:UtilityService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    //this.loadCustomer();
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadSite();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadSite();
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('gassiteid',this.siteId.toString())
      .set('driverid','0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('type','0')
     // .set('usergroupid')
      this.busy = this.fuelClosingService.getPaging(params).subscribe((res: ResponseValue<Pagination<FuelClosing>>) => {
        if (res.code == '200' || res.code == '201') {        
          this.listSiteFuelClosing = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listSiteFuelClosing =[];
            this.totalRows  = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  loadSite(): void {
    const params = new HttpParams()
      this.busy = this.gasSiteService.getAll(Number.parseInt(this.userLoged.branchId)).subscribe((res: ResponseValue<GasSite[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listSite = res.data;
        }
        else {
          if(res.code=='204'){
            this.listSite =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  deleteConfirm(): void {
    let listChecks = this.listSiteFuelClosing.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks[0])
    );
  }

  delete(id:number): void {
    this.fuelClosingService
      .delete(id)
      .subscribe((res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.DELETE_ERR_MSG + "\n" + res.code+ "\n" + res.message
          );
        }
      });
  }


  clickRow(item: FuelClosing): void {
    item.checked = !item.checked;
    this.listSiteFuelClosing.forEach(it=>{
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
    const index = this.listSiteFuelClosing.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listSiteFuelClosing[index].id,flag);
    }, 50);
  }

  icheck() {
    let checks = this.listSiteFuelClosing.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagEdit = true;
      this.flagDelete=true;
    }
    else {
      this.flagEdit = false;
      this.flagDelete=false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
