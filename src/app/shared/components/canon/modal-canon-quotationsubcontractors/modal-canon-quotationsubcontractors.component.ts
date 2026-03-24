import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OtherCategories, Profile, ResponseValue, Supplier } from '@app/shared/models';
import { CanonQuotationsubcontractors } from '@app/shared/models/transports/canon-quotationsubcontractors.model';
import { CanonQuotationsubcontractorsdetailed } from '@app/shared/models/transports/canon-quotationsubcontractorsdetailed.model';
import { AuthService, NotificationService, UtilityService, OtherCategoriesService } from '@app/shared/services';
import { CanonQuotationsubcontractorsService } from '@app/shared/services/canon-quotationsubcontractors.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { CanonRoadService } from '@app/shared/services/canon-road.service';
import { CanonRoad } from '@app/shared/models/canon-road.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Permissions from "@app/shared/models/permissions.model";
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'modal-canon-quotationsubcontractors',
  templateUrl: './modal-canon-quotationsubcontractors.component.html',
  styleUrls: ['./modal-canon-quotationsubcontractors.component.css']
})
export class ModalCanonQuotationsubcontractorsComponent implements OnInit {
  public entity: CanonQuotationsubcontractors;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;
  public listSupplier: Supplier[] = [];
  public listVihicleType: OtherCategories[] = [];
  public listDetailed: CanonQuotationsubcontractorsdetailed[] = [];
  public userLoged: Profile;
  public busy: Subscription;
  public branchId?: number;
  hasPermissionApproved = false;
  acceptPermission = false;
  adminPermission = false;
  permission: Permissions;
  mask0 = UtilityService.mask0;
  maskNumber = UtilityService.maskNumber;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  extendValidUntil: string;

  public detailEntity: CanonQuotationsubcontractorsdetailed;
  public listCanonRoad?: CanonRoad[];
  public flagDetailNew: boolean = false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) public modalAddEdit: ModalDirective;
  @ViewChild('modalDetailed', { static: false }) public modalDetailed: ModalDirective;
  @ViewChild('modalExtend', { static: false }) public modalExtend: ModalDirective;

  constructor(
    private _notificationService: NotificationService,
    private supplierService: SupplierService,
    private quotationService: CanonQuotationsubcontractorsService,
    private _authService: AuthService,
    private vihicleTypeService: OtherCategoriesService,
    private _utilityService: UtilityService,
    private canonRoadService: CanonRoadService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    const permiss: string[] = typeof (this.userLoged.permissions) == "string" ? JSON.parse(this.userLoged.permissions) : this.userLoged.permissions;
    this.acceptPermission = permiss.findIndex(x => x === 'F038_ACCEPT') != -1;
    this.adminPermission = this.userLoged.isAdmin ?? false;
    this.hasPermissionApproved = this.acceptPermission || this.adminPermission;
    this.loadSupplier();
    this.loadVihicleType();
    this.loadCanonRoad();
  }

  selectedNgaybatdau(event) {
    this.entity.validUntil = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgaybatdau(event) {
    if (this.entity.validUntil == null)
      this.entity.validUntil = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  loadSupplier() {
    const params = new HttpParams().set('branchid', this.userLoged.branchId.toString());
    this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data;
      }
    });
  }

  loadVihicleType() {
    const params = new HttpParams().set('type', 'VIHITYPE');
    this.busy = this.vihicleTypeService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVihicleType = res.data;
      }
    });
  }

  loadCanonRoad() {
    const params = new HttpParams();
    this.busy = this.canonRoadService.getAll(params).subscribe((res: ResponseValue<CanonRoad[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCanonRoad = res.data;
      }
    });
  }

  add() {
    this.entity = { checked: false, status: 0, canonQuotationSubcontractorsDetaileds: [], isApproved: false, isActived: false };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.listDetailed = [];
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean, permission: boolean) {
    this.quotationService.getDetail(id).subscribe((res: ResponseValue<CanonQuotationsubcontractors>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        if (this.entity.isApproved) this.flagXem = true;
        this.flagSave = false;
        this.hasPermissionApproved = permission;
        this.listDetailed = this.entity.canonQuotationSubcontractorsDetaileds || [];
        if (this.entity.validUntil) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(
              moment(this.entity.validUntil, FormatContstants.DATEEN).format(
                FormatContstants.DATEEN
              )
            )
          );
          this.entity.validUntil = moment(
            this.entity.validUntil,
            FormatContstants.DATEEN
          ).format(FormatContstants.DATEVN);
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
      this.entity.branchId = Number.parseInt(this.userLoged.branchId);
      this.entity.createdBy = this.userLoged.id;
      this.entity.canonQuotationSubcontractorsDetaileds = this.listDetailed;

      // Nếu chọn kích hoạt thì chuyển status thành 1 (Chờ duyệt)
      if (this.entity.isActived) {
        this.entity.status = 1;
      }

      if (this.entity.id == undefined) {
        this.quotationService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
      else {
        this.quotationService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  changedAccept(flag: boolean) {
    if (flag) {
      this.quotationService.setApproved(this.entity, 1).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this._notificationService.printSuccessMessage('Đã duyệt báo giá!');
          this.SaveSuccess.emit(true);
          this.modalAddEdit.hide();
        } else {
          this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
        }
      });
    } else {
      // Từ chối - yêu cầu nhập lý do
      this._notificationService.printPromptDialog('Vui lòng nhập lý do từ chối:', (reason: string) => {
        if (reason) {
          this.entity.reason = reason;
          this.quotationService.setApproved(this.entity, -1).subscribe((res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this._notificationService.printSuccessMessage('Đã từ chối báo giá!');
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            } else {
              this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
            }
          });
        }
      });
    }
  }

  changedStatus() {
    this._notificationService.printConfirmationDialog('Bạn có chắc chắn muốn chuyển duyệt báo giá này?', () => {
      this.quotationService.setApproved(this.entity, 0).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200') {
          this._notificationService.printSuccessMessage('Chuyển duyệt thành công!');
          this.SaveSuccess.emit(true);
          this.modalAddEdit.hide();
        } else {
          this._notificationService.printErrorMessage(res.code + '\n' + res.message);
        }
      });
    });
  }

  toggleLock() {
    const isLocking = !this.entity.isLocked;
    const actionName = isLocking ? 'khóa' : 'mở khóa';
    this._notificationService.printConfirmationDialog('Bạn có chắc chắn muốn ' + actionName + ' báo giá này?', () => {
      this.quotationService.setLocked(this.entity.id, isLocking).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200') {
          this._notificationService.printSuccessMessage('Cập nhật trạng thái khóa thành công');
          this.entity.isLocked = isLocking;
          this.SaveSuccess.emit(true);
        } else {
          this._notificationService.printErrorMessage('Có lỗi xảy ra');
        }
      });
    });
  }

  openExtend() {
    if (this.entity.validUntil) {
      const m = moment(this.entity.validUntil, [FormatContstants.DATEVN, FormatContstants.DATEEN, moment.ISO_8601]);
      this.dateTimeOptions = this._utilityService.dateTimeOptionDays(m.isValid() ? m.toDate() : new Date(), false);
      this.extendValidUntil = m.isValid() ? m.format(FormatContstants.DATEVN) : this.entity.validUntil;
    } else {
      this.extendValidUntil = null;
      this.dateTimeOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
    }
    this.modalExtend.show();
  }

  selectedExtendValidUntil(event: any) {
    this.extendValidUntil = moment(event.start).format('DD/MM/YYYY');
  }

  closedExtendValidUntil(event: any) {
    if (this.extendValidUntil == null)
      this.extendValidUntil = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  saveExtend() {
    if (!this.extendValidUntil) {
      this._notificationService.printErrorMessage('Vui lòng chọn ngày có giá trị đến');
      return;
    }
    this.quotationService.extend(this.entity.id, this.extendValidUntil).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200') {
        this._notificationService.printSuccessMessage('Gia hạn báo giá thành công');
        this.entity.validUntil = this.extendValidUntil;
        this.modalExtend.hide();
        this.SaveSuccess.emit(true);
      } else {
        this._notificationService.printErrorMessage('Có lỗi xảy ra');
      }
    });
  }

  // DETAILED MODAL LOGIC

  addDetailed() {
    this.detailEntity = { price: 0, vat: 0, totalPrice: 0, checked: false };
    this.flagDetailNew = true;
    this.modalDetailed.show();
  }

  editDetailed(item: CanonQuotationsubcontractorsdetailed) {
    this.detailEntity = { ...item };
    this.flagDetailNew = false;
    this.modalDetailed.show();
  }

  deleteDetailed(item: CanonQuotationsubcontractorsdetailed) {
    let index = this.listDetailed.findIndex(x => x == item);
    if (index != -1) {
      this.listDetailed.splice(index, 1);
    }
  }

  vatChanged() {
    this.detailEntity.totalPrice = (Number(this.detailEntity.price) || 0) + (Number(this.detailEntity.vat) || 0);
  }

  canonRoadChange(item: CanonRoad) {
    this.detailEntity.canonRoadName = item?.name;
    this.detailEntity.canonRoadCode = item?.code;
  }

  saveDetailed(form: NgForm) {
    if (form.valid) {
      if (this.flagDetailNew && this.listDetailed.findIndex(x => x.canonRoadId == this.detailEntity.canonRoadId) >= 0) {
        this._notificationService.printErrorMessage("Cung đường này đã tồn tại, kiểm tra lại!");
      } else {
        let index = this.listDetailed.findIndex(x => x.canonRoadId == this.detailEntity.canonRoadId);
        if (index >= 0) {
          this.listDetailed[index] = { ...this.detailEntity };
        } else {
          this.listDetailed.push({ ...this.detailEntity });
        }
        this.modalDetailed.hide();
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
