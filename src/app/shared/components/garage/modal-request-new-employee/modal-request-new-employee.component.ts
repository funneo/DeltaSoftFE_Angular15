import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Branch, OtherCategories, Pagination, Profile, ResponseValue, User } from '@app/shared/models';
import { RequestNewEmployee } from '@app/shared/models/garage/request-new-employee';
import { NotificationService, AuthService, OtherCategoriesService, UtilityService, BranchService, UserService } from '@app/shared/services';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { RequestNewEmployeeService } from '@app/shared/services/garage/request-new-employee.service';
import { every } from 'rxjs/operators';

@Component({
  selector: 'modal-request-new-employee',
  templateUrl: './modal-request-new-employee.component.html',
  styleUrls: ['./modal-request-new-employee.component.css']
})
export class ModalRequestNewEmployeeComponent implements OnInit {
  public entity: RequestNewEmployee;
  public listBranch: Branch[];
  listDepartment: OtherCategories[] = [];
  listTitle: OtherCategories[] = [];
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listAccount: User[] = [];
  listSex = [{ id: false, name: "Nữ" }, { id: true, name: "Nam" }];
  viewModal = false;
  viewAttachFiles = false;
  pathImage = '';
  _acceptPermission = false;
  _hr = false;
  acceptPermission = false;
  // public dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  userLoged?: Profile;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  constructor(private _notificationService: NotificationService, private authService: AuthService,
    private _service: RequestNewEmployeeService,
    private _userService: UserService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService, private branchService: BranchService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._acceptPermission = this.authService.hasPermission('F033_ACCEPT');
  }

  loadAccount() {
    this._userService.getExternal().subscribe((res: User[]) => {
      this.listAccount = res;
    });
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadAccount();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  showPassword = false;
  accept() {
    if (this.entity.id && this.entity.status == 0 && this.entity.deltaERP_Username && this.entity.deltaERP_Username.length > 0) {
      this.notificationService.printConfirmationDialog(
        MessageContstants.CONFIRM_ACCEPT_GARAGE_ACCOUNT,
        () => {
          this._service.accept(this.entity).subscribe((res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalAddEdit.hide();
              // form.resetForm();
              this._notificationService.printSuccessMessage("Cấp tài khoản thành công!");
              this.SaveSuccess.emit(res.data);
            }
            else {
              this._notificationService.printErrorMessage("Cấp tài khoản thất bại!");
              this.flagSave = false;
            }
          }, (err) => {
            this._notificationService.printErrorMessage(err);
            this.flagSave = false;
          });
        })
    }
  }
  changeAccount(event:User) {
    if(event){
      this.entity.deltaERP_EmployeeId = event.employeeId      
      this.entity.deltaERP_Username = event.userName
      this.entity.deltaERP_UserId = event.id
    }else{
      this.entity.deltaERP_EmployeeId = null;
      this.entity.deltaERP_Username = '';
      this.entity.deltaERP_UserId = '';
    }
  }

  edit(id: number) {
    this._service.getDetail(id).subscribe((res: ResponseValue<RequestNewEmployee>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagSave = false;
        if (this.entity.dateOfBirth) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.dateOfBirth, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.dateOfBirth = moment(this.entity.dateOfBirth, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );

        }
                  
        this.entity.deltaERP_Password='Aa@123456'
        debugger;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this._service.accept(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this._service.update(this.entity).subscribe((res: ResponseValue<any>) => {
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

  closeModal(): void {
    this.viewModal = false;
  }
  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
}
