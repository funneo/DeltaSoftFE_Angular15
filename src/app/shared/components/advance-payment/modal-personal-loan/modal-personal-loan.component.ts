import { ModalAttachfileComponent } from './../../systems/modal-attachfile/modal-attachfile.component';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { PersonalLoan, Branch,  Employee, ResponseValue, AdvanceGroup } from '@app/shared/models';
import { NotificationService, PersonalLoanService, BranchService,  AuthService, UtilityService, EmployeeService, AdvanceGroupService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-personal-loan',
  templateUrl: './modal-personal-loan.component.html',
  styleUrls: ['./modal-personal-loan.component.css']
})
export class ModalPersonalLoanComponent implements OnInit {
  entity: PersonalLoan;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  listGroup: AdvanceGroup[];
  groupId: number;
  _acc:boolean=false;
  _accept:boolean=false;
  _auth:number=5;
  _employeeId:number;
  _branchId:number;
  _levelPermissionAdvance: number;
  _hasPermissionAdvance: boolean = false;
  // _viewAll=2;
  _functionId=SystemContstants.LOAN;
  feedback: string;
  viewAttachFiles=false;
  listAdvanceGroupId: string[];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  constructor(private _notificationService: NotificationService, private personalLoanService: PersonalLoanService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService,
    private _utilityService: UtilityService, private advanceGroupService: AdvanceGroupService) {
      let user = this.authService.getLoggedInUser();
      this._auth=Number.parseInt(user.authorisationLevel);
      this._employeeId=Number.parseInt(user.employeeId);
      this._acc = this.authService.hasPermission('LOAN_ACCOUNT');
      this._accept = this.authService.hasPermission('LOAN_ACCEPT');
      this._branchId = Number.parseInt(user.branchId);
      this._levelPermissionAdvance = Number.parseInt(user.advanceConfirmLevel);
      this.listAdvanceGroupId = user.listAdvanceGroupId?.split(',');

      // let list: any[] =UtilityService.getLocalParams(SystemContstants.APPSETTING);
      // let i=list?.findIndex(x=>x.id==this._functionId);
      // if(i!=-1){
      //   this._viewAll=list[i].value;
      // }
  }

  ngOnInit(): void {
    this.loadChiNhanh();
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

  loadAdvanceGroup() {
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listGroup = res.data?.filter(x => x.type == 0);
    });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'PERSONALLOAN',
      functionName: 'PERSONALLOAN',
      refNo: this.entity.refNo
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  add() {
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listGroup = res.data?.filter(x => x.type == 0);
      if (this.listGroup?.length > 0)
        this.groupId = this.listGroup[0].id;
      else this.groupId = null;
      this.entity = {
        status: true,
        branchId: this._branchId,
        employeeId: this._employeeId,
        advanceGroupId: this.groupId,
        refDate: moment(new Date()).format('DD/MM/YYYY')
      };
      this.loadEmployee();
      this.flagXem = false;
      this.flagSave = false;
      this.modalAddEdit.show();
    });
  }

  edit(id: string, flag: boolean) {
    this.personalLoanService.getDetail(id).subscribe((res: ResponseValue<PersonalLoan>) => {
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
        this._branchId=this.entity.branchId;
        this.flagXem = flag;
        this.flagSave = false;
        this.loadEmployee();
        this.loadAdvanceGroup();
        //Xet quyen duyet
        if (this._accept && this.flagXem && this.entity.status && this._branchId == this.entity.branchId && this.entity.acceptStep < 2 && this._levelPermissionAdvance == this.entity.acceptStep + 1) {
          //**xet theo nhom phi vay neu can**//
          // let index = this.listAdvanceGroupId.findIndex(x => x == this.entity.advanceGroupId.toString());
          // if (index != -1) this._hasPermissionAdvance = true;
          this._hasPermissionAdvance=true;
        }
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
        this.personalLoanService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.personalLoanService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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

  changedAccept(event: boolean) {
    let item: PersonalLoan={
      id :this.entity.id,
      feedback : this.feedback,
      status : event
    };
    this.flagSave = true;
    this.personalLoanService.accept(item).subscribe((res: ResponseValue<any>) => {
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

  OnHidden() {
    this.CloseModal.emit();
  }
  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }

  // showFiles(){
  //   alert('File đính kèm!');
  // }
}
