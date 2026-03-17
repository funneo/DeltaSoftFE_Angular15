import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { EmployeeLimit, Branch, ResponseValue, Employee } from '@app/shared/models';
import { NotificationService, EmployeeLimitService, BranchService, EmployeeService, AuthService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-employee-limit',
  templateUrl: './modal-employee-limit.component.html',
  styleUrls: ['./modal-employee-limit.component.css']
})
export class ModalEmployeeLimitComponent implements OnInit {

  public entity: EmployeeLimit;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listBranch: Branch[];
  listEmployee: Employee[];
  _branchId: number;
  maskNumber = UtilityService.maskNumber;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  // _listAll: EmployeeLimit[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private employeeLimitService: EmployeeLimitService, private _utilityService: UtilityService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.loadChiNhanh();         
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadNhanVien() {
    let params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
      // if (this._listAll != undefined && this._listAll.length != 0) {
      //   this.listEmployee = this.listEmployee.filter(x => this._listAll.findIndex(z => z.employeeId == x.id) == -1);
      // }
    });
  }

  // async getAsyncData() {
  //   let params = new HttpParams()
  //     .set('branchId', this._branchId?.toString());
  //   let result = await this.employeeLimitService.getAll(params).toPromise();
  //   this._listAll = result.data;
  // }

  add(item: any=null) {
    this._branchId=item?.branchId?? this._branchId;
    this.entity = {
      branchId: this._branchId,
      employeeId: item?.id,
      status: true
    };
    this.loadNhanVien();   
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.employeeLimitService.getDetail(id).subscribe((res: ResponseValue<EmployeeLimit>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.loadNhanVien();   
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
      if (this.entity.id == undefined) {
        this.employeeLimitService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res);
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
        this.employeeLimitService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res);
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

}
