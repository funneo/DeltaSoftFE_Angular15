import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, DebitNotes, Profile, ResponseValue } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, DebitNotesService, NotificationService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accept-debit-note',
  templateUrl: './accept-debit-note.component.html',
  styleUrls: ['./accept-debit-note.component.css']
})
export class AcceptDebitNoteComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;

  flagAccept = false;
  keyword = "";
  listData: DebitNotes[];
  listFilter: DebitNotes[];
  listCustomer: Customer[];
  customerId?: number;
  busy: Subscription;

  listBranch: Branch[];
  _branchId: number;
  _auth: number = 5;

  makhSearch?:string;
  loaihinhSearch?:string;
  sodebitSearch?:string;
  ngaySearch?:string;
  ngayDTSearch?:string;
  jobIdSearch?:string;
  tokhaiSearch?:string;
  vandonSearch?:string;
  sobookingSearch?:string;
  invoiceSearch?:string;
  ghichuSearch?:string;
  selectedType=0;
  sohoadonSearch='';
  userLoged: Profile;

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private _utilityService: UtilityService,
    private customerService: CustomerService,
    public datepipe: DatePipe,
    private service: DebitNotesService,
    private authService: AuthService,private spinner: NgxSpinnerService,
    private branchService: BranchService
  ) {
    this.userLoged = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
  }

  ngOnInit(): void {
    var p=UtilityService.getLocalParams('ACCEPTDEBIT');
    localStorage.removeItem('ACCEPTDEBIT');
    if(p!=null){
      this.ngayBatDau =new Date(p.d1);
      this.ngayKetThuc =new Date(p.d2);
      this.customerId=p.customerId;
      this._branchId=p.branchId;
      this.makhSearch=p.makhSearch;
      this.loaihinhSearch=p.loaihinhSearch;
      this.sodebitSearch=p.sodebitSearch;
      this.ngaySearch=p.ngaySearch;
      this.ngayDTSearch=p.ngayDTSearch;
      this.jobIdSearch=p.jobIdSearch;
      this.tokhaiSearch=p.tokhaiSearch;
      this.vandonSearch=p.vandonSearch;
      this.sobookingSearch=p.sobookingSearch;
      this.invoiceSearch=p.invoiceSearch;
      this.ghichuSearch=p.ghichuSearch;
      this.selectedType=p.selectedType;
      this.keyword=p.keyword;
    }
    else{
      this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
      this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    }
    this.ngayBatDau = new Date(
      moment().hours(0).minutes(0).seconds(0).startOf("month").toString()
    );
    this.ngayKetThuc = new Date(
      moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
    );
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.loadCustomer();
    this.loadChiNhanh();
    this.loadData();
    // console.log(this.listPermissionCS);
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService
      .getAll(params)
      .subscribe((res: ResponseValue<Customer[]>) => {
        this.listCustomer = res.data;
      });
  }

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.timKiem();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }

  loadData(): void {
    this.spinner.show();
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("customerId", this.customerId?.toString())
      .set("branchId", this._branchId?.toString());
    this.busy = this.service
      .getAccepting(params)
      .subscribe((res: ResponseValue<DebitNotes[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listData = res.data;
          this.filter();
          this.spinner.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
          this.spinner.hide();
        }
      });
  }

  changedChiNhanh() {
    this.timKiem();
  }

  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.selectedType>0){
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType==1? !data.step:data.step;
      });
    }
    if(this.sohoadonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.deltaInvoiceNo.toString().toLowerCase().includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if(this.makhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if(this.loaihinhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitType?.toLowerCase().includes(this.loaihinhSearch.trim().toLocaleLowerCase());
    });
    if(this.sodebitSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.debitNo?.toLowerCase().includes(this.sodebitSearch.trim().toLocaleLowerCase());
    });

    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    if(this.ngayDTSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.debitDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngayDTSearch.trim().toLocaleLowerCase());
    });

    if(this.jobIdSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.shipmentNo?.toLowerCase().includes(this.jobIdSearch.trim().toLocaleLowerCase());
    });
    if(this.vandonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.vandonSearch.trim().toLocaleLowerCase());
    });
    if(this.tokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
    });
    if(this.sobookingSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.sobookingSearch.trim().toLocaleLowerCase());
    });
    if(this.invoiceSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoiceNo?.toLowerCase().includes(this.invoiceSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
  }

  clickRow(item: DebitNotes): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

 edit(id: number, flag: boolean): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      customerId: this.customerId,
      branchId:this._branchId,
      makhSearch:this.makhSearch,
      loaihinhSearch:this.loaihinhSearch,
      sodebitSearch:this.sodebitSearch,
      ngaySearch:this.ngaySearch,
      ngayDTSearch:this.ngayDTSearch,
      jobIdSearch:this.jobIdSearch,
      tokhaiSearch:this.tokhaiSearch,
      vandonSearch:this.vandonSearch,
      sobookingSearch:this.sobookingSearch,
      invoiceSearch:this.invoiceSearch,
      ghichuSearch:this.ghichuSearch,
      selectedType:this.selectedType,
      keyword:this.keyword
    }
    UtilityService.setLocalParams(p,"ACCEPTDEBIT");
    if (id == null) {
      const index = this.listFilter.findIndex(x => x.checked);
      if (index >= 0) {
        id = this.listFilter[index].id;
      }
    }
    this.router.navigateByUrl('/main/shipments/debit-notes/detail/' + id.toString() + '/' + flag);
  }

  lockingConfirm(): void {
    let listChecks = this.listFilter.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_ACCEPTING_MSG,
      () => this.locked(checks.join(","))
    );
  }

  locked(listIds: string): void {
    this.service.acceptList(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listFilter.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  isAllChecked() {
    if (this.listFilter) return this.listFilter.every((_) => _.checked);
  }

  icheck() {
    let checks = this.listFilter.filter((x) => x.checked);
    if (checks.length >0) {
      this.flagAccept =true;
    } else {
      this.flagAccept = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

}
