import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalEmployeeDebitClosingComponent } from '@app/shared/components/advance-payment/modal-employee-debit-closing/modal-employee-debit-closing.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Employee, Pagination, Profile, ResponseValue, Shipment } from '@app/shared/models';
import { EmployeeDebitClosing } from '@app/shared/models/advance-payments/employee-debit-closing.model';
import { AdvanceService, AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { EmployeeDebitClosingService } from '@app/shared/services/advance-payment/employee-debit-closing.service';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-debit-closing',
  templateUrl: './employee-debit-closing.component.html',
  styleUrls: ['./employee-debit-closing.component.css']
})
export class EmployeeDebitClosingComponent implements OnInit {

  // ---- Chung ----
  listEmployee: Employee[];
  userLoged?: Profile;
  _auth: number = 5;
  _viewAll = 2;
  _branchId: number;
  _functionId = SystemContstants.ADVANCE;
  busy: Subscription;
  viewModal = false;
  _isAdmin = false;
  isTransfer: boolean = false;

  // ---- Tiền mặt ----
  listDataTM: EmployeeDebitClosing[] = [];
  listFilterTM: EmployeeDebitClosing[] = [];
  totalRowsTM = 0;
  flagEditTM = false;
  flagDeleteTM = false;
  _employeeIdTM: number;
  keywordTM = '';
  ngayBatDauTM: Date;
  ngayKetThucTM: Date;
  dateOptionsTM: any;

  nguoiSearchTM = '';
  soSearchTM = '';
  ngaySearchTM = '';
  previousSearchTM = '';
  debitSearchTM = '';
  creditSearchTM = '';
  ghichuSearchTM = '';
  noidungSearchTM = '';
  tienSearchTM = '';

  // ---- Chuyển khoản ----
  listDataCK: EmployeeDebitClosing[] = [];
  listFilterCK: EmployeeDebitClosing[] = [];
  totalRowsCK = 0;
  flagEditCK = false;
  flagDeleteCK = false;
  _employeeIdCK: number;
  keywordCK = '';
  ngayBatDauCK: Date;
  ngayKetThucCK: Date;
  dateOptionsCK: any;

  nguoiSearchCK = '';
  soSearchCK = '';
  ngaySearchCK = '';
  previousSearchCK = '';
  debitSearchCK = '';
  creditSearchCK = '';
  ghichuSearchCK = '';
  noidungSearchCK = '';
  tienSearchCK = '';

  @ViewChild(ModalEmployeeDebitClosingComponent, { static: false }) modalAddEdit: ModalEmployeeDebitClosingComponent
  constructor(private service: EmployeeDebitClosingService, private notificationService: NotificationService,
    public datepipe: DatePipe, private _utilityService: UtilityService, private employeeService: EmployeeService,
    private exportService: ExportService,
    private authService: AuthService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._isAdmin = this.userLoged.isAdmin;
    this._employeeIdTM = Number.parseInt(this.userLoged.employeeId);
    this._employeeIdCK = Number.parseInt(this.userLoged.employeeId);
  }

  ngOnInit(): void {
    const start = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    const end = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());

    this.ngayBatDauTM = start;
    this.ngayKetThucTM = end;
    this.dateOptionsTM = this._utilityService.dateOptionMultis(this.ngayBatDauTM, this.ngayKetThucTM);

    this.ngayBatDauCK = start;
    this.ngayKetThucCK = end;
    this.dateOptionsCK = this._utilityService.dateOptionMultis(this.ngayBatDauCK, this.ngayKetThucCK);

    this.loadEmployee();
    this.loadDataTM();
    this.loadDataCK();
  }

  loadEmployee() {
    const params = new HttpParams().set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  // ===================== TIỀN MẶT =====================

  selectedDateTM(event: any) {
    this.ngayBatDauTM = new Date(event.start);
    this.ngayKetThucTM = new Date(event.end);
    this.loadDataTM();
  }

  changedEmployeeTM(event: Employee) {
    this._employeeIdTM = event?.id;
    this.loadDataTM();
  }

  loadDataTM(): void {
    const params = new HttpParams()
      .set('keyword', this.keywordTM)
      .set('fromDate', moment(this.ngayBatDauTM).format('YYYYMMDD'))
      .set('toDate', moment(this.ngayKetThucTM).format('YYYYMMDD'))
      .set('employeeId', this._employeeIdTM?.toString())
      .set('branchId', this._branchId?.toString())
      .set('isTransfer', 'false');
    this.service.getAll(params).subscribe((res: ResponseValue<EmployeeDebitClosing[]>) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        this.listDataTM = res.data;
        this.filterTM();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  filterTM() {
    this.listFilterTM = Object.assign([], this.listDataTM);
    if (this.nguoiSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.employeeFullName?.toLowerCase().includes(this.nguoiSearchTM.trim().toLowerCase()));
    if (this.soSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.refNo?.toLowerCase().includes(this.soSearchTM.trim().toLowerCase()));
    if (this.ngaySearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => this.datepipe.transform(d.createdDate, 'dd/MM/yyyy')?.includes(this.ngaySearchTM.trim()));
    if (this.previousSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.previousDebit?.toString().includes(this.previousSearchTM.trim()));
    if (this.debitSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.debit?.toString().includes(this.debitSearchTM.trim()));
    if (this.creditSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.credit?.toString().includes(this.creditSearchTM.trim()));
    if (this.tienSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.debitBalance?.toString().includes(this.tienSearchTM.trim()));
    if (this.noidungSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.contents?.toLowerCase().includes(this.noidungSearchTM.trim().toLowerCase()));
    if (this.ghichuSearchTM?.length > 0)
      this.listFilterTM = this.listFilterTM.filter(d => d.note?.toLowerCase().includes(this.ghichuSearchTM.trim().toLowerCase()));
    this.totalRowsTM = this.listFilterTM.length;
  }

  clickRowTM(item: EmployeeDebitClosing): void {
    this.listDataTM.forEach(it => { if (it != item) it.checked = false; });
    item.checked = !item.checked;
    this.icheckTM();
  }

  icheckTM() {
    const checks = this.listDataTM.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDeleteTM = checks[0].status < 1 && (checks[0].createdBy == this.userLoged.id || this.userLoged.isAdmin);
      this.flagEditTM = checks[0].status < 1 && (checks[0].createdBy == this.userLoged.id || this.userLoged.isAdmin);
    } else {
      this.flagDeleteTM = false;
      this.flagEditTM = false;
    }
  }

  addTM(): void {
    this.service.check(this._employeeIdTM).subscribe((res: ResponseValue<boolean>) => {
      if (res.code == '200' || res.code == '201') {
        if (res.data) {
          this.notificationService.printAlert(MessageContstants.TITLE_INFO, MessageContstants.EMPLOYEE_DEBIT_CLOSING_REQUIED_ERROR);
        } else {
          this.isTransfer = false;
          this.viewModal = true;
          setTimeout(() => { this.modalAddEdit.add(false); }, 50);
        }
      } else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  editTM(flag: boolean): void {
    const index = this.listDataTM.findIndex(x => x.checked);
    this.isTransfer = false;
    this.viewModal = true;
    setTimeout(() => { this.modalAddEdit.edit(this.listDataTM[index].id, flag, false); }, 50);
  }

  deleteConfirmTM(): void {
    const checks = this.listDataTM.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0].id));
  }

  exportTM() {
    const printList = this.listFilterTM.map(({ id, status, branchId, employeeId, deleted, createdBy, createdDate, approvedBy, approvedDate, ...item }) => item);
    this.exportService.exportExcel(printList, 'chot-du-no-tien-mat');
  }

  showModalTM(item: EmployeeDebitClosing) {
    this.isTransfer = false;
    this.viewModal = true;
    setTimeout(() => { this.modalAddEdit.edit(item.id, true, false); }, 50);
  }

  // ===================== CHUYỂN KHOẢN =====================

  selectedDateCK(event: any) {
    this.ngayBatDauCK = new Date(event.start);
    this.ngayKetThucCK = new Date(event.end);
    this.loadDataCK();
  }

  changedEmployeeCK(event: Employee) {
    this._employeeIdCK = event?.id;
    this.loadDataCK();
  }

  loadDataCK(): void {
    const params = new HttpParams()
      .set('keyword', this.keywordCK)
      .set('fromDate', moment(this.ngayBatDauCK).format('YYYYMMDD'))
      .set('toDate', moment(this.ngayKetThucCK).format('YYYYMMDD'))
      .set('employeeId', this._employeeIdCK?.toString())
      .set('branchId', this._branchId?.toString())
      .set('isTransfer', 'true');
    this.service.getAll(params).subscribe((res: ResponseValue<EmployeeDebitClosing[]>) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        this.listDataCK = res.data;
        this.filterCK();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  filterCK() {
    this.listFilterCK = Object.assign([], this.listDataCK);
    if (this.nguoiSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.employeeFullName?.toLowerCase().includes(this.nguoiSearchCK.trim().toLowerCase()));
    if (this.soSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.refNo?.toLowerCase().includes(this.soSearchCK.trim().toLowerCase()));
    if (this.ngaySearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => this.datepipe.transform(d.createdDate, 'dd/MM/yyyy')?.includes(this.ngaySearchCK.trim()));
    if (this.previousSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.previousDebit?.toString().includes(this.previousSearchCK.trim()));
    if (this.debitSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.debit?.toString().includes(this.debitSearchCK.trim()));
    if (this.creditSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.credit?.toString().includes(this.creditSearchCK.trim()));
    if (this.tienSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.debitBalance?.toString().includes(this.tienSearchCK.trim()));
    if (this.noidungSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.contents?.toLowerCase().includes(this.noidungSearchCK.trim().toLowerCase()));
    if (this.ghichuSearchCK?.length > 0)
      this.listFilterCK = this.listFilterCK.filter(d => d.note?.toLowerCase().includes(this.ghichuSearchCK.trim().toLowerCase()));
    this.totalRowsCK = this.listFilterCK.length;
  }

  clickRowCK(item: EmployeeDebitClosing): void {
    this.listDataCK.forEach(it => { if (it != item) it.checked = false; });
    item.checked = !item.checked;
    this.icheckCK();
  }

  icheckCK() {
    const checks = this.listDataCK.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDeleteCK = checks[0].status < 1 && (checks[0].createdBy == this.userLoged.id || this.userLoged.isAdmin);
      this.flagEditCK = checks[0].status < 1 && (checks[0].createdBy == this.userLoged.id || this.userLoged.isAdmin);
    } else {
      this.flagDeleteCK = false;
      this.flagEditCK = false;
    }
  }

  addCK(): void {
    this.service.check(this._employeeIdCK).subscribe((res: ResponseValue<boolean>) => {
      if (res.code == '200' || res.code == '201') {
        if (res.data) {
          this.notificationService.printAlert(MessageContstants.TITLE_INFO, MessageContstants.EMPLOYEE_DEBIT_CLOSING_REQUIED_ERROR);
        } else {
          this.isTransfer = true;
          this.viewModal = true;
          setTimeout(() => { this.modalAddEdit.add(true); }, 50);
        }
      } else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  editCK(flag: boolean): void {
    const index = this.listDataCK.findIndex(x => x.checked);
    this.isTransfer = true;
    this.viewModal = true;
    setTimeout(() => { this.modalAddEdit.edit(this.listDataCK[index].id, flag, true); }, 50);
  }

  deleteConfirmCK(): void {
    const checks = this.listDataCK.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0].id));
  }

  exportCK() {
    const printList = this.listFilterCK.map(({ id, status, branchId, employeeId, deleted, createdBy, createdDate, approvedBy, approvedDate, ...item }) => item);
    this.exportService.exportExcel(printList, 'chot-du-no-chuyen-khoan');
  }

  showModalCK(item: EmployeeDebitClosing) {
    this.isTransfer = true;
    this.viewModal = true;
    setTimeout(() => { this.modalAddEdit.edit(item.id, true, true); }, 50);
  }

  // ===================== CHUNG =====================

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadDataTM();
        this.loadDataCK();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
      }
    });
  }

  saveSuccess(): void {
    this.loadDataTM();
    this.loadDataCK();
  }

  closeModal(): void {
    this.viewModal = false;
  }
}
