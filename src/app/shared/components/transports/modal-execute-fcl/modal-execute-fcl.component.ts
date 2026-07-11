import { Component, EventEmitter, Output, ViewChild, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { MessageContstants } from "@app/shared/constants";
import { FormatContstants } from "@app/shared/constants/format.constants";
import { Profile, Fee, ResponseValue } from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { DispatchOrderFcl } from "@app/shared/models/fcl/dispatch-order-fcl";
import { DispatchOrderAttachfiles } from "@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles";
import { DispatchOrderFee } from "@app/shared/models/transports/dispatchorders/dispatch-order-fee";
import { Dispatchorder } from "@app/shared/models/transports/dispatchorders/dispatchorder";
import { AuthService, NotificationService, UtilityService, FeeService, VihicleService } from "@app/shared/services";
import { VehicleOilQuota } from "@app/shared/models/danhmuc/vehicle-oil-quota.model";
import { DispatchOrderFclService } from "@app/shared/services/fcl/dispatch-order-fcl.service";
import { DispatchordersService } from "@app/shared/services/transports/dispatchorders.service";
import { HttpParams } from "@angular/common/http";
import * as moment from "moment";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { ModalConfirmDenyClosingFclComponent } from "../modal-confirm-deny-closing-fcl/modal-confirm-deny-closing-fcl.component";
import { ModalViewShippingTaskComponent } from "../modal-view-shipping-task/modal-view-shipping-task.component";
import { environment } from "@environments/environment";

/**
 * Màn THỰC HIỆN lệnh FCL mới (isLegacy=0).
 * Khung tách song song khỏi modal-perform-fcl cũ — KHÔNG sửa cũ.
 * Mọi field readonly NGOẠI TRỪ: chi phí (listFee), checkbox trốn vé (listEtc.isPassed),
 * nút "POD" + nút "Ảnh hiện trường" (đều mở modal-attachfile có sẵn của ERP).
 */
@Component({
  selector: "modal-execute-fcl",
  templateUrl: "./modal-execute-fcl.component.html",
  styleUrls: ["./modal-execute-fcl.component.scss"],
})
export class ModalExecuteFclComponent implements OnInit {
  entity: DispatchOrderFcl = {};
  userLoged: Profile;
  busy: Subscription;
  flagXem = false;

  // permissions
  closing_permission = false;
  accept_permission = false;
  admin_permission = false;

  // lookups (chỉ phần thực sự cần — fee cho dropdown chi phí)
  listFee: Fee[] = [];
  // Định mức dầu của xe — để map payloadWeight (tier id) → tên bậc định mức ("18-20 tấn")
  listOilQuota: VehicleOilQuota[] = [];

  // 2 list ảnh đính kèm — phân biệt qua cờ isPod (TRUE=POD, FALSE=ảnh hiện trường)
  listPod: DispatchOrderAttachfiles[] = [];
  listAttachFile: DispatchOrderAttachfiles[] = [];

  // child modals
  viewAttachFiles = false;        // modal-attachfile chung (cho cấp shipping task)
  viewModalShippingTask = false;
  viewConfirm = false;

  maskNumber = UtilityService.maskNumber;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();

  @ViewChild("modalExecuteFcl", { static: false }) modalExecuteFcl: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalConfirmDenyClosingFclComponent, { static: false }) modalConfirm: ModalConfirmDenyClosingFclComponent;
  @ViewChild(ModalViewShippingTaskComponent, { static: false }) modalAddShippingTask: ModalViewShippingTaskComponent;

  constructor(
    private _authService: AuthService,
    private notificationService: NotificationService,
    private dispatchOrderService: DispatchOrderFclService,
    private dispatchordersService: DispatchordersService, // cho 3 API attach file (chung BE với TO)
    private feeService: FeeService,
    private _vihicleService: VihicleService, // nạp định mức dầu của xe để hiện tên bậc tải trọng
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    const perms: string[] = typeof this.userLoged.permissions == "string"
      ? JSON.parse(this.userLoged.permissions)
      : this.userLoged.permissions;
    this.closing_permission = perms.indexOf("DISPATCHORDER_CLOSING") !== -1;
    this.accept_permission = perms.indexOf("DISPATCHORDER_ACCEPT") !== -1;
    this.admin_permission = this.userLoged.isAdmin;
    this.loadFee();
  }

  /** Tải danh sách phí (CP01/CP02/CP03) cho dropdown ở bảng chi phí. */
  loadFee(): void {
    const params = new HttpParams();
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(f => ["CP01", "CP02", "CP03"].includes(f.groupCode)) || [];
      this.listFee = filtered.map(f => ({ ...f, feeName: `${f.feeCode}-${f.feeName}` }));
    });
  }

  /** Nạp bậc định mức dầu của xe lệnh — để hiển thị TÊN bậc tải trọng thay vì id. */
  loadOilQuota(): void {
    this.listOilQuota = [];
    if (!this.entity.vehicleId) return;
    this._vihicleService.getDetail(this.entity.vehicleId).subscribe((res: ResponseValue<any>) => {
      if (res.code === "200" || res.code === "201") {
        this.listOilQuota = res.data?.listOilQuota || [];
      }
    });
  }

  /** payloadWeight trên segment/cung phát sinh là ID bậc định mức dầu → trả về tên bậc ("18-20 tấn"). */
  payloadLabel(payloadWeight: any): string {
    if (payloadWeight == null) return "";
    const quota = this.listOilQuota.find(x => x.id === payloadWeight);
    return quota?.oilQuotaName ?? "";
  }

  /** Mở modal — dùng endpoint mới `getDetailWithTo` (FCL mới + segments + extras). */
  edit(refNo: string, flag: boolean): void {
    this.dispatchOrderService.getDetailWithTo(refNo).subscribe((res: ResponseValue<DispatchOrderFcl>) => {
      if (res.code === "200" || res.code === "201") {
        this.entity = res.data;
        this.entity.listEtc = this.entity.listEtc ?? [];
        this.entity.listFee = this.entity.listFee ?? [];
        this.loadOilQuota();
        this.flagXem = flag;
        if (!this.flagXem) {
          // chỉ chủ lệnh / admin / có quyền accept mới được nhập thực hiện
          if (!this.userLoged.isAdmin && !this.accept_permission && this.userLoged.id !== this.entity.createdBy) {
            this.flagXem = true;
          }
        }
        if (this.entity.inquiryTimeToTheFactory) {
          this.entity.inquiryTimeToTheFactory = moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN);
        }
        if (this.entity.inquiryTimeToThePorts) {
          this.entity.inquiryTimeToThePorts = moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN);
        }
        this.loadPod();
        this.loadAttackFiles();
        this.modalExecuteFcl.show();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  // ===== POD & Ảnh hiện trường — 2 list RIÊNG, phân biệt cờ isPod =====
  loadPod(): void {
    if (!this.entity.refNo) return;
    const p: DispatchOrderAttachfiles = { refNo: this.entity.refNo, isPod: true };
    this.dispatchordersService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code === '200' || res.code === '201' || res.code === '204') {
        this.listPod = res.data ?? [];
      }
    });
  }

  loadAttackFiles(): void {
    if (!this.entity.refNo) return;
    const p: DispatchOrderAttachfiles = { refNo: this.entity.refNo, isPod: false };
    this.dispatchordersService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code === '200' || res.code === '201' || res.code === '204') {
        this.listAttachFile = res.data ?? [];
      }
    });
  }

  onPodChanged(event: any): void {
    if (!event?.target?.files?.length || !this.entity.refNo) return;
    const file: File = event.target.files[0];
    const p: DispatchOrderAttachfiles = { refNo: this.entity.refNo, isPod: true };
    this.busy = this.dispatchordersService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code === '200' || res.code === '201') {
        this.listPod = res.data ?? [];
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
      } else {
        this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
      }
      event.target.value = ''; // reset input để upload lại file cùng tên được
    });
  }

  onAttachFileChanged(event: any): void {
    if (!event?.target?.files?.length || !this.entity.refNo) return;
    const file: File = event.target.files[0];
    const p: DispatchOrderAttachfiles = { refNo: this.entity.refNo, isPod: false };
    this.busy = this.dispatchordersService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code === '200' || res.code === '201') {
        this.listAttachFile = res.data ?? [];
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
      } else {
        this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
      }
      event.target.value = '';
    });
  }

  deletePod(item: DispatchOrderAttachfiles): void {
    this.notificationService.printConfirmationDialog('Xóa POD này?', () => {
      this.busy = this.dispatchordersService.deleteAttachFile(item).subscribe((res: ResponseValue<any>) => {
        if (res.code === '200' || res.code === '201') {
          this.loadPod();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
        }
      });
    });
  }

  deleteAttach(item: DispatchOrderAttachfiles): void {
    this.notificationService.printConfirmationDialog('Xóa ảnh này?', () => {
      this.busy = this.dispatchordersService.deleteAttachFile(item).subscribe((res: ResponseValue<any>) => {
        if (res.code === '200' || res.code === '201') {
          this.loadAttackFiles();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
        }
      });
    });
  }

  /** Đính kèm theo SHIPPING TASK — dùng modal-attachfile chung (giữ như cũ). */
  attackTask(taskId: number): void {
    this.viewAttachFiles = true;
    const item: Attachfiles = { frmName: 'SHIPPINGTASK', functionName: 'SHIPPINGTASK', refNo: taskId.toString() };
    setTimeout(() => this.modalAttackFiles.edit(item, this.entity.createdBy !== this.userLoged.id), 50);
  }

  clickLink(item: DispatchOrderAttachfiles): void {
    const url = environment.apiUrl + (item.pathFile ?? '').replace("~", "");
    window.open(url, "_blank");
  }

  // ===== Bảng chi phí (editable) =====
  feeCodeChanged(item: DispatchOrderFee, event: Fee): void { item.feeId = event?.id; }
  changeCost(item: DispatchOrderFee): void { item.totalCost = (item.cost ?? 0) + (item.vat ?? 0); }
  addFee(): void {
    this.entity.listFee = this.entity.listFee ?? [];
    this.entity.listFee.push({ contents: "", cost: 0, vat: 0, totalCost: 0 } as DispatchOrderFee);
  }
  deleteFee(item: DispatchOrderFee): void {
    const i = this.entity.listFee.indexOf(item);
    if (i !== -1) this.entity.listFee.splice(i, 1);
  }

  // ===== Trốn vé (chỉ toggle isPassed) =====
  toggleEtcPassed(item: any): void {
    if (this.flagXem) return;
    item.isPassed = !item.isPassed;
  }

  // ===== Shipping task view =====
  viewCongviec(id: number): void {
    this.viewModalShippingTask = true;
    setTimeout(() => this.modalAddShippingTask.edit(id.toString(), true), 50);
  }
  closeModalShippingTask(): void { this.viewModalShippingTask = false; }

  // ===== Lưu / Workflow =====
  /** Tài xế lưu thông tin (km đầu/cuối + ghi chú + chi phí + trốn vé) hoặc kết thúc. */
  update(finished: boolean): void {
    if (this.entity.startVehicleOdor != null && this.entity.finishVehicleOdor != null) {
      if (this.entity.startVehicleOdor >= this.entity.finishVehicleOdor) {
        this.notificationService.printErrorMessage(
          "Số km đầu vào không được lớn hơn hoặc bằng số km đầu ra!"
        );
        return;
      }
    }
    const copy = Object.assign({}, this.entity);
    copy.finished = finished;
    this.dispatchOrderService.driverUpdate(copy).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code === "200" || res.code === "201") {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
          this.modalExecuteFcl.hide();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      },
      () => this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG)
    );
  }

  // ===== Workflow v2 (2026-07-11): lái xe thao tác qua ChangeStatus (SP mới), KHÔNG dùng updateState =====
  //   1 Nhận (1→2) · 2 Hoàn thành (2→3) · 5 Từ chối nhận (1→1 IsDeny). SP tự kiểm @EmployeeId=DriverId.
  private _changeStatus(actionType: number, reason: string = null): void {
    this.busy = this.dispatchOrderService.changeStatus(this.entity.refNo, actionType, reason).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code === "200" || res.code === "201") {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
          this.modalExecuteFcl.hide();
        } else {
          this.notificationService.printErrorMessage(res.message || (MessageContstants.GETDATA_ERR_MSG + "\n" + res.code));
        }
      },
      () => this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG)
    );
  }
  // Nhận lệnh (1→2).
  nhanlenh(): void { this._changeStatus(1); }
  // Từ chối nhận lệnh (1→1, IsDeny) — lý do BẮT BUỘC.
  tuchoinhanlenh(): void {
    let reason = prompt("Lý do từ chối nhận lệnh", "");
    if (reason == null) return;
    reason = reason.trim();
    if (!reason) { this.notificationService.printErrorMessage("Vui lòng nhập lý do từ chối."); return; }
    this._changeStatus(5, reason);
  }
  // Hoàn thành lệnh (2→3): lưu km/chi phí (driverUpdate) rồi đổi trạng thái.
  hoanThanhLenh(): void {
    if (this.entity.startVehicleOdor != null && this.entity.finishVehicleOdor != null
        && this.entity.startVehicleOdor >= this.entity.finishVehicleOdor) {
      this.notificationService.printErrorMessage("Số km đầu vào không được lớn hơn hoặc bằng số km đầu ra!");
      return;
    }
    const copy = Object.assign({}, this.entity);
    copy.finished = true;
    this.notificationService.printConfirmationYesNo("Xác nhận HOÀN THÀNH lệnh?", () => {
      this.dispatchOrderService.driverUpdate(copy).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code === "200" || res.code === "201") this._changeStatus(2);
          else this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        },
        () => this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG)
      );
    }, () => { });
  }

  checkChenhlech(): boolean {
    if (this.entity.listFee?.some(x => (x.cost ?? 0) > 0 && x.feeId !== environment.fuelFeeId)) return true;
    if (this.entity.listEtc?.some(x => x.isPassed && (x.cost ?? 0) > 0)) return true;
    return false;
  }
  // chotdulieu()/status-4 đã bỏ ở v2 — Duyệt B1 (3→5) + Chốt (5→6) do điều vận/người chốt làm ở modal tạo lệnh.
  // tuchoichotdulieu()/saveSuccess() bên dưới là code cũ (status 4), nút đã gỡ khỏi footer → không còn tới được.
  tuchoichotdulieu(): void {
    this.viewConfirm = true;
    setTimeout(() => this.modalConfirm.edit(), 50);
  }
  saveSuccess(event: any): void {
    const item = Object.assign({}, this.entity);
    item.feedback = event.feedback;
    this.dispatchOrderService.updateState(item, true, event.valueReturn).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code === "200" || res.code === "201") {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
          this.modalExecuteFcl.hide();
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      },
      () => this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG)
    );
  }

  closeModalAttachFiles(): void { this.viewAttachFiles = false; }
  closeModalConfirm(): void { this.viewConfirm = false; }

  saveChange(_form: NgForm): void { /* dummy — submit by buttons */ }

  OnHidden(): void { this.CloseModal.emit(); }
}
