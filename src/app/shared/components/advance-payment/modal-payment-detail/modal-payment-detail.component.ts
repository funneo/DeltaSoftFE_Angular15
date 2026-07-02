import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import {
  Branch,
  Employee,
  Fee,
  OtherCategories,
  PaymentDetail,
  Payments,
  PermissionPayment,
  ResponseValue,
  Shipment,
  Supplier,
  Workflow,
} from "@app/shared/models";
import {
  AuthService,
  BranchService,
  EmployeeService,
  FeeService,
  NotificationService,
  OtherCategoriesService,
  PaymentsService,
  PermissionPaymentService,
  ShipmentService,
  UtilityService,
  WorkflowsService,
} from "@app/shared/services";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { ActivatedRoute } from "@angular/router";
import { RateExchangeService } from "@app/shared/services/categories/rate-exchange.service";
import { SupplierService } from "@app/shared/services/supplier.service";
import { HttpParams } from "@angular/common/http";
import { MessageContstants } from "@app/shared/constants";
import { FormatContstants } from "@app/shared/constants/format.constants";
import { NgForm } from "@angular/forms";
import { RateExchange } from "@app/shared/models/categories/rate-exchange.model";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { ModalDirective } from "ngx-bootstrap/modal";
import { DraftService } from "@app/shared/services/draft.service";

@Component({
  selector: "modal-payment-detail",
  templateUrl: "./modal-payment-detail.component.html",
  styleUrls: ["./modal-payment-detail.component.css"],
})
export class ModalPaymentDetailComponent implements OnInit {
  entity: Payments;
  flagXem: boolean;
  // Chế độ xem nháp (draft.DraftEntries) — read-only, nền vàng, nút "Xác nhận chuyển sang ERP".
  _isDraftView: boolean = false;
  _draftId: number;
  // Chế độ SỬA nháp (mở khóa form khi đang xem nháp) — vẫn là nháp, lưu ngược draft, KHÔNG promote.
  _isDraftEdit: boolean = false;
  _canEditDraft: boolean = false;   // suy từ quyền ERP PAYMENT_UPDATE
  _type: number;
  _wfId: number;
  _shipmentId: number;
  _ngay: string = moment(new Date()).format("DD/MM/YYYY");
  listDetail: PaymentDetail[];
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  listFee: Fee[];
  listWorkflow: Workflow[];
  listShipment: Shipment[];
  listType: any[] = [
    { id: 0, text: "Cá nhân" },
    { id: 1, text: "Nhà cung cấp" },
  ];
  listInvoice: any[] = [
    { id: 0, text: "Không" },
    { id: 1, text: "Có" },
    { id: 2, text: "NỢ" },
  ];
  _isChuyeduyet = false;
  _hasInvoice?: number;
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  _branchId: number;
  _listCurrency: OtherCategories[] = [];
  _employeeId: number;
  _levelPermissionPayment: number;
  _accept: boolean;
  _functionId = SystemContstants.PAYMENT;
  // _viewAll=2;
  _auth = 3;

  feedback: string;
  listPaymentFeeGroupIds: string[];
  listSupplier: Supplier[];
  viewListApprovedLog = false;
  viewListAdvances = false;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  listPermissionPM: PermissionPayment[];
  viewAttachFiles: boolean;
  _bangchu = "";
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  viewModalJob = false;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @Output() ApproveDraft: EventEmitter<number> = new EventEmitter();
  @Output() SavedDraft: EventEmitter<number> = new EventEmitter();
  constructor(
    private _utilityService: UtilityService,
    private _otherCategoryService: OtherCategoriesService,
    private authService: AuthService,
    private branchService: BranchService,
    private employeeService: EmployeeService,
    private paymentsService: PaymentsService,
    private feeService: FeeService,
    private _notificationService: NotificationService,
    permissionPaymentService: PermissionPaymentService,
    private workflowsService: WorkflowsService,
    private rateExchangeService: RateExchangeService,
    private suppliertSerive: SupplierService,
    private shipmentService: ShipmentService,
    private draftService: DraftService
  ) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
    this._levelPermissionPayment = Number.parseInt(user.paymentConfirmLevel);
    this._accept = this.authService.hasPermission("PAYMENT_ACCEPT");
    this.listPermissionPM = permissionPaymentService.getPermissionPM();
  }
  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadFee();
    this.loadOtherCategory();
    this.loadEmployee();
  }
  loadOtherCategory() {
    const params = new HttpParams().set("type", "CURRENCY");
    this._otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        this._listCurrency = res.data;
      });
  }
  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams().set("branchId", this._branchId?.toString());
    this.employeeService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        this.listEmployee = res.data;
      });
  }

  loadSupplier(): void {
    const params = new HttpParams().set("branchid", this._branchId.toString());
    this.busy = this.suppliertSerive
      .getAll(params)
      .subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listSupplier = res.data;
        } else {
          if (res.code == "204") {
            this.listSupplier = [];
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  loadWorkflow(): void {
    if (this._wfId != undefined && this._wfId != null && this._wfId != 0) {
      this.workflowsService
        .getDetail(this._wfId.toString())
        .subscribe((res: ResponseValue<Workflow>) => {
          let itemWf: Workflow = res.data;
          this.listWorkflow = [];
          this.listWorkflow.push({
            id: itemWf.id,
            jobName: itemWf.jobName,
            shipmentId: itemWf.shipmentId,
          });
          this._shipmentId = itemWf.shipmentId;
        });
    }
  }

  loadShipment(): void {
    if (
      this._shipmentId != undefined &&
      this._shipmentId != null &&
      this._shipmentId != 0
    ) {
      this.shipmentService
        .getDetail(this._shipmentId.toString())
        .subscribe((res: ResponseValue<Shipment>) => {
          let job: Shipment = res.data;
          this.listShipment = [];
          if (job.cdsNumber)
            job.jobId += "/Tk: " + job.cdsNumber.substring(0, 25);
          if (job.hawB_HBL) job.jobId += "/HBill: " + job.hawB_HBL;
          if (job.invoiceNo) job.jobId += "/Inv: " + job.invoiceNo;
          this.listShipment.push({ id: job.id, jobId: job.jobId });
        });
    }
  }

  loadFee() {
    const params = new HttpParams();
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(
        (_) =>
          _.groupCode == "CP01" ||
          _.groupCode == "CP02" ||
          _.groupCode == "CP03"
      ) || [];
      // Create completely new objects to prevent cache mutation
      this.listFee = filtered.map(fee => {
        const newFee: Fee = {
          id: fee.id,
          feeCode: fee.feeCode,
          feeName: fee.feeCode + "-" + fee.feeName,
          feeNameEnglish: fee.feeNameEnglish,
          groupFeeId: fee.groupFeeId,
          paymentFeeGroupId: fee.paymentFeeGroupId,
          revenueFeeGroupId: fee.revenueFeeGroupId,
          debitAccount: fee.debitAccount,
          creditAccount: fee.creditAccount,
          notes: fee.notes,
          status: fee.status,
          checked: fee.checked,
          groupName: fee.groupName,
          groupCode: fee.groupCode,
          paymentGroupName: fee.paymentGroupName,
          revenueGroupName: fee.revenueGroupName,
          isDef: fee.isDef
        };
        return newFee;
      });
    });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format("DD/MM/YYYY");
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  add(id: number) {
    this._isDraftView = false;
    this._isDraftEdit = false;
    this._wfId = id;
    this.loadWorkflow();
    this.loadShipment();
    this.loadSupplier();
    this.entity = {
      status: false,
      branchId: this._branchId,
      employeeId: this._employeeId,
      type: 1, //Thanh toán tiền mặt
      refDate: moment(new Date()).format("DD/MM/YYYY"),
      workflowId: this._wfId,
    };
    this.listDetail = [];
    this.inputTen();
    this.modalAddEdit.show();
  }

  /**
   * Xem 1 phiếu Thanh toán NHÁP (draft.DraftEntries.Payload) read-only — REUSE chính modal này.
   * flagXem=true (khóa nhập) + nền vàng + nút "Xác nhận chuyển sang ERP". KHÔNG gọi BE getDetail/lưu.
   * Payload là DTO tạo-thật site nháp gửi (header Payments + mảng paymentDetails).
   */
  viewDraft(payload: any, draftId: number): void {
    let p: any = payload;
    if (typeof payload === "string") {
      try { p = JSON.parse(payload || "{}"); } catch { p = {}; }
    }
    this.entity = (p || {}) as Payments;
    this._draftId = draftId;
    this._isDraftView = true;
    this._isDraftEdit = false;
    this._canEditDraft = this.authService.hasPermission("PAYMENT_UPDATE");
    this.flagXem = true;
    this.flagSave = false;
    this._isChuyeduyet = false;
    this._wfId = this.entity.workflowId;
    this._shipmentId = this.entity.shipmentId;
    if (this.entity.branchId) this._branchId = this.entity.branchId;
    const d = moment(this.entity.refDate, ["DD/MM/YYYY", "YYYY-MM-DD", moment.ISO_8601], false);
    this._ngay = d.isValid() ? d.format(FormatContstants.DATEVN) : moment(new Date()).format(FormatContstants.DATEVN);
    this.listDetail = this.entity.paymentDetails ?? [];
    if (this.listDetail.length) {
      this.listDetail.forEach((_) => { _.tempId = _.id ?? _.tempId; _.checked = false; });
    }
    // Nháp: payload đã kèm sẵn jobId → seed thẳng để hiện lô hàng ngay, không phụ thuộc BE getDetail.
    const jobIdFromPayload = (p && (p.jobId ?? p.JobId)) || null;
    if (this._shipmentId && jobIdFromPayload) {
      this.listShipment = [{ id: this._shipmentId, jobId: jobIdFromPayload }];
    } else {
      this.loadShipment();
    }
    this.loadWorkflow();
    this.loadEmployee();
    if (this.entity.type == 1) this.loadSupplier();
    this.modalAddEdit.show();
  }

  /** Mở khóa form để SỬA nháp (vẫn nền vàng, chưa promote). */
  editDraft(): void {
    if (!this._canEditDraft) return;
    this.flagXem = false;
    this._isDraftEdit = true;
  }

  /** Nút "Lưu nháp" — ghi ngược Payload đã sửa vào draft.DraftEntries (VẪN là nháp). */
  saveDraft(): void {
    if (this.flagSave) return;
    if (this._ngay) this.entity.refDate = this._ngay;   // đã dd/MM/yyyy (chuẩn nháp)
    this.entity.paymentDetails = this.listDetail?.filter((x) => x.feeId != undefined && x.feeId != null) ?? [];
    this.flagSave = true;
    this.draftService.updateDraft({
      id: this._draftId,
      payload: JSON.stringify(this.entity),
      customerName: this.entity.customerName || null,
      totalAmount: this.entity.totalAmount ?? null,
      refHint: this.entity.refNo || null,
    }).subscribe((res: ResponseValue<any>) => {
      if (res.code == "200") {
        this._notificationService.printSuccessMessage("Đã lưu nháp.");
        this.flagXem = true;
        this._isDraftEdit = false;
        this.SavedDraft.emit(this._draftId);
      } else {
        this._notificationService.printErrorMessage(res.message || MessageContstants.UPDATED_ERR_MSG);
      }
      this.flagSave = false;
    }, () => { this.flagSave = false; });
  }

  /** Nút "Xác nhận chuyển sang ERP" — duyệt nháp thành Thanh toán thật (BE addFromDraft, idempotent). */
  approveDraft(): void {
    if (this.flagSave) return;
    if (!this.entity?.shipmentId && !this.entity?.workflowId) {
      this._notificationService.printAlert("THÔNG BÁO", "Nháp thiếu lô hàng / công việc — không thể duyệt.");
      return;
    }
    this._notificationService.printConfirmationDialog(
      "Duyệt nháp này thành Thanh toán thật?", () => this._doApproveDraft());
  }

  private _doApproveDraft(): void {
    // Dựng entity giống save() (KHÔNG đụng save() để tránh ảnh hưởng luồng thật)
    if (this._ngay)
      this.entity.refDate = moment(this._ngay, FormatContstants.DATEVN).format(FormatContstants.CLIENTDATE);
    this.entity.paymentDetails = this.listDetail.filter((x) => x.feeId != undefined && x.feeId != null);
    if (!this.entity.paymentDetails?.length) {
      this._notificationService.printAlert("THÔNG BÁO", "Nháp chưa có mã phí — không thể duyệt.");
      return;
    }
    this.entity.id = undefined;   // ép tạo mới
    this.flagSave = true;
    this.paymentsService.addFromDraft(this.entity, this._draftId).subscribe((res: ResponseValue<any>) => {
      if (res.code == "200" || res.code == "201") {
        const refNo = res.data?.refNo;
        this._notificationService.printSuccessMessage(
          res.data?.alreadyPromoted
            ? ("Nháp đã được duyệt trước đó (Phiếu " + (refNo || "") + ")")
            : ("Đã duyệt thành Thanh toán " + (refNo || "")));
        this.modalAddEdit.hide();
        this.ApproveDraft.emit(this._draftId);
      } else {
        this._notificationService.printErrorMessage(res.message || MessageContstants.CREATED_ERR_MSG);
        this.flagSave = false;
      }
    }, () => { this.flagSave = false; });
  }

  edit(id: number, flag: boolean): void {
    this._isDraftView = false;
    this._isDraftEdit = false;
    this.paymentsService
      .getDetail(id)
      .subscribe((res: ResponseValue<Payments>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          // Map IsDirectPayment from PascalCase if necessary
          if (this.entity['IsDirectPayment'] !== undefined && this.entity.isDirectPayment === undefined) {
            this.entity.isDirectPayment = this.entity['IsDirectPayment'];
          }
          this._wfId = this.entity.workflowId;
          this._shipmentId = this.entity.shipmentId;
          this._branchId = this.entity.branchId;
          this._isChuyeduyet = this.entity.status;
          if (this.entity.refDate) {
            this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
              new Date(
                moment(this.entity.refDate, FormatContstants.DATEEN).format(
                  FormatContstants.DATEEN
                )
              ),
              false
            );
            this._ngay = moment(
              this.entity.refDate,
              FormatContstants.DATEEN
            ).format(FormatContstants.DATEVN);
          }
          this.listDetail = this.entity.paymentDetails ?? [];
          if (this.listDetail && this.listDetail.length != 0) {
            this.listDetail.every((_) => (_.tempId = _.id));
            this.listDetail.every((_) => (_.checked = false));
          }
          this.flagXem = flag;
          //Cập nhật lại là nếu chuyển duyệt rồi thì không cho phép thêm mới thanh toan nữa
          if (!this.flagXem && !this._isChuyeduyet) this.inputTen();
          this.flagSave = false;
          this.loadWorkflow();
          this.loadShipment();
          this.loadEmployee();
          if (this.entity.type == 1) this.loadSupplier();
          //Xet quyen duyet
          //1.Duyet theo khach hang
          //****Begin
          if (
            (this.listPermissionPM != null &&
              this.listPermissionPM.length == 0) ||
            this._levelPermissionPayment <= 0
          ) {
            this._accept = false;
          } else {
            let _b: boolean = false;
            // console.log(this.listPermissionPM);

            let listTheoKhachHang = this.listPermissionPM?.filter(
              (x) => x.type == 1
            );
            let listTheoMaPhi = this.listPermissionPM?.filter(
              (x) => x.type == 0
            );
            if (listTheoKhachHang?.length > 0) {
              if (
                listTheoKhachHang[0].listCustomerId
                  ?.split(",")
                  .findIndex((x) => x == this.entity.customerId.toString()) !=
                -1
              )
                _b = true;
              this.entity.paymentDetails.forEach((x) => (x.hasAccept = _b));
            } else {
              if (listTheoMaPhi?.length > 0) {
                this.listPaymentFeeGroupIds = [];
                listTheoMaPhi[0].listPaymentFeeGroupId
                  ?.split(",")
                  ?.forEach((z) => this.listPaymentFeeGroupIds.push(z));
              }
              if (this.listPaymentFeeGroupIds?.length != 0) {
                this.entity.paymentDetails.forEach((x) => {
                  if (
                    this.listPaymentFeeGroupIds.findIndex(
                      (_) => _ == x.paymentFeeGroupId?.toString()
                    ) != -1
                  )
                    x.hasAccept = true;
                });
              }
            }
          }
          //***End***/
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  save(frm: NgForm): void {
    if (this._isDraftView) return;   // đang xem/sửa nháp → KHÔNG lưu thật (dùng saveDraft/approveDraft)
    if (frm.valid && !this.flagSave) {
      this.flagSave = true;
      if (this._ngay)
        this.entity.refDate = moment(
          this._ngay,
          FormatContstants.DATEVN
        ).format(FormatContstants.CLIENTDATE);
      this.entity.paymentDetails = this.listDetail.filter(
        (x) => x.feeId != undefined || x.feeId != null
      );
      if (this.entity.paymentDetails?.length == 0) {
        this._notificationService.printAlert(
          "THÔNG BÁO",
          "Bạn phải chọn mã phí!"
        );
        this.flagSave = false;
        return;
      }
      var t = this.checkValue();
      if (t) {
        this._notificationService.printAlert(
          "THÔNG BÁO",
          "Chưa nhập đầy đủ thông tin chứng từ cần thiết!"
        );
        this.flagSave = false;
        return;
      }
      if (this.entity.id == undefined) {
        this.paymentsService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              // frm.resetForm();
              this.entity.id = res.data.id;
              this.entity.refNo = res.data.refNo;
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data.id);
              this.flagSave = false;
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.paymentsService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              // frm.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
              this.flagSave = false;
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
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

  handleCancel() {
    //Đoạn này thoát model này
    // this.localtion.back();
    this.CloseModal.emit();
  }

  onChangeTien(data: PaymentDetail) {
    let s1 = +(data.amount ?? 0);
    let vat = +(data.vat ?? 0);
    data.amountAfterVAT = s1 + vat;
    this.sumTien();
  }

  sumTien() {
    let tongThanhTien = 0;
    this.listDetail.forEach((element) => {
      tongThanhTien += +(element.amountAfterVAT ?? 0);
    });
    this.entity.totalAmount = tongThanhTien;
    this._bangchu = this._utilityService.ReadNumber(this.entity.totalAmount);
  }

  chagedFee(item: PaymentDetail, event: Fee) {
    if (event.groupCode == "CP03") {
      item.hasInvoice = 0;
    } else {
      item.hasInvoice = 1;
    }
  }
  changeCurrency(item: PaymentDetail, event: OtherCategories) {
    if (event.categoryCode == "VND") {
      item.exchangeRate = 0;
    } else {
      let itemInput: RateExchange = {
        currencyCode: event.categoryCode,
      };
      this.rateExchangeService
        .getByCurrency(itemInput)
        .subscribe((res: ResponseValue<RateExchange>) => {
          let itemVal = res.data;
          item.exchangeRate = itemVal.buy ? itemVal.buy : 0;
        });
    }
  }
  checkValue(): boolean {
    let reval = false;
    this.listDetail.forEach((it) => {
      if (it.hasInvoice == 1 && it.feeId != undefined) {
        if (
          !it.invoiceNo ||
          it.invoiceNo?.trim().length < 1 ||
          !it.invoiceDate ||
          it.invoiceDate?.length < 1
        )
          reval = true;
      }
    });
    return reval;
  }

  inputTen() {
    if (this.listDetail?.length == 0) {
      let item: PaymentDetail = {
        tempId: 1,
        contents: "",
        hasInvoice: 1,
        amount: 0,
        vat: 0,
        notes: "",
        feeId: null,
        branchId: this._branchId,
        step: 0,
        currency: "VND",
      };
      this.listDetail.push(item);
    } else {
      let arrayId = this.listDetail?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });
      let item = this.listDetail?.find((x) => x.tempId == maxId);
      if (item && item.feeId) {
        let item: PaymentDetail = {
          tempId: maxId + 1,
          contents: "",
          hasInvoice: 1,
          amount: 0,
          notes: "",
          feeId: null,
          branchId: this._branchId,
          step: 0,
          currency: "VND",
        };
        this.listDetail.push(item);
      }
    }
    this.listDetail = [...this.listDetail];
  }

  removeItem(i: number) {
    this.listDetail.splice(i, 1);
    if (this.listDetail?.length == 0) this.inputTen();
    this.sumTien();
    this.listDetail = [...this.listDetail];
  }

  accept(item: PaymentDetail, key: string) {
    item.checked = true;
    this.submit(item, key);
  }

  // submit(entity: PaymentDetail, key: string): void {
  //   let b = key == 'true';
  //   let item: Payments = {
  //     id: entity.id,
  //     feedback: b ? '' : entity.feedback,
  //     status: b
  //   };
  //   this.paymentsService.accept(item).subscribe((res: ResponseValue<any>) => {
  //     if (res.code == '200' || res.code == '201') {
  //       this.loadData(entity, b);
  //     }
  //     else {
  //       this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
  //     }
  //   }, () => {
  //     this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
  //   });
  // }
  //Đoạn này bỏ sung phần duyệt thanh toán theo cái mới
  submit(entity: PaymentDetail, key: string): void {
    let b = key == "true";
    // let item: Payments = {
    //   id: entity.id,
    //   feedback:'',
    //   status: b
    // };
    let copy = Object.assign({}, entity);
    let _ok = b;
    if (!b) {
      let retVal = prompt("Lý do từ chối", "");
      if (retVal) {
        _ok = true;
      }
      copy.feedback = retVal ?? "";
      copy.step = -1;
    } else {
      if (entity.step == 0) copy.step = 1;
      else if (entity.step == 1) copy.step = 2;
      else copy.step = -1;
    }
    if (_ok) {
      this.paymentsService.acceptStep(copy).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.loadData(entity, b);
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG
            );
          }
        },
        () => {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG
          );
        }
      );
    }
  }

  loadData(entity: PaymentDetail, b: boolean) {
    let i = this.listDetail.findIndex((x) => x.id == entity.id);
    if (i != -1) {
      this.listDetail[i].step = b ? this.listDetail[i].step + 1 : -1;
    }
    this.listDetail = [...this.listDetail];
  }
  showFiles(job: Payments) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: SystemContstants.PAYMENT,
      functionName: SystemContstants.PAYMENT,
      refNo: job.id.toString(),
      jobId: "",
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  selectedNgaybatdau(item: PaymentDetail, event) {
    item.invoiceDate = moment(event.start).format("DD/MM/YYYY");
  }
  closedNgaybatdau(item: PaymentDetail, event) {
    if (item.invoiceDate == null || item.invoiceDate?.length < 1)
      item.invoiceDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }
  saveSuccessAdvances(event: any): void {
    this.entity.advancesRefNo = event;
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
  closeModalAdvances() {
    this.viewListAdvances = false;
  }

  closeModalJob() {
    this.viewModalJob = false;
  }
  closeModalviewListApprovedLog() {
    this.viewListApprovedLog = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
