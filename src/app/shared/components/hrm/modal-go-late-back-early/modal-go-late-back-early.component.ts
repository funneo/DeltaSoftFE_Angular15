import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { GolateBackearly } from '@app/shared/models/hrm/golate-backearly.model';
import { NotificationService, OtherCategoriesService, AuthService, UtilityService } from '@app/shared/services';
import { GolateBackearlyService } from '@app/shared/services/hrm/go-late-back-early.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-go-late-back-early',
  templateUrl: './modal-go-late-back-early.component.html',
  styleUrls: ['./modal-go-late-back-early.component.css']
})
export class ModalGoLateBackEarlyComponent implements OnInit {
  public entity: GolateBackearly;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;

  listDepartment: OtherCategories[] = [];
  viewAttachFiles: boolean = false;
  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;
  isChuyenduyet: boolean = true;
  listReason: OtherCategories[] = [];
  hasPermissionApproved = false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), false);
  l: Object[] = [];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private otherCategoriesService: OtherCategoriesService,
    private _authService: AuthService,
    private _utilityService: UtilityService,
    private _service: GolateBackearlyService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadOtherCategories();
  }

  loadOtherCategories() {
    const params = new HttpParams().set("type", "");
    this.busy = this.otherCategoriesService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDepartment = res.data.filter((x) => x.type == "DEPT");
          this.listReason = res.data.filter((x) => x.type == "HRM01");
        }
      });
  }

  add() {
    this.entity = {
      checked: false,
      isApprove: false,status:0,timesOff:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean, permission: boolean) {
    this._service
      .getDetail(id)
      .subscribe((res: ResponseValue<GolateBackearly>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.flagNew = false;
          this.flagXem = flag && !permission;
          this.flagSave = false;
          this.hasPermissionApproved = this.entity.isApprove;
          debugger;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this._service.create(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(true);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this._service.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      }
    }
  }

  //Chuyển duyệt
  approved(type: number) {
    let copy = Object.assign({}, this.entity);
      if (type == 1) {
        copy.status = 1;
        //chuyển duyệt thì lưu lại thông tin trước
        this._service.update(copy).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this._service
          .approved(this.entity, type)
          .subscribe((res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.SYSTEM_ERROR_MSG
              );
            }
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
