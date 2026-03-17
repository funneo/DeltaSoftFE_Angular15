import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { RateExchange } from '@app/shared/models/categories/rate-exchange.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { RateExchangeService } from '@app/shared/services/categories/rate-exchange.service';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rate-exchange',
  templateUrl: './rate-exchange.component.html',
  styleUrls: ['./rate-exchange.component.css']
})
export class RateExchangeComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  totalAmount=0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: RateExchange[];
  listFilter: RateExchange[];
  busy: Subscription;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;

  maSearch?:string='';
  tenSearch?:string='';
  ngaySearch?:string='';
  buySearch?:string='';
  sellSearch?:string='';

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,
    public datepipe: DatePipe,private _export:ExportService,private rService:RateExchangeService,
    private authService: AuthService) {
      let user = this.authService.getLoggedInUser();}

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)

    this.busy = this.rService.getAll(params).subscribe((res: ResponseValue<RateExchange[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data;
        this.listFilter=this.listData;
        this.totalRows=this.listData?.length;
      }
      else {
        this.totalRows=0;
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.maSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.currencyCode.toString().toLowerCase().includes(this.maSearch.trim().toLocaleLowerCase());
      });
    if(this.tenSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.currencyName.toLowerCase().includes(this.tenSearch.trim().toLocaleLowerCase());
      });

    if(this.buySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.buy?.toString().toLowerCase().includes(this.buySearch.trim().toLocaleLowerCase());
    });
    if(this.sellSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.sell?.toString().toLowerCase().includes(this.sellSearch.trim().toLocaleLowerCase());
    });

    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    this.totalRows=this.listFilter?.length;
  }
  timKiem(){
    this.pageIndex=1;
    this.loadData();
  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }
}
