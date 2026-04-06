import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Repayment, Branch, Employee, ResponseValue, PersonalLoan } from '@app/shared/models';
import { NotificationService, RepaymentService, BranchService, AuthService, UtilityService, EmployeeService, PersonalLoanService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
// import { ModalPhieuThuComponent } from '../../accounting/modal-phieu-thu/modal-phieu-thu.component';
// import { __read } from 'tslib';
import { SystemContstants } from '@app/shared/constants/SystemConstants';

@Component({
  selector: 'modal-repayment',
  templateUrl: './modal-repayment.component.html',
  styleUrls: ['./modal-repayment.component.css']
})
export class ModalRepaymentComponent implements OnInit {
  entity: Repayment;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  listPersonalLoan: PersonalLoan[];
  isComplete: boolean = false;
  listType: any[] = [{ id: 0, name: 'Trả bằng tiền mặt' }, { id: 1, name: 'Khấu trừ lương' }];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  viewAccounts: boolean = false;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  // _viewAll=2;
  _functionId=SystemContstants.LOAN;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  // @ViewChild(ModalPhieuThuComponent, { static: false }) modalAccounts: ModalPhieuThuComponent
  constructor(private _notificationService: NotificationService, private repaymentService: RepaymentService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService,
    private _utilityService: UtilityService, private personalLoanService: PersonalLoanService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('REPAYMENT_ACCOUNT');
    this._accept = this.authService.hasPermission('REPAYMENT_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);

    // let list: any[] =UtilityService.getLocalParams(SystemContstants.APPSETTING);
    // let i=list?.findIndex(x=>x.id==this._functionId);
    // if(i!=-1){
    //   this._viewAll=list[i].value;
    // }
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    // this.loadEmployee();
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

  changedEmployee(event: any) {
    this._employeeId = event.id;
    this.loadPersonalLoan();
  }

  changedPersonalLoan(event: PersonalLoan) {
    this.entity.amount = event.amount - event.amountRepayment;
  }

  loadPersonalLoan(id: string = null){
    if(Number.isNaN(this._employeeId)){
      return;
    }
    const params = new HttpParams()
      .set('employeeId', this._employeeId.toString())
      .set('id', id)
    this.personalLoanService.getAll(params).subscribe((res: ResponseValue<PersonalLoan[]>) => {
      this.listPersonalLoan = res.data;
      // this.listPersonalLoan = res.data.filter(x => x.amount - x.amountRepayment > 0 || x.id.toString() == id);
    });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(type: number) {
    //this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
    this.entity = {
      status: true,
      branchId: this._branchId,
      employeeId: this._employeeId,
      type: type,
      isComplete: false,
      refDate: moment(new Date()).format('DD/MM/YYYY')
    };
    this.loadPersonalLoan();
    this.loadEmployee();
    this.flagXem = false;
    this.flagSave = false;
    //Gắn quyền duyệt
    this._accept = false;
    this.modalAddEdit.show();
    // });
  }

  edit(id: string, flag: boolean) {
    this.repaymentService.getDetail(id).subscribe((res: ResponseValue<Repayment>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this.entity.refDate = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.isComplete = this.entity.isComplete;
        this._employeeId = this.entity.employeeId;
        this._branchId=this.entity.branchId;
        this.loadEmployee();
        this.loadPersonalLoan(this.entity.personalLoanId.toString());
        this.flagXem = flag || this.isComplete;
        this.flagSave = false;
        //Gắn quyền duyệt
        this._accept = (this._accept && this.flagXem && this.entity.status && this.entity.step == 0 ? true : false);
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
      if (this.entity.refDate)
        this.entity.refDate = moment(this.entity.refDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this.entity.id == undefined) {
        this.repaymentService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.repaymentService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  // showAccounts() {
  //   let item: any = {};
  //   item.groupType = 1;
  //   item.employeeId = this.entity.employeeId;
  //   item.amount = this.entity.amount;
  //   item.refNo = this.entity.refNo;
  //   item.notes = 'Trả nợ vay cá nhân';
  //   this.viewAccounts = true;
  //   setTimeout(() => {
  //     this.modalAccounts.add(item);
  //   }, 50);
  // }

  // saveSuccessAccounts(event: any): void {
  //   if (event > 0) {
  //     let item: Repayment = {
  //       id: this.entity.id,
  //       feedback: 'Completed',
  //       status: true
  //     };
  //     this.repaymentService.accept(item).subscribe((res: ResponseValue<any>) => {
  //       if (res.code == '200' || res.code == '201') {
  //         this.modalAddEdit.hide();
  //         this.SaveSuccess.emit(res.data);
  //       }
  //     });
  //   }
  // }

  // closeAccounts(): void {
  //   this.viewAccounts = false;
  // }

  accept(event: boolean) {
    let item: Repayment = {
      id: this.entity.id,
      status: event,
      feedback: ''
    };
    this.flagSave = true;
    this.repaymentService.accept(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this.SaveSuccess.emit(res.data);
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        this.flagSave = false;
      }
    }, () => {
      this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      this.flagSave = false;
    });
  }

  // showFiles() {
  //   alert('File đính kèm!');
  // }

}
