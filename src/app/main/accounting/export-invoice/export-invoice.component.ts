import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ExportInvoice, Pagination, ResponseValue, Customer, Branch } from '@app/shared/models';
import { NotificationService, ExportInvoiceService, UtilityService, AuthService, CustomerService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalExportInvoiceComponent } from '@app/shared/components/accounting/modal-export-invoice/modal-export-invoice.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ExportService } from '@app/shared/services/export-excel.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-export-invoice',
  templateUrl: './export-invoice.component.html',
  styleUrls: ['./export-invoice.component.css']
})
export class ExportInvoiceComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listExportInvoice: ExportInvoice[];
  listFilter: ExportInvoice[];
  listCustomer: Customer[];
  _customerId?: number;
  _branchId: number;
  listBranch:Branch[];
  _auth: number = 5;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  listPayment = [{ id: 0, text: 'Chưa thanh toán' }, { id: 1, text: 'Đã thanh toán' }, { id: 2, text: 'Tất cả' }];
  _payment: number = 2;
  tongtien=0;

  khSearch?:String;
  mstSearch?:String;
  invoicenoSearch?:String;
  ngaySearch?:String;
  soctSearch?:String;
  tienSearch?:String;
  ghichuSearch?:String;
  noidungSearch?:String;

  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalExportInvoiceComponent, { static: false }) modalAddEdit: ModalExportInvoiceComponent
  constructor(private notificationService: NotificationService, private _utilityService: UtilityService, private customerService: CustomerService,
    public datepipe: DatePipe,private exportInvoiceService: ExportInvoiceService,private _export:ExportService, private authService: AuthService,private branchService:BranchService) {
      let user = this.authService.getLoggedInUser();
      this._auth = Number.parseInt(user.authorisationLevel);
      this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch() {
    this.timKiem();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event:Customer){
    // this._customerId=event?.id;
    this.timKiem();
  }

  changedType(event: any): void {
      // let _id=event?.id;
      this.timKiem();
  }

  export(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('iPayment', this._payment?.toString());
    this.busy = this.exportInvoiceService.getPaging(params).subscribe((res: ResponseValue<Pagination<ExportInvoice>>) => {
      if (res.code == '200' || res.code == '201') {
        let listData = res.data?.items;
        listData.forEach(it=>{
          if(it.locked)it.rStatus='Khóa';
          else if(it.canceled)it.rStatus='Hủy'
          else it.rStatus='Kích hoạt'
        })
        let printList= listData.map(({ id,totalRows,branchId,employeeId,customerId,status, ...item }) => item);
        this._export.exportExcel(printList, 'hoa-don-ban-hang');
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  export1(){
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('iPayment', this._payment?.toString());
    this.busy = this.exportInvoiceService.getExport(params).subscribe((res: ResponseValue<ExportInvoice[]>) => {
      if (res.code == '200' || res.code == '201') {
        let listData = res.data;
        console.log(res);

        listData.forEach(it=>{
          if(it.locked)it.rStatus='Khóa';
          else if(it.canceled)it.rStatus='Hủy'
          else it.rStatus='Kích hoạt'
        })
        let printList= listData.map(({ id,totalRows,branchId,employeeId,customerId,status, ...item }) => item);
        this._export.exportExcel(printList, 'hoa-don-ban-hang-chi-tiet');
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
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId?.toString())
      .set('iPayment', this._payment?.toString());
    this.busy = this.exportInvoiceService.getPaging(params).subscribe((res: ResponseValue<Pagination<ExportInvoice>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listExportInvoice = res.data?.items;
        this.listFilter=this.listExportInvoice;
        this.totalRows = this.listFilter?.length;
        this.calculator();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  calculator(){
    this.tongtien=0;
    this.listFilter.forEach(it=>{
      this.tongtien+=it.grandTotal;
    })
  }
  filter(){
    this.listFilter = Object.assign([], this.listExportInvoice);
    if(this.khSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName?.toString().toLowerCase().includes(this.khSearch.trim().toLocaleLowerCase());
      });
    if(this.mstSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerTaxcode?.toLowerCase().includes(this.mstSearch.trim().toLocaleLowerCase());
      });
    if(this.soctSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.documentNo?.toLowerCase().includes(this.soctSearch.trim().toLocaleLowerCase());
    });
    if(this.tienSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.grandTotal?.toString().toLowerCase().includes(this.tienSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.noidungSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.content?.toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
    });
    if(this.invoicenoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.invoiceNo?.toLowerCase().includes(this.invoicenoSearch.trim().toLocaleLowerCase());
    });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.invoiceDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
    });
    this.totalRows = this.listFilter?.length;
    this.calculator();
  }

  clickRow(item: ExportInvoice): void {
    item.checked = !item.checked;

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
      this.modalAddEdit.add(null,false);
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listExportInvoice.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listExportInvoice[index].id.toString(), flag);
    }, 50);
  }

  copy(id:number): void {
    console.log(id);

    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(id,true);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listExportInvoice.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.exportInvoiceService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listExportInvoice.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listExportInvoice)
      return this.listExportInvoice.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listExportInvoice.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item:ExportInvoice) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
