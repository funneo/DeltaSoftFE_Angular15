import { ModalAttachfileComponent } from './../../systems/modal-attachfile/modal-attachfile.component';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Customer, Employee, ResponseValue, Debt, DebtDetail, Supplier, OtherCategories, DebitNotes } from '@app/shared/models';
import { NotificationService, BranchService, CustomerService, AuthService, UtilityService, EmployeeService, AccountListService, OtherCategoriesService, DebtService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SupplierService } from '@app/shared/services/supplier.service';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-debt-debitnotes',
  templateUrl: './modal-debt-debitnotes.component.html',
  styleUrls: ['./modal-debt-debitnotes.component.css']
})
export class ModalDebtDebitnotesComponent implements OnInit {
  entity: Debt;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId: number;
  viewAttachFiles=false;
  _invoiceDate: string = moment(new Date()).format('DD/MM/YYYY');
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listCustomers: Customer[];
  listSupplier: Supplier[];
  listGType: OtherCategories[];
  flagLink: boolean = false;
  listDetails: DebtDetail[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private debtService: DebtService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService, private accountListService: AccountListService,
    private _utilityService: UtilityService, private customerService: CustomerService, private otherCategoriesService: OtherCategoriesService, private suppliertSerive: SupplierService
  ) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
  }

  ngOnInit(): void {

    this.loadChiNhanh();
    this.loadEmployee();
    this.loadOtherCategory();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
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
  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'DEBT',
      functionName: 'DEBT',
      refNo: this.entity.refNo
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this._branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'DEBT');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listGType = res.data;
    });
  }

  selectedDate(event) {
    this._invoiceDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this._invoiceDate == null)
      this._invoiceDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(item: DebitNotes) {
    this.loadCustomer()
    this.entity = {
      status: true,
      branchId: this._branchId,
      employeeId: this._employeeId,
      refType: 'C',
      jobId:item.jobId,
      documentNo:item.debitNo,
      type: 0,
      totalDebit:0,
      refDate: moment(new Date()).format('DD/MM/YYYY'),
      customerId:item.customerId,documentType:'DEBIT'
    };
    this.listDetails = [];
    item.debitNoteDetails.forEach(it=>{
      let gtype='';
      const code = it?.feeCode || '';
      if (code.startsWith('DT01')) {
        gtype = 'DT01';
      } else if (code.startsWith('CP03')) {
        gtype = 'CP03';
      }
      let value:DebtDetail={
        content:it.feeName,
        amount:it.amountAfterVAT,
        gType:gtype
      }
      this.entity.totalDebit+=it.amountAfterVAT;
      this.listDetails.push(value);
    })
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this._invoiceDate)
        this.entity.refDate = moment(this._invoiceDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      this.entity.debtDetails = this.listDetails.filter(
        (x) => x.content != '' && x.amount != 0
      );
        this.debtService.addfromDebitnotes(this.entity).subscribe((res: ResponseValue<any>) => {
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
  }

  thanhTien(item: DebtDetail): void {
    this.tongTien();
  }

  tongTien(): void {
    let tongTien = 0;
    this.listDetails.forEach(x => tongTien += x.amount);
    if (this.entity.type == 0) {
      this.entity.totalDebit = tongTien;
      this.entity.totalCredit = 0
    }
    else if (this.entity.type == 1) {
      this.entity.totalDebit = 0;
      this.entity.totalCredit = tongTien;
    }
    else {
      this.entity.totalDebit = 0;
      this.entity.totalCredit = 0
    }
  }

  changedVat() {
    this.tongTien();
  }

  inputTen() {
    if (this.listDetails?.length == 0) {
      let item: DebtDetail = {
        tempId: 1,
        content: '',
        amount: 0
      };
      this.listDetails.push(item);
    } else {
      let i = this.listDetails.length;
      let arrayId = this.listDetails?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });

      let item = this.listDetails.find((x) => x.tempId == maxId);
      if (item && (item.content != '')) {
        let item: DebtDetail = {
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

  OnHidden() {
    this.CloseModal.emit();
  }
  closeModalAttachFiles(){
    this.viewAttachFiles=false;
  }


}
