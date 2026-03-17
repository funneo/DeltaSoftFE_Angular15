import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { OnBehalfPayment, ResponseValue, Branch, Supplier, Employee } from '@app/shared/models';
import { OnBehalfPaymentService, NotificationService, BranchService, SupplierService, EmployeeService, AuthService, UtilityService } from '@app/shared/services';
import { ModalOnBehalfPaymentComponent } from '@app/shared/components/accounting/modal-on-behalf-payment/modal-on-behalf-payment.component';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExportService } from '@app/shared/services/export-excel.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-on-behalf-payment',
  templateUrl: './on-behalf-payment.component.html',
  styleUrls: ['./on-behalf-payment.component.css']
})
export class OnBehalfPaymentComponent implements OnInit {
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalOnBehalfPaymentComponent;

  listData: any[] = []; // Use any[] to support 'checked' property
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRows: number = 0;
  keyword: string = '';
  supplierId: number = null;
  employeeId: string = '';
  
  listBranch: Branch[] = [];
  listSupplier: Supplier[] = [];
  listEmployee: Employee[] = [];
  
  branchId: number;
  authLevel: number;
  busy: Subscription;

  public ngayBatDau: Date = new Date(moment().subtract(30, 'days').startOf('day').toString());
  public ngayKetThuc: Date = new Date(moment().endOf('day').toString());
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  // Selection flags
  flagEdit = false;
  flagDelete = false;

  constructor(
    private service: OnBehalfPaymentService,
    private notificationService: NotificationService,
    private branchService: BranchService,
    private supplierService: SupplierService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private _utilityService: UtilityService,
    private spinner: NgxSpinnerService,
    private _export: ExportService,
    private datePipe: DatePipe
  ) { 
    let user = this.authService.getLoggedInUser();
    this.branchId = user ? Number.parseInt(user.branchId) : 0;
    this.authLevel = user ? Number.parseInt(user.authorisationLevel) : 0;
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadSuppliers();
    this.loadEmployees();
    this.loadData();
  }

  loadBranches() {
    this.branchService.getAll().subscribe(res => this.listBranch = res.data);
  }

  loadSuppliers() {
    const params = new HttpParams().set('branchid', this.branchId.toString());
    this.supplierService.getAll(params).subscribe(res => this.listSupplier = res.data);
  }

  loadEmployees() {
    const params = new HttpParams().set('branchId', this.branchId.toString());
    this.employeeService.getAll(params).subscribe(res => this.listEmployee = res.data);
  }

  selectedDate(event: any) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  timKiem() {
    this.pageIndex = 1;
    this.loadData();
  }

  loadData() {
    if (this.spinner) this.spinner.show();
    const filter = {
      keyword: this.keyword,
      fromDate: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      toDate: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      supplierId: this.supplierId,
      employeeId: this.employeeId
    };

    this.service.getAll(filter).subscribe((res: ResponseValue<any>) => {
      this.listData = (res.data || []).map(x => ({ ...x, checked: false }));
      this.totalRows = this.listData.length;
      if (this.spinner) this.spinner.hide();
      this.icheck();
    }, err => {
      if (this.spinner) this.spinner.hide();
    });
  }

  exportExcel() {
    const exportData = this.listData.map(item => ({
      'Ngày lập': this.datePipe.transform(item.createdDate, 'dd/MM/yyyy'),
      'Job ID': item.jobId,
      'Nội dung / Diễn giải': item.description,
      'Số tiền dự tính': item.estimatedAmount,
      'Số tiền thực chi': item.actualAmount,
      'Tiền tệ': item.currency,
      'Trạng thái trả': item.paymentStatus === 3 ? 'Đã trả' : (item.paymentStatus === 2 ? 'Trả một phần' : 'Chưa trả'),
      'Hóa đơn': item.invoiceStatus === 2 ? 'Đủ HĐ' : (item.invoiceStatus === 1 ? 'Thiếu HĐ' : 'Chưa có HĐ'),
      'Thu hồi': item.recoveryStatus === 2 ? 'Đã thu' : (item.recoveryStatus === 1 ? 'Thu một phần' : 'Chưa thu')
    }));
    this._export.exportExcel(exportData, 'Danh_sach_Chi_Ho');
  }

  add() {
    this.modalAddEdit.show();
  }

  edit(id?: number) {
    if (!id) {
        const item = this.listData.find(x => x.checked);
        if (item) id = item.id;
    }
    if (id) this.modalAddEdit.show(id);
  }

  deleteConfirm() {
    const listChecked = this.listData.filter(x => x.checked);
    if (listChecked.length > 0) {
        if (confirm("Bạn có chắc chắn muốn xóa các khoản chi đã chọn?")) {
            const ids = listChecked.map(x => x.id).join(',');
            this.service.delete(ids).subscribe(res => {
                this.notificationService.printSuccessMessage("Xóa thành công");
                this.loadData();
            });
        }
    }
  }

  clickRow(item: any) {
    item.checked = !item.checked;
    this.icheck();
  }

  checkAll(ev: any) {
    this.listData.forEach(x => x.checked = ev.target.checked);
    this.icheck();
  }

  isAllChecked() {
    return this.listData.length > 0 && this.listData.every(x => x.checked);
  }

  icheck() {
    const checks = this.listData.filter(x => x.checked);
    this.flagEdit = checks.length === 1;
    this.flagDelete = checks.length > 0;
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page;
  }
}

