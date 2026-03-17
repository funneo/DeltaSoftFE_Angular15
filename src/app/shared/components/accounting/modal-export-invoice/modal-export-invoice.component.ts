import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, Employee, ResponseValue, ExportInvoice, ExportInvoiceDetail, OtherCategories, Pagination, ReportViewModel } from '@app/shared/models';
import { NotificationService, BranchService, CustomerService, AuthService, UtilityService, EmployeeService, AccountListService, OtherCategoriesService, ExportInvoiceService, ReportsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable,  Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ExportService } from '@app/shared/services/export-excel.service';
import { environment } from '@environments/environment';
import { ModalImportExcelComponent } from '../../systems/modal-import-excel/modal-import-excel.component';

@Component({
  selector: 'modal-export-invoice',
  templateUrl: './modal-export-invoice.component.html',
  styleUrls: ['./modal-export-invoice.component.css']
})
export class ModalExportInvoiceComponent implements OnInit {
  entity: ExportInvoice;
  flagNew:boolean=false;
  flagXem: boolean = false;
  flagSave: boolean = false;
  flagImpotExcel: boolean = true;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.mask3Number;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId: number;


  _invoiceDate: string = moment(new Date()).format('DD/MM/YYYY');
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );


  listCustomers: Customer[];
  flagLink: boolean = false;
  listDetails: ExportInvoiceDetail[];
  listCurrencys:OtherCategories[]=[];
  acceptPermission:boolean=false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private exportInvoiceService: ExportInvoiceService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService,
     private _utilityService: UtilityService, private customerService: CustomerService,
     private http: HttpClient,
     private reportService:ReportsService,
     private otherCategoriesService:OtherCategoriesService) {
    let user = this.authService.getLoggedInUser();
    this.acceptPermission=authService.hasPermission('INVOICE_ACCEPT')
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
  }
  exportExcel(){
    this.busy = this.reportService
    .exportInvoiceDetail(this.entity)
    .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement('a');
        a.href = environment.apiUrl + res.data;
        a.download;
        a.click();
      } else {
        this._notificationService.printErrorMessage(
          MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
        );
      }
    });
  }

  getVAT(): Observable<any> {
    return this.http.get("./assets/data/vat.json");
  }

  ngOnInit(): void {
    this.getVAT().subscribe(data => {
      if (data) {
        let list= data?.list;
        let i = list?.findIndex(x => x.status);
        if (i > -1) this._vatRate = list[i].id;
      }
    });
    this.loadChiNhanh();
    this.loadCustomer();
    this.loadEmployee();
    this.loadOtherCategory();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'CURRENCY');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listCurrencys = [...res.data.filter(x => x.type === 'CURRENCY')];
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadCustomer() {
    const params = new HttpParams()
      .set('keyword', '')
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomers = res.data;
    });
  }

  changedCustomer(item: Customer) {
    this.entity.customerAdd = item.address;
    this.entity.customerName = item.customerName;
    this.entity.customerTaxcode = item.taxCode;
  }

  selectedDate(event) {
    this._invoiceDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this._invoiceDate == null)
      this._invoiceDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(item: any = null,flag:boolean) {
    if(!flag){
      this.entity = {
      status: true,
      branchId: this._branchId,
      employeeId: this._employeeId,
      isPayment: false,
      vatRate:this._vatRate,
      currency:'VND',
      invoiceDate: moment(new Date()).format('DD/MM/YYYY')
    };
    if (item != undefined && item != null) {
      this.flagLink = true;
    }
    this.listDetails = [];
    this.inputTen();
    }
    else{
      this.exportInvoiceService.getDetail(item).subscribe((res: ResponseValue<ExportInvoice>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = res.data;
          this.entity.id=undefined;
          this.entity.invoiceNo='';
            this.entity.documentNo='';
            this.listDetails = this.entity.invoiceDetails ?? [];
          if (this.listDetails && this.listDetails.length != 0) {
            this.listDetails.every(_ => _.tempId = _.id);
          }
          this._vatRate=this.entity.vatRate;
          this._vatAmount=this.entity.vatAmount;
          this._tongTienSauVat=this.entity.grandTotal;
          this._tongTienTruocVat=this.entity.total;
          this.inputTen();
        }else{
          this.entity = {
            status: true,
            branchId: this._branchId,
            employeeId: this._employeeId,
            isPayment: false,
            vatRate:this._vatRate,
            currency:'VND',
            invoiceDate: moment(new Date()).format('DD/MM/YYYY')
          };
          this.listDetails = [];
          this.inputTen();
        }
      });
    }

    this.flagNew=true;
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.exportInvoiceService.getDetail(id).subscribe((res: ResponseValue<ExportInvoice>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if (this.entity.invoiceDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.invoiceDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._invoiceDate = moment(this.entity.invoiceDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.flagXem = flag;
        this.flagSave = false;
        this.flagLink = true;
        this.listDetails = this.entity.invoiceDetails ?? [];
        if (this.listDetails && this.listDetails.length != 0) {
          this.listDetails.every(_ => _.tempId = _.id);
        }
        this.flagImpotExcel= !this.entity.status;
        this._vatRate=this.entity.vatRate;
        this._vatAmount=this.entity.vatAmount;
        this._tongTienSauVat=this.entity.grandTotal;
        this._tongTienTruocVat=this.entity.total;
        if (!this.flagXem)
          this.inputTen();
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this._invoiceDate)
        this.entity.invoiceDate = moment(this._invoiceDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      this.entity.invoiceDetails = this.listDetails.filter(
        (x) => x.content !=null && x.content != ''
      );
      this.entity.vatRate = this._vatRate;
      this.entity.vatAmount = this._vatAmount;
      this.entity.total = this._tongTienTruocVat;
      this.entity.grandTotal = this._tongTienSauVat;
      if (this.flagNew) {
        this.exportInvoiceService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.exportInvoiceService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  thanhTien(item: ExportInvoiceDetail): void {
    if (item.quantity && item.unitPrice) {
      item.amount = item.quantity * item.unitPrice;
    }
    this.tongTien();
  }

  _vatRate: number = 10;
  _vatAmount: number = 0;
  _tongTienTruocVat: number = 0;
  _tongTienSauVat: number = 0;

  tongTien(): void {
    let tongTien = 0;
    this.listDetails.forEach(x => tongTien += x.amount);
    this._tongTienTruocVat = tongTien;
    this._vatAmount = Math.round((tongTien * this._vatRate) / 100);
    this._tongTienSauVat = this._tongTienTruocVat + this._vatAmount;
  }

  changedVat() {
    this.tongTien();
  }
  acceptLocked(): void {
    this._notificationService.printConfirmationDialog(MessageContstants.LOCKLED_OR_NOT, () => {
      this.exportInvoiceService.set(this.entity.id,true).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + '\n' + res.code)
        }
      });
    });
  }

  acceptCanceled(): void {
    this._notificationService.printConfirmationDialog(MessageContstants.CANCELED_OR_NOT, () => {
      this.exportInvoiceService.set(this.entity.id,true).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + '\n' + res.code)
        }
      });
    });
  }

  inputTen() {
    if (this.listDetails?.length == 0) {
      let item: ExportInvoiceDetail = {
        tt:'1',
        tempId: 1,
        content: '',
        amount: 0
      };
      this.listDetails.push(item);
    } else {
      let i=this.listDetails.length;
      let arrayId = this.listDetails?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });

      let item = this.listDetails.find((x) => x.tempId == maxId);
      if (item && (item.content != '')) {
        let item: ExportInvoiceDetail = {
          tt:(i+1).toString(),
          tempId: maxId + 1,
          content: '',
          amount: 0
        };
        this.listDetails.push(item);
      }
    }
  }

  removeItem(i: number) {
    this.listDetails.splice(i, 1);
    this.tongTien();
  }
  listDetail: ExportInvoiceDetail[] = [];
  viewImportExcel: boolean;
    @ViewChild(ModalImportExcelComponent, { static: false })
    modalImport: ModalImportExcelComponent;
  
    showImport(): void {
      if (!this.flagImpotExcel) return;
      this.viewImportExcel = true;
      setTimeout(() => {
        this.modalImport.view(2);
      }, 50);
    }
  saveSuccessImport(event: ExportInvoiceDetail[]): void {
    console.log(event);
    this.listDetails = event.filter(x => x.content != null && x.content.length > 0);
  }
  closeImport() {
    this.viewImportExcel = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }

}
