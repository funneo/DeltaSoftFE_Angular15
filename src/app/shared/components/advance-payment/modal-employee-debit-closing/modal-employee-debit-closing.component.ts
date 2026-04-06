import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Employee, Pagination, Profile, ReportViewModel, ResponseValue } from '@app/shared/models';
import { EmployeeDebitClosingDetail } from '@app/shared/models/advance-payments/employee-debit-closing-detail.model';
import { EmployeeDebitClosing } from '@app/shared/models/advance-payments/employee-debit-closing.model';
import { AuthService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { EmployeeDebitClosingService } from '@app/shared/services/advance-payment/employee-debit-closing.service';
import { environment } from '@environments/environment';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-employee-debit-closing',
  templateUrl: './modal-employee-debit-closing.component.html',
  styleUrls: ['./modal-employee-debit-closing.component.css']
})
export class ModalEmployeeDebitClosingComponent implements OnInit {
  entity: EmployeeDebitClosing;
  flagXem: boolean = false;
  flagSave: boolean = false;
  flagNew: boolean = false;
  busy: Subscription;
  maskNumber = UtilityService.maskNumber;
  isChecked = false;
  listEmployee: Employee[];
  listDebitCredit: EmployeeDebitClosingDetail[] = [];
  _branchId: number;
  _employeeId: number;
  _ngayLap: string = moment(new Date()).format('DD/MM/YYYY');
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  flagLink: boolean = false;
  selectedItem = false;
  isAdmin = false;
  hasPermissionApproved = false;
  isTransfer: boolean = false;
  userLoged: Profile;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private service: EmployeeDebitClosingService,
    private employeeService: EmployeeService, private authService: AuthService, private spinner: NgxSpinnerService,
    private _utilityService: UtilityService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._employeeId = Number.parseInt(this.userLoged.employeeId);
    this.hasPermissionApproved = this.authService.hasPermission('EDC_CLOSING') || this.userLoged.isAdmin;
    this.isAdmin = this.userLoged.isAdmin;
  }

  ngOnInit(): void {
    this.loadEmployee()
  }


  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedEmployee(event: Employee) {
    this._employeeId = event.id;
    this.entity.details = [];
    this.listDebitCredit = [];
    this.entity.previousDebit = 0;
    this.entity.debit = 0;
    this.entity.credit = 0;
    this.entity.debitBalance = 0;
    this.entity.contents = '';
    this.entity.note = '';
    this.spinner.show();
    this.service.check(this._employeeId).subscribe((res: ResponseValue<boolean>) => {
      if (res.code == '200' || res.code == '201') {
        let reval = res.data;
        if (reval) {
          this._notificationService.printAlert(MessageContstants.TITLE_INFO, MessageContstants.EMPLOYEE_DEBIT_CLOSING_REQUIED_ERROR);
          this.spinner.hide();
        } else {
          this.service.getDebitCredit({ id: this._employeeId, isTransfer: this.isTransfer } as any).subscribe((res: ResponseValue<EmployeeDebitClosing>) => {
            if (res.code == '200' || res.code == '201') {
              this.entity = res.data;
              this.entity.status = 0;
              this.entity.branchId = this._branchId;
              this.entity.employeeId = this._employeeId;
              this.entity.debit = 0;
              this.entity.credit = 0;
              this.entity.employeeFullName = event.employeeFullName;
              this.entity.isTransfer = this.isTransfer;
              this.entity.details?.forEach(it => {
                this.entity.debit += it.debit;
                this.entity.credit += it.credit;
              })
              this.entity.debitBalance = this.entity.previousDebit + this.entity.debit - this.entity.credit;
              this.listDebitCredit = this.entity.details;
              this.spinner.hide();
            }
            else {
              this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
              this.spinner.hide();
            }
          });
        }
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
        this.spinner.hide();
      }
    });
  }
  add(isTransfer: boolean = false) {
    this.isTransfer = isTransfer;
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.service.getDebitCredit({ id: this._employeeId, isTransfer: this.isTransfer } as any).subscribe((res: ResponseValue<EmployeeDebitClosing>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.entity.status = 0;
        this.entity.branchId = this._branchId;
        this.entity.employeeId = this._employeeId;
        this.entity.employeeFullName = this.userLoged.fullName;
        this.entity.isTransfer = this.isTransfer;
        this.entity.debit = 0;
        this.entity.credit = 0;
        this.entity.details?.forEach(it => {
          this.entity.debit += it.debit;
          this.entity.credit += it.credit;
        })
        this.entity.debitBalance = this.entity.previousDebit + this.entity.debit - this.entity.credit;
        this.listDebitCredit = this.entity.details;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  edit(id: number, flag: boolean, isTransfer: boolean = false) {
    this.isTransfer = isTransfer;
    this.service.getDetail(id).subscribe((res: ResponseValue<EmployeeDebitClosing>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this._branchId = this.entity.branchId;
        this._employeeId = this.entity.employeeId;
        this.listDebitCredit = this.entity.details;
        this.flagXem = flag;
        if (this.entity.status > 0) this.flagXem = true;
        this.flagSave = false;
        this.flagNew = false;
        this.loadEmployee();
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  exportExcel(): void {
    let type = 0;
    if (this.entity.id == undefined || this.flagNew) type = 1;
    this.busy = this.service.exportExcel(this.entity, type).subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
      if (res.code == '200' || res.code == '201') {
        var a = document.createElement("a");
        a.href = environment.apiUrl + res.data;
        a.download;
        a.click();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      let copiedObject = Object.assign({}, this.entity);
      if (this.isChecked) copiedObject.status = 1
      this.flagSave = true;
      if (this.entity.id == undefined || this.entity.id < 1) {
        this.service.add(copiedObject).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.entity.id = res.data;
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.modalAddEdit.hide();
            form.resetForm();
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code + res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.service.update(copiedObject).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.modalAddEdit.hide();
            form.resetForm();
            this.SaveSuccess.emit(1);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code + res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  approved(type: number) {
    this.service.accept(this.entity.id, this.entity.note, type).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.modalAddEdit.hide();
        this.SaveSuccess.emit(1);
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code + res.message);
        this.flagSave = false;
      }
    }, () => {
      this.flagSave = false;
    });
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }


  OnHidden() {
    this.CloseModal.emit();
  }


}
