import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Deposit, Branch, Employee, ResponseValue, AdvanceGroup, OtherCategories} from '@app/shared/models';
import { NotificationService, DepositService, BranchService, AuthService, UtilityService, EmployeeService } from '@app/shared/services';
import {ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'modal-deposit',
  templateUrl: './modal-deposit.component.html',
  styleUrls: ['./modal-deposit.component.css']
})
export class ModalDepositComponent implements OnInit {
  entity: Deposit;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  listGroup: AdvanceGroup[];
  groupId: number;
  // branchId: number;
  // employeeId: number;
  // levelPermissionAdvance: number;
  // hasPermissionAdvance: boolean = false;
  // listAdvanceGroupId: string[];
  _acc:boolean=false;
  _accept:boolean=false;
  _auth:number=5;
  _employeeId:number;
  _branchId:number;
  feedback: string;
  listHangTaus:OtherCategories[];

  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  _ngay: string= moment(new Date()).format('DD/MM/YYYY');

  listType: any[] = [{ id: 0, name: 'Tiền mặt' }, { id: 1, name: 'Chuyển khoản' }];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private depositService: DepositService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService,
    private _utilityService: UtilityService) {

      let user = this.authService.getLoggedInUser();
      this._auth=Number.parseInt(user.authorisationLevel);
      this._employeeId=Number.parseInt(user.employeeId);
      this._acc = this.authService.hasPermission('DEPOSIT_ACCOUNT');
      this._accept = this.authService.hasPermission('DEPOSIT_ACCEPT');
      this._branchId = Number.parseInt(user.branchId);
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

  // loadEmployee() {
  //   const params = new HttpParams()
  //     .set('branchId', this._branchId?.toString())
  //   this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
  //     this.listEmployee = res.data;
  //   });
  // }

  selectedDate(event) {
    this._ngay = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this._ngay == null)
    this._ngay = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(type:number) {
      this.entity={status: true,branchId:this._branchId}
      this._accept=false;
      this.flagXem = false;
      this.flagSave = false;
      this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.depositService.getDetail(id).subscribe((res: ResponseValue<Deposit>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
         this._ngay = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.flagXem = flag;
        this.flagSave = false;
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
      if (this._ngay)
        this.entity.refDate = moment(this._ngay, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this.entity.id == undefined) {
        this.depositService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.depositService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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

  saveAccept(): void {
    this._notificationService.printConfirmationDialog('Bạn chắc chắc muốn thực hiện xác nhận này?', () =>{
      let item: Deposit = {
        id: this.entity.id,
        feedback: this.entity.isComplete?'Paymented': 'Completed',
        status: true
      };
      this.depositService.accept(item).subscribe((res: ResponseValue<any>) => {
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
    });
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
