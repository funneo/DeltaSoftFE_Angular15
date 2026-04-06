import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, OtherCategories, Profile, ResponseValue, User } from '@app/shared/models';
import { PermissionOvertime } from '@app/shared/models/permission-overtime';
import { AuthService, BranchService, NotificationService, OtherCategoriesService, UserService, UtilityService } from '@app/shared/services';
import { PermissionOvertimeService } from '@app/shared/services/permission-overtime.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-permission-overtime',
  templateUrl: './modal-permission-overtime.component.html',
  styleUrls: ['./modal-permission-overtime.component.css']
})
export class ModalPermissionOvertimeComponent implements OnInit {

  public entity: PermissionOvertime;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = true;


  listDepartment: OtherCategories[] = [];
  listBranch:Branch[]=[];
  listUser:User[]=[];

  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  
  constructor(
    private _notificationService: NotificationService
    , private otherCategoriesService: OtherCategoriesService
    , private _authService: AuthService
    , private _utilityService: UtilityService
    , private permissionOverTimeService: PermissionOvertimeService
    , private branchService:BranchService
    , private userService:UserService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadDepartment();
    this.loadBranch();
    this.loadUser();
  }


  loadDepartment() {
    const params = new HttpParams()
      .set('type', 'DEPT');
    this.busy = this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDepartment = res.data
      }
    });
  }
  loadBranch() {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listBranch = res.data
      }
    });
  }
  loadUser() {
    this.busy = this.userService.getAll().subscribe((res: User[]): void => {
        this.listUser = res
    });
  }

  add() {
    this.entity = {
      checked: false
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number) {
    this.permissionOverTimeService.getDetail(id).subscribe((res: ResponseValue<PermissionOvertime>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
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
        this.permissionOverTimeService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
