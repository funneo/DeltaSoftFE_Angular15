import { PaymentDetailCbt } from './../../../models/cbt/payment-detail-cbt.model';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Employee, Fee, OtherCategories, PermissionPayment, ResponseValue, Supplier } from '@app/shared/models';
import { PaymentCbt } from '@app/shared/models/cbt/payment-cbt.model';
import { AuthService, EmployeeService, FeeService, NotificationService, OtherCategoriesService, PermissionPaymentService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PaymentCbtService } from '@app/shared/services/cbt/payment-cbt.service';
import { RateExchangeService } from '@app/shared/services/categories/rate-exchange.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { HttpParams } from '@angular/common/http';
import { MessageContstants } from '@app/shared/constants';
import { DispatchOrderCbt } from '@app/shared/models/cbt/dispatch-order-cbt.model';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { NgForm } from '@angular/forms';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-payment-cbt',
  templateUrl: './modal-payment-cbt.component.html',
  styleUrls: ['./modal-payment-cbt.component.css']
})
export class ModalPaymentCbtComponent implements OnInit {
  entity: PaymentCbt;
  flagXem: boolean;
  _type: number;
  _wfId: number;
  _shipmentId: number;
  _ngay: string = moment(new Date()).format("DD/MM/YYYY");
  listDetail: PaymentDetailCbt[];
  flagSave: boolean = false;
  busy: Subscription;
  listFee: Fee[];
  listType: any[] = [
    { id: 0, text: "Cá nhân" },
    { id: 1, text: "Nhà cung cấp" },
  ];
  listInvoice: any[] = [
    { id: 0, text: "Không" },
    { id: 1, text: "Có" },
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
  _supplierId = 0;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  viewModalJob = false;
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  constructor(
    private _utilityService: UtilityService,
    private _otherCategoryService: OtherCategoriesService,
    private authService: AuthService,
    private service: PaymentCbtService,
    private employeeService: EmployeeService,
    private feeService: FeeService,
    private _notificationService: NotificationService,
    private permissionPaymentService: PermissionPaymentService,
    private rateExchangeService: RateExchangeService,
    private suppliertSerive: SupplierService, private cdr: ChangeDetectorRef,
  ) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
    this._levelPermissionPayment = Number.parseInt(user.paymentConfirmLevel);
    this._accept = this.authService.hasPermission("F003_ACCEPT");
    this.listPermissionPM = permissionPaymentService.getPermissionPM();
  }
  ngOnInit(): void {
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
  onChangeFee(event: any, item: any): void {
    if (event && !event.status) {
      this._notificationService.printAlert("Lỗi nhập liệu", "Mã phí đã bị khóa, không được sử dụng")
      setTimeout(() => {
        item.feeId = null;
      });
      this.cdr.detectChanges();
    } else {
      item.feeId = event?.id;
    }
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



  loadFee() {
    const params = new HttpParams()
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(_ => _.groupCode == 'CP01' || _.groupCode == 'CP02' || _.groupCode == 'CP03') || [];
      // Create completely new objects to prevent cache mutation
      this.listFee = filtered.map(fee => {
        const newFee: Fee = {
          id: fee.id,
          feeCode: fee.feeCode,
          feeName: fee.feeCode + '-' + fee.feeName,
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

  add(item: DispatchOrderCbt) {
    this.loadSupplier();
    this.entity = {
      status: false,
      branchId: this._branchId,
      employeeId: item.driverId,
      dispatchOrderRefNo: item.refNo,
      type: 0, //Thanh toán tiền mặt
      refDate: moment(new Date()).format("DD/MM/YYYY"),
    };
    this.listDetail = [];
    this.inputTen();
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean): void {
    this.service
      .getDetail(id)
      .subscribe((res: ResponseValue<PaymentCbt>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
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
          this.listDetail = this.entity.details ?? [];
          if (this.listDetail && this.listDetail.length != 0) {
            this.listDetail.every((_) => (_.tempId = _.id));
            this.listDetail.every((_) => (_.checked = false));
          }
          this.flagXem = flag;
          //Cập nhật lại là nếu chuyển duyệt rồi thì không cho phép thêm mới thanh toan nữa
          if (!this.flagXem && !this._isChuyeduyet) this.inputTen();
          this.flagSave = false;
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
            if (listTheoKhachHang?.length > 0) {
              if (
                listTheoKhachHang[0].listCustomerId
                  ?.split(",")
                  .findIndex((x) => x == this.entity.customerId?.toString()) !=
                -1
              ) this._accept = true;
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

  accept(entity: PaymentCbt, key: boolean): void {
    let copy = Object.assign({}, entity)
    let _ok = key;
    if (!key) {
      let retVal = prompt("Lý do từ chối", '');
      if (retVal) {
        _ok = true;
      }
      copy.feedback = retVal ?? '';
      copy.step = -1;
    } else {
      if (entity.step == 0) copy.step = 1;
      else if (entity.step == 1) copy.step = 2;
      else copy.step = -1;
    }
    if (_ok) {
      this.service.acceptStep(copy).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this._notificationService.printSuccessMessage(
            MessageContstants.CREATED_OK_MSG
          );
          this.SaveSuccess.emit(res.data.id);
          this.modalAddEdit.hide();
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      }, () => {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      });
    }
  }

  save(frm: NgForm): void {
    if (frm.valid && !this.flagSave) {
      this.flagSave = true;
      if (this._ngay)
        this.entity.refDate = moment(
          this._ngay,
          FormatContstants.DATEVN
        ).format(FormatContstants.CLIENTDATE);
      this.entity.details = this.listDetail.filter(
        (x) => x.feeId != undefined || x.feeId != null
      );
      if (this.entity.details?.length == 0) {
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
        this.service.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              frm.resetForm();
              this.entity.id = res.data.id;
              this.entity.refNo = res.data.refNo;
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data.id);
              this.modalAddEdit.hide();
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
        this.service.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              frm.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
              this.modalAddEdit.hide();
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

  onChangeTien(data: PaymentDetailCbt) {
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

  chagedFee(item: PaymentDetailCbt, event: Fee) {
    if (event.groupCode == "CP03") {
      item.hasInvoice = 0;
    } else {
      item.hasInvoice = 1;
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
      let item: PaymentDetailCbt = {
        tempId: 1,
        contents: "",
        hasInvoice: 1,
        amount: 0,
        vat: 0,
        notes: "",
        feeId: null
      };
      this.listDetail.push(item);
    } else {
      let arrayId = this.listDetail?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });
      let item = this.listDetail?.find((x) => x.tempId == maxId);
      if (item && item.feeId) {
        let item: PaymentDetailCbt = {
          tempId: maxId + 1,
          contents: "",
          hasInvoice: 1,
          amount: 0,
          notes: "",
          feeId: null
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


  showFiles(job: PaymentCbt) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: SystemContstants.PAYMENTCBT,
      functionName: SystemContstants.PAYMENTCBT,
      refNo: job.id.toString(),
      jobId: "",
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  selectedNgaybatdau(item: PaymentDetailCbt, event) {
    item.invoiceDate = moment(event.start).format("DD/MM/YYYY");
  }
  closedNgaybatdau(item: PaymentDetailCbt, event) {
    if (item.invoiceDate == null || item.invoiceDate?.length < 1)
      item.invoiceDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  saveSuccessFile(event: any): void {
    console.log(event);
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
