import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import {
  AuthService, BranchService, EmployeeService, NotificationService,
  OtherCategoriesService, UtilityService,
} from '@app/shared/services';
import { EmployeeContractService } from '@app/shared/services/employee-contract.service';
import { EmployeeSalaryService } from '@app/shared/services/employee-salary.service';
import { Branch, Employee, OtherCategories, ResponseValue } from '@app/shared/models';
import { EmployeeContract, EmployeeSalary, ContractNumberSuggestion } from '@app/shared/models/employee-contract.model';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';

@Component({
  selector: 'modal-employee-hr',
  templateUrl: './modal-employee-hr.component.html',
  styleUrls: ['./modal-employee-hr.component.css']
})
export class ModalEmployeeHrComponent implements OnInit {

  public entity: Employee;
  public listBranch: Branch[] = [];
  listDepartment: OtherCategories[] = [];
  listTitle: OtherCategories[] = [];
  listStatus: OtherCategories[] = [];
  listWorkLocation: OtherCategories[] = [];

  listSex = [{ id: false, name: 'Nữ' }, { id: true, name: 'Nam' }];
  listIdType = [{ id: 1, name: 'CCCD' }, { id: 2, name: 'Hộ chiếu' }, { id: 3, name: 'CMND' }];
  listMarital = [{ id: false, name: 'Độc thân' }, { id: true, name: 'Đã kết hôn' }];

  public flagXem = false;
  public flagSave = false;
  public busy: Subscription;
  pathImage = '';
  viewAttachFiles = false;
  _hr = false;

  dobOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  startOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  issueOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  cOpt = this._utilityService.dateTimeOptionDays(new Date(), false);

  // ===== Tab 2 — Hợp đồng =====
  listContractType: OtherCategories[] = [];
  listContracts: EmployeeContract[] = [];
  contractEdit: EmployeeContract = null;
  showContractForm = false;

  // ===== Tab 3 — Lương =====
  listSalary: EmployeeSalary[] = [];
  salaryEdit: EmployeeSalary = null;
  showSalaryForm = false;
  savingChild = false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild('myHandle', { static: false }) myHandle: any;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private otherCategoryService: OtherCategoriesService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private branchService: BranchService,
    private contractService: EmployeeContractService,
    private salaryService: EmployeeSalaryService) {
    this._hr = this.authService.hasPermission('EMPLOYEE_HR');
  }

  ngOnInit(): void {
    this.loadBranch();
    this.loadCategory('DEPT', 'listDepartment');
    this.loadCategory('TITLES', 'listTitle');
    this.loadCategory('EMPLOYEE_STATUS', 'listStatus');
    this.loadCategory('WORK_LOCATION', 'listWorkLocation');
    this.otherCategoryService.getAll(new HttpParams().set('type', 'CONTRACT_TYPE'))
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == '200' || res.code == '201') this.listContractType = res.data;
      });
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == '200' || res.code == '201') this.listBranch = res.data;
    });
  }

  loadCategory(type: string, target: 'listDepartment' | 'listTitle' | 'listStatus' | 'listWorkLocation') {
    const params = new HttpParams().set('type', type);
    this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') this[target] = res.data;
      else if (res.code == '204') this[target] = [];
    });
  }

  add() {
    this.entity = { status: true, nationality: 'Việt Nam', idType: 1 };
    this.pathImage = '';
    this.flagXem = false;
    this.flagSave = false;
    this.listContracts = [];
    this.listSalary = [];
    this.showContractForm = false;
    this.showSalaryForm = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.flagXem = flag;
    this.flagSave = false;
    this.busy = this.employeeService.getDetailHR(id).subscribe((res: ResponseValue<Employee>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.pathImage = this.entity.imagePath
          ? environment.apiUrl + this.entity.imagePath.toString().replace('~', '') : '';
        this.entity.dateOfBirth = this._toVn(this.entity.dateOfBirth);
        this.entity.startDate = this._toVn(this.entity.startDate);
        this.entity.issueedDate = this._toVn(this.entity.issueedDate);
        this.showContractForm = false;
        this.showSalaryForm = false;
        this.loadContracts();
        this.loadSalary();
        this.modalAddEdit.show();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  // chuyển chuỗi ISO/EN -> dd/MM/yyyy để picker hiển thị
  private _toVn(v: string): string {
    if (!v) return v;
    const m = moment(v, [moment.ISO_8601, FormatContstants.DATEEN, FormatContstants.DATEVN], true);
    return m.isValid() ? m.format(FormatContstants.DATEVN) : v;
  }

  saveChange(form: NgForm) {
    if (!form.valid) return;
    this.flagSave = true;
    const payload: Employee = { ...this.entity };
    // dateOfBirth/startDate: BE parse dd/MM/yyyy; issueedDate: gửi ISO cho DateTime?
    payload.issueedDate = this._toIso(this.entity.issueedDate);

    const obs = this.entity.id == undefined
      ? this.employeeService.addHR(payload)
      : this.employeeService.updateHR(payload);

    obs.subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this.notificationService.printSuccessMessage(
          this.entity.id == undefined ? MessageContstants.CREATED_OK_MSG : MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
      } else {
        this.notificationService.printErrorMessage(
          this.entity.id == undefined ? MessageContstants.CREATED_ERR_MSG : MessageContstants.UPDATED_ERR_MSG);
        this.flagSave = false;
      }
    }, () => { this.flagSave = false; });
  }

  // dd/MM/yyyy -> ISO yyyy-MM-ddT00:00:00 (cho cột DateTime? bind tự động ở BE)
  private _toIso(v: string): string {
    if (!v) return null;
    const m = moment(v, [FormatContstants.DATEVN, moment.ISO_8601], true);
    return m.isValid() ? m.format('YYYY-MM-DDT00:00:00') : null;
  }

  selectedDob(e) { this.entity.dateOfBirth = moment(e.start).format('DD/MM/YYYY'); }
  selectedStart(e) { this.entity.startDate = moment(e.start).format('DD/MM/YYYY'); }
  selectedIssue(e) { this.entity.issueedDate = moment(e.start).format('DD/MM/YYYY'); }

  onFileChanged(event) {
    if (event.target.files.length > 0 && this.entity?.id) {
      const file = event.target.files[0];
      this.busy = this.employeeService.uploadImage(this.entity, file).subscribe((res: ResponseValue<Employee>) => {
        if (res.code == '200' || res.code == '201') {
          this.pathImage = environment.apiUrl + res.data.imagePath.replace('~', '');
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
        }
      });
    }
  }

  showFiles() {
    if (!this.entity?.id) return;
    this.viewAttachFiles = true;
    const item: Attachfiles = { frmName: 'EMPLOYEE', functionName: 'EMPLOYEE', refNo: this.entity.id.toString() };
    setTimeout(() => this.modalAttackFiles.edit(item, false), 50);
  }

  // ============ TAB 2 — HỢP ĐỒNG ============
  loadContracts() {
    if (!this.entity?.id) { this.listContracts = []; return; }
    this.contractService.getByEmployee(this.entity.id).subscribe((res: ResponseValue<EmployeeContract[]>) => {
      this.listContracts = (res.code == '200' || res.code == '201') ? (res.data || []) : [];
    });
  }

  addContract() {
    if (!this.entity?.id) return;
    this.contractEdit = {
      employeeId: this.entity.id, branchId: this.entity.branchId,
      workLocation: this.entity.workLocationName, isActived: true,
      contractDate: moment().format('DD/MM/YYYY')
    };
    this.showContractForm = true;
  }

  // chọn loại HĐ -> tự sinh số + prefill ngày theo chuỗi (TV/XĐ/KXĐ)
  onChangeContractType(typeId: number) {
    if (!typeId || !this.contractEdit) return;
    const code = this.listContractType.find(t => t.id == typeId)?.categoryCode;
    let lastEnd: any = null;
    this.listContracts.forEach(c => {
      if (c.endDate) { const m = moment(c.endDate); if (!lastEnd || m.isAfter(lastEnd)) lastEnd = m; }
    });
    let start = (code === 'CT01' || !lastEnd) ? moment() : lastEnd.clone().add(1, 'day');
    let end = null;
    if (code === 'CT01') end = start.clone().add(2, 'months').subtract(1, 'day');
    else if (code === 'CT02') end = start.clone().add(12, 'months').subtract(1, 'day');
    // CT03 (KXĐ) / CT04 (khoán) -> không tự đặt ngày kết thúc

    this.contractEdit.contractDate = moment().format('DD/MM/YYYY');
    this.contractEdit.effectiveDate = start.format('DD/MM/YYYY');
    this.contractEdit.endDate = end ? end.format('DD/MM/YYYY') : null;

    this.contractService.getNextNumber(this.entity.branchId, start.year(), typeId)
      .subscribe((res: ResponseValue<ContractNumberSuggestion>) => {
        if ((res.code == '200' || res.code == '201') && res.data) this.contractEdit.contractNumber = res.data.suggestedNumber;
      });
  }

  editContract(row: EmployeeContract) {
    this.contractEdit = {
      ...row,
      contractDate: this._toVn(row.contractDate),
      effectiveDate: this._toVn(row.effectiveDate),
      endDate: this._toVn(row.endDate)
    };
    this.showContractForm = true;
  }

  saveContract() {
    const c = this.contractEdit;
    if (!c?.contractTypeId || !c.contractNumber || !c.effectiveDate) {
      this.notificationService.printErrorMessage('Cần chọn loại HĐ, số HĐ và ngày bắt đầu.');
      return;
    }
    this.savingChild = true;
    const obs = c.id ? this.contractService.update(c) : this.contractService.add(c);
    obs.subscribe((res: ResponseValue<any>) => {
      this.savingChild = false;
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
        this.showContractForm = false; this.contractEdit = null;
        this.loadContracts();
      } else this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
    }, () => { this.savingChild = false; });
  }

  setActiveContract(row: EmployeeContract) {
    this.contractService.setActive(row.id, this.entity.id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') this.loadContracts();
    });
  }

  deleteContract(row: EmployeeContract) {
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => {
      this.contractService.delete(row.id, this.entity.id).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') this.loadContracts();
      });
    });
  }

  cancelContract() { this.showContractForm = false; this.contractEdit = null; }

  selectedCDate(e, field: 'contractDate' | 'effectiveDate' | 'endDate') {
    if (this.contractEdit) this.contractEdit[field] = moment(e.start).format('DD/MM/YYYY');
  }

  // ============ TAB 3 — LƯƠNG & BHXH ============
  loadSalary() {
    if (!this.entity?.id) { this.listSalary = []; return; }
    this.salaryService.getByEmployee(this.entity.id).subscribe((res: ResponseValue<EmployeeSalary[]>) => {
      this.listSalary = (res.code == '200' || res.code == '201') ? (res.data || []) : [];
    });
  }

  addSalary() {
    if (!this.entity?.id) return;
    this.salaryEdit = { employeeId: this.entity.id, isActived: true, effectiveDate: moment().format('DD/MM/YYYY') };
    this.showSalaryForm = true;
  }

  editSalary(row: EmployeeSalary) {
    this.salaryEdit = { ...row, effectiveDate: this._toVn(row.effectiveDate) };
    this.showSalaryForm = true;
  }

  saveSalary() {
    const s = this.salaryEdit;
    if (!s || (s.mainSalary == null && s.insuranceSalary == null)) {
      this.notificationService.printErrorMessage('Cần nhập lương cơ bản hoặc lương đóng BHXH.');
      return;
    }
    this.savingChild = true;
    const obs = s.id ? this.salaryService.update(s) : this.salaryService.add(s);
    obs.subscribe((res: ResponseValue<any>) => {
      this.savingChild = false;
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
        this.showSalaryForm = false; this.salaryEdit = null;
        this.loadSalary();
      } else this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
    }, () => { this.savingChild = false; });
  }

  setActiveSalary(row: EmployeeSalary) {
    this.salaryService.setActive(row.id, this.entity.id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') this.loadSalary();
    });
  }

  deleteSalary(row: EmployeeSalary) {
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => {
      this.salaryService.delete(row.id).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') this.loadSalary();
      });
    });
  }

  cancelSalary() { this.showSalaryForm = false; this.salaryEdit = null; }

  selectedSDate(e) { if (this.salaryEdit) this.salaryEdit.effectiveDate = moment(e.start).format('DD/MM/YYYY'); }

  trackingClass(row: EmployeeContract): string {
    if (!row.endDate) return 'text-muted';
    if (row.daysToExpire != null && row.daysToExpire < 0) return 'label label-default';
    if (row.isExpiringSoon) return 'label label-danger';
    if (row.daysToExpire != null && row.daysToExpire <= 30) return 'label label-warning';
    return 'label label-success';
  }

  OnHidden() { this.CloseModal.emit(); }
  closeModalFile() { this.viewAttachFiles = false; }
  saveSuccessFile(_event: any) { }
}
