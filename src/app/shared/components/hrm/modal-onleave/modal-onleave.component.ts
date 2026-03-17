import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { MessageContstants } from "@app/shared/constants";
import { OtherCategories, Profile, ResponseValue } from "@app/shared/models";
import { OnleaveDetailed } from "@app/shared/models/hrm/onleave-detailed.model";
import { Onleave } from "@app/shared/models/hrm/onleave.model";
import {
  AuthService,
  NotificationService,
  OtherCategoriesService,
  UtilityService,
} from "@app/shared/services";
import { OnleaveService } from "@app/shared/services/hrm/onleave.service";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { FormatContstants } from "@app/shared/constants/format.constants";

@Component({
  selector: "modal-onleave",
  templateUrl: "./modal-onleave.component.html",
  styleUrls: ["./modal-onleave.component.css"],
})
export class ModalOnleaveComponent implements OnInit {
  public entity: Onleave;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;

  listDepartment: OtherCategories[] = [];
  viewAttachFiles: boolean = false;
  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;
  isChuyenduyet: boolean = true;
  listType: { id: number; label: string }[] = [
    { id: 0, label: "Sáng" },
    { id: 1, label: "Chiều" },
    { id: 2, label: "Ngày" },
  ];
  title: string = "Đăng ký phép cá nhân";
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
    private onLeaveService: OnleaveService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadDepartment();
  }

  loadDepartment() {
    const params = new HttpParams().set("type", "DEPT");
    this.busy = this.otherCategoriesService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDepartment = res.data;
        }
      });
  }

  newOnleave() {
    let item: OnleaveDetailed = {};
    this.entity.listOnLeaveDetailed.push(item);
  }

  deleteOnleave(i: number) {
    this.entity.listOnLeaveDetailed.splice(i, 1);
  }
  selectedNgaybatdau(item: OnleaveDetailed, event) {
    console.log(event);
    item.onLeaveDate = moment(event.start).format("DD/MM/YYYY");
  }
  closedNgaybatdau(item: OnleaveDetailed, event) {
    if (item.onLeaveDate == null)
      item.onLeaveDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  add(item: Onleave) {
    this.entity = item;
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.title=this.entity.type==0?"Đăng ký phép cá nhân":"Đăng ký làm việc online";
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean, permission: boolean) {
    this.onLeaveService
      .getDetail(id)
      .subscribe((res: ResponseValue<Onleave>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.entity.listOnLeaveDetailed.forEach((item) => {
            if (item.onLeaveDate) {
              item.onLeaveDate = moment(
                item.onLeaveDate,
                FormatContstants.DATETIMEEN
              ).format(FormatContstants.DATEVN);
            }
          });
          this.title=this.entity.type==0?"Đăng ký phép cá nhân":"Đăng ký làm việc online";
          this.flagNew = false;
          this.flagXem = flag && !permission;
          this.flagSave = false;
          this.hasPermissionApproved = this.entity.isApprove;
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
      if (this.entity.listOnLeaveDetailed.length < 1) return;
      //Kiểm tra xem ngày có hợp lệ hay không?
      this.entity.listOnLeaveDetailed.forEach((item) => {
        if (!moment(item.onLeaveDate, "DD/DD/YYYY", true).isValid()) {
          this._notificationService.printErrorMessage(
            MessageContstants.DATE_TIME_INPUT_NOT_CORRECT
          );
          return;
        }
      });
      // this.entity.branchId = Number.parseInt(this.userLoged.branchId);
      // this.entity.createdBy = this.userLoged.id;
      if (this.entity.id == undefined) {
        this.onLeaveService.add(this.entity, 0).subscribe(
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
        this.onLeaveService.update(this.entity, 0).subscribe(
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
    this.entity.approvedBy = this.userLoged.id;
    if (type == 1) {
      //chuyển duyệt thì lưu lại thông tin trước
      this.onLeaveService.update(this.entity, 1).subscribe(
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
      this.onLeaveService
        .approved(this.entity, type)
        .subscribe((res: ResponseValue<Onleave>) => {
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
