import { ApproverPermissionCustomersService } from './../../../services/hrm/training-document-managment/approver-permission-customers.service';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OtherCategories, Branch, User, Profile, ResponseValue } from '@app/shared/models';
import { ApproverPermissionCustomers } from '@app/shared/models/hrm/training-document-management/approver-permission-customers';
import { ApproverPermissions } from '@app/shared/models/hrm/training-document-managment/approver-permissions';
import { PermissionOvertime } from '@app/shared/models/permission-overtime';
import { NotificationService, OtherCategoriesService, AuthService, UtilityService, BranchService, UserService } from '@app/shared/services';
import { ApproverPermissionsService } from '@app/shared/services/hrm/training-document-managment/approver-permissions.service';
import { PermissionOvertimeService } from '@app/shared/services/permission-overtime.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-permission-training-document',
  templateUrl: './modal-permission-training-document.component.html',
  styleUrls: ['./modal-permission-training-document.component.css']
})
export class ModalPermissionTrainingDocumentComponent implements OnInit {

  public entity: ApproverPermissions;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = true;
  listBranch: Branch[] = [];
  arrayGroupL1: any[]=[{id:0,name:'Nhóm Lao động'},{id:1,name:'Nhóm Phần mềm'},{id:2,name:'Nhóm Nghiệp vụ'}];
  listGroupL2: OtherCategories[] = [];
  listDepartment: OtherCategories[] = [];
  listLevel=[{
    id: 1,
    name: 'Cấp 1'
  }, {
    id: 2,
    name: 'Cấp 2'

  }];
  listUser:User[]=[];

  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  
  constructor(
    private _notificationService: NotificationService
    , private _authService: AuthService
    , private _utilityService: UtilityService
    , private _service: ApproverPermissionsService
    , private _otherCategoriesService: OtherCategoriesService
    , private branchService:BranchService
    , private userService:UserService
    , private _approverPermissionsService: ApproverPermissionCustomersService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadBranch();
    this.loadUser();
  }
  loadBranch() {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listBranch = res.data;
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  loadApproverPermissionCustomers(approverPermissionId:number){
    this._approverPermissionsService.getById(approverPermissionId).subscribe((res: ResponseValue<ApproverPermissionCustomers[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity.customers = res.data;
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);              
      }              
    });
  }

  removeItem(id:number){
    this._approverPermissionsService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this._notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
        this.loadApproverPermissionCustomers(this.entity.id)
      }
      else {
        this._notificationService.printErrorMessage(res.message +  res.code);
      }
    });
  }
  onChangeGroupL1(event:any){
    if(event){
      let groupL1Id=event.id;
      if(groupL1Id===2){
        let params = new HttpParams();
        params = params.append('type', 'TRDOCTYPE');
        this.busy = this._otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
          debugger;
          if (res.code == '200' || res.code == '201') {
            this.listGroupL2 = res.data;
            
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
          }
        });
    }else{
      this.listGroupL2=[];
     }
    }
  }

  loadUser() {
    this.busy = this.userService.getAll().subscribe((res: User[]): void => {
        this.listUser = res
    });
  }

  add() {
    this.entity = {
      checked: false,step:1,groupL1Id:0,branchId:Number.parseInt(this.userLoged.branchId),
      customers:[],
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number) {
    this._service.getDetail(id).subscribe((res: ResponseValue<PermissionOvertime>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if(this.entity.groupL1Id===2){
          let params = new HttpParams();
          params = params.append('type', 'TRDOCTYPE');
          this.busy = this._otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
            if (res.code == '200' || res.code == '201') {
              this.listGroupL2 = res.data;          
            }     
            else {
              this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
            }
          });
        }else{
          this.listGroupL2=[];
        }
        this.loadApproverPermissionCustomers(this.entity.id);
        this.flagXem = true;
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
        this._service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(true);
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

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
