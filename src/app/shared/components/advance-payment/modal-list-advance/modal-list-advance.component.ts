import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Advance, Pagination, Profile, ResponseValue } from '@app/shared/models';
import { AdvanceService, AuthService, NotificationService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-list-advance',
  templateUrl: './modal-list-advance.component.html',
  styleUrls: ['./modal-list-advance.component.css']
})
export class ModalListAdvanceComponent implements OnInit {
  listAdvance: Advance[];
  listFilter:Advance[];
  employeeId?:number;
  branchId?:number;
  userLoged?:Profile;
  busy: Subscription;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  nguoiSearch?:string='';
  soSearch?:string='';
  ngaySearch?:string='';
  lydoSearch?:string='';
  advancesRefno?:string='';
  tienSearch?:string='';
  isSelected=false;

  // false = tạm ứng cá nhân, true = tạm ứng nhà cung cấp
  @Input() isTransfer: boolean = false;
  // chỉ lọc khi là tạm ứng NCC; 0/null = không lọc theo NCC
  @Input() supplierId?: number;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAdvances', { static: false }) modalAdvances: ModalDirective;
  constructor(
    private advanceService: AdvanceService, private notificationService: NotificationService,
    public datepipe: DatePipe,private _utilityService: UtilityService,  private authService: AuthService) {
    this.userLoged = this.authService.getLoggedInUser();
    this.employeeId = Number.parseInt(this.userLoged.employeeId);
    this.branchId=Number.parseInt(this.userLoged.branchId);
 }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().subtract(60,'d').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  }

  clickRow(item: Advance): void {
    this.isSelected=false;
    this.advancesRefno=''
    item.checked = !item.checked;
    if(item.checked){
      this.advancesRefno=item.refNo;
      this.isSelected=true;
      this.listFilter.forEach(it=>{
        if(it!=item)it.checked=false;
      })
    }
  }
  show(){
    this.isSelected=false;
    this.loadData();
    this.modalAdvances.show();
  }

  filter(){
    this.listFilter = Object.assign([], this.listAdvance);
    if(this.soSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toLowerCase().includes(this.soSearch.trim().toLocaleLowerCase());
      });
    if(this.tienSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.amount?.toString().toLowerCase().includes(this.tienSearch.trim().toLocaleLowerCase());
    });
    if(this.lydoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.reason?.toLowerCase().includes(this.lydoSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadData (){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', "1")
      .set('pageSize', "1000")
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('employeeId',this.userLoged.employeeId)
      .set('step', '3')
      .set('branchId',this.userLoged.branchId)
      .set('isTransfer', String(!!this.isTransfer))
      .set('supplierId', (this.isTransfer && this.supplierId ? this.supplierId : 0).toString());
    this.busy = this.advanceService.getPaging(params).subscribe((res: ResponseValue<Pagination<Advance>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listAdvance = res.data?.items;
        this.filter()
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  saveChange() {
    if(this.advancesRefno.length>0){
      this.modalAdvances.hide();
        this.SaveSuccess.emit(this.advancesRefno);
    }
  }

  OnHidden() {
      this.CloseModal.emit();
  }
}
