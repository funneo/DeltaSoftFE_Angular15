import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Debt, Pagination, ResponseValue, Customer, Supplier, DebtReportViewModel, ReportViewModel, Branch, Shipment, DebitNotes } from '@app/shared/models';
import { NotificationService,  UtilityService, AuthService, CustomerService, ReportsService, BranchService, DebitNotesService, ShipmentService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { DatePipe } from '@angular/common';
import { ExportService } from '@app/shared/services/export-excel.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-report-shipment-not-debit',
  templateUrl: './report-shipment-not-debit.component.html',
  styleUrls: ['./report-shipment-not-debit.component.css']
})
export class ReportShipmentNotDebitComponent implements OnInit {

  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: ReportViewModel[];
  listFilter: ReportViewModel[];
  listSupplier: Supplier[];
  listCustomer:Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  _quyen=5;

  makhSearch?:string='';
  tenkhSearch?:string='';
  jobidSearch?:string='';
  ngaytaoSearch?:string='';
  tokhaiSearch?:string='';
  ngaytkSearch?:string='';
  vandonSearch?:string='';
  bookingNoSearch?:string='';
  invoiceNoSearch?:string='';
  loaihinhSearch?:string='';
  luonghangSearch?:string='';
  cbmSearch?:string='';
  kienhangSearch?:string='';
  ghichuSearch?:string='';

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listBranch:Branch[];
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService,
    private reportsService: ReportsService, private authService: AuthService,private customerService:CustomerService,
    public datepipe: DatePipe,private _export:ExportService,private spinner: NgxSpinnerService,private debitNotesService:DebitNotesService,
    private branchService:BranchService,private shipmentService:ShipmentService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen=parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }
  isSelected=false;
  debitNote0(){
    let listChecks = this.listFilter.filter(x => x.checked);
    let checks: string[] = [];
    for (let items of listChecks) {
      checks.push(items.jobId)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DEBIT0_MSG, () => this.debit0(checks));
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  clickRow(item: ReportViewModel): void {
    item.checked = !item.checked;
    this.icheck();
  }
  icheck() {
    let checks = this.listFilter.filter(x => x.checked);
    this.isSelected=checks.length>0;
  }

  _thongTinLoHang: string = "";
  _luongHang: string = "";

  getThongTinJob(item: Shipment): void {
    if (item) {
      this._thongTinLoHang = "";
      item.cdsNumber &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Tờ khai: " +
          item.cdsNumber);
      item.bookingNo &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Booking: " +
          item.bookingNo);
      item.hawB_HBL &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "HBill: " +
          item.hawB_HBL);
      item.invoiceNo &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Invoice: " +
          item.invoiceNo);
      item.shipmentTypeName &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Loại hình: " +
          item.shipmentTypeName);
      this._luongHang = "";
      if (item.weight && item.weight > 0)
        this._luongHang += "GW: " + item.weight.toString();
      if (item.volume && item.volume > 0)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Cbm: " : "Cbm: ") +
          item.volume.toString();
      if (item.conts)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Cont: " : "Cont: ") + item.conts;
      if (item.cartons && item.cartons > 0)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Pkg: " : "Pkg: ") +
          item.cartons.toString();
      if (item.pallets && item.pallets > 0)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Plt: " : "Plt: ") +
          item.pallets.toString();
    }
  }
  async debit0(listJobId: string[]): Promise<void> {
    await this.createDebitNote(listJobId);
    this.loadData (); // Hàm khác được gọi sau khi createDebitNote hoàn tất
  }
  async createDebitNote(listJobId: string[]): Promise<void> {
    if (listJobId?.length > 0) {
      for (const jobId of listJobId) {
        try {
          // Gọi API để lấy thông tin shipment
          const res = await this.shipmentService.getByJobId(jobId).toPromise();
          if (res.code == "200" || res.code == "201") {
            const value = res.data;
            this.getThongTinJob(value);
            const entity: DebitNotes = {
              status: true,
              step: 1,
              branchId: value.branchId,
              debitBranchId: value.branchId,
              employeeId: value.employeeId,
              customerId: value.customerId,
              shipmentId: value.id,
              type: 0,
              refDate: moment(value.jobDate).format("YYYYMMDD"),
              debitDate: moment(value.jobDate).format("YYYYMMDD"),
              jobId: value.jobId,
              notes: "Debit = 0",
              totalAmount: 0,
              debitType: value.shipmentTypeName,
              quantityOfGgoods: this._luongHang,
              debitNoteDetails: [
                {
                  feeId: 1115,
                  contents: "Debit=0",
                  amount: 0,
                  vat: 0,
                  amountAfterVAT: 0,
                  tempId: 1,
                  price: 0,
                  rVat: 10,
                  currency: "VND",
                },
              ],
              createdBy: value.createdBy,
            };
  
            if (!value.isDebited) {
              const addRes = await this.debitNotesService.addDebit0(entity).toPromise();
              if (addRes.code == "200" || addRes.code == "201") {
                console.log(`Successfully added debit note for Job ID: ${jobId}`);
              } else {
                console.error(`Failed to add debit note for Job ID: ${jobId}`);
              }
            }
          }
        } catch (error) {
          console.error(`Error processing Job ID: ${jobId}`, error);
        }
      }
    }
  }
  
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type', '');
    this.busy = this.reportsService.getNotDebit(params).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items;
        this.totalRows = res.data?.totalRows;
        this.filter();
        this.spinner.hide();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        this.spinner.hide();
      }
    });
  }
  filter(){
    this.listFilter = Object.assign([], this.listData);
    if(this.makhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerCode.toString().toLowerCase().includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if(this.tenkhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if(this.jobidSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.jobId?.toLowerCase().includes(this.jobidSearch.trim().toLocaleLowerCase());
    });
    if(this.invoiceNoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoiceNo?.toString().toLowerCase().includes(this.invoiceNoSearch.trim().toLocaleLowerCase());
    });
    if(this.tokhaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.tokhaiSearch.trim().toLocaleLowerCase());
    });
    if(this.loaihinhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.loaiHinh?.toLowerCase().includes(this.loaihinhSearch.trim().toLocaleLowerCase());
    });
    if(this.vandonSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.vandonSearch.trim().toLocaleLowerCase());
    });
    if(this.bookingNoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.bookingNoSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaytaoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.jobDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaytaoSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaytkSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.ngayToKhai, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaytkSearch.trim().toLocaleLowerCase());
    });
    if(this.luonghangSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.gw?.toString().toLowerCase().includes(this.luonghangSearch.trim().toLocaleLowerCase());
    });
    if(this.cbmSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.cbm?.toString().toLowerCase().includes(this.cbmSearch.trim().toLocaleLowerCase());
    });
    if(this.kienhangSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.package?.toString().toLowerCase().includes(this.kienhangSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
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

  showJob(item: any) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalJob.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(){
    this.viewModal=false;
  }

  exportExcel():void{
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('type','');
    this.busy = this.reportsService.exportNotDebit(params).subscribe((res: ResponseValue<string>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl  + res.data;
        a.download;
        a.click();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

}
