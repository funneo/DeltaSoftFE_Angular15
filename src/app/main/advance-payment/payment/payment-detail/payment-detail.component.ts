import { identifierName } from '@angular/compiler';
import { RateExchangeService } from './../../../../shared/services/categories/rate-exchange.service';
import { OtherCategoriesService } from './../../../../shared/services/other-categories.service';
import { Location } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Branch, Customer, Employee, Fee, OtherCategories, PaymentDetail, Payments, PermissionPayment, ResponseValue, Shipment, Supplier, Workflow } from '@app/shared/models';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AuthService, BranchService, CustomerService, EmployeeService, FeeService, NotificationService, PaymentsService, PermissionPaymentService, ShipmentService, UtilityService, WorkflowsService } from '@app/shared/services';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { MessageContstants } from '@app/shared/constants';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { SupplierService } from '@app/shared/services/supplier.service';
import { ModalShipmentComponent } from '@app/shared/components/shipments/modal-shipment/modal-shipment.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { RateExchange } from '@app/shared/models/categories/rate-exchange.model';
import { ModalListApprovedLogComponent } from '@app/shared/components/advance-payment/modal-list-approved-log/modal-list-approved-log.component';
import { ModalListAdvanceComponent } from '@app/shared/components/advance-payment/modal-list-advance/modal-list-advance.component';
import { ModalListPaymentAcceptComponent } from '@app/shared/components/advance-payment/modal-list-payment-accept/modal-list-payment-accept.component';
import { ModalPaymentDetailComponent } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.component';
import { ModalPaymentDetailedComponent } from '@app/shared/components/advance-payment/modal-payment-detailed/modal-payment-detailed.component';
import { ModalImportExcelComponent } from '@app/shared/components/systems/modal-import-excel/modal-import-excel.component';
import { ModalPendingInvoicePickerComponent } from '@app/shared/components/advance-payment/modal-pending-invoice-picker/modal-pending-invoice-picker.component';
import { PendingInvoicePickerItem } from '@app/shared/services/pending-invoice.service';
import { FeeCodeService } from '@app/shared/services/fee-code.service';
import { FeeCode } from '@app/shared/models';
@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.css']
})
export class PaymentDetailComponent implements OnInit {
  flagXem: boolean;
  flagNew: boolean = false;
  _type: number;
  _wfId: number;
  _shipmentId: number;
  _ngay: string = moment(new Date()).format('DD/MM/YYYY');
  listDetail: PaymentDetail[];
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  listFee: Fee[];
  _listGroupFee: FeeCode[] = [];     // FeeCode cấp 1 (Lĩnh vực) cho dropdown nhóm phí
  _listSubFee: FeeCode[] = [];       // FeeCode cấp 2 (phân nhóm, chỉ "được quét invoice") theo nhóm cấp 1 đã chọn
  listWorkflow: Workflow[];
  listShipment: Shipment[];
  listType: any[] = [
    { id: 0, text: 'Cá nhân' },
    { id: 1, text: 'Nhà cung cấp' },
  ];
  listInvoice: any[] = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Có' },
    { id: 2, text: 'NỢ' }
  ];
  listTypePayment = UtilityService.listTypePayment();
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
  _customerId?: number;
  _debitBranchId?: number;
  // _viewAll=2;
  _auth = 3;
  viewListAccept = false;
  entity: Payments;
  feedback: string;
  listPaymentFeeGroupIds: string[];
  listSupplier: Supplier[];
  viewListApprovedLog = false;
  viewListAdvances = false;
  viewPaymentDetailed = false;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listPermissionPM: PermissionPayment[];
  viewAttachFiles: boolean;
  _bangchu = '';
  @ViewChild(ModalListAdvanceComponent, { static: false }) modalAdvances: ModalListAdvanceComponent;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalListApprovedLogComponent, { static: false }) modalListApprovedLog: ModalListApprovedLogComponent;
  @ViewChild(ModalListPaymentAcceptComponent, { static: false }) modalListAccept: ModalListPaymentAcceptComponent;
  @ViewChild(ModalPaymentDetailedComponent, { static: false }) modalPaymentDetailed: ModalPaymentDetailedComponent;
  viewModalJob = false;
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  constructor(private activatedRoute: ActivatedRoute, private localtion: Location, private _utilityService: UtilityService, private _otherCategoryService: OtherCategoriesService,
    private authService: AuthService, private branchService: BranchService, private employeeService: EmployeeService,
    private paymentsService: PaymentsService, private customerService: CustomerService, private cdr: ChangeDetectorRef,
    private feeService: FeeService, private _notificationService: NotificationService, permissionPaymentService: PermissionPaymentService,
    private workflowsService: WorkflowsService, private rateExchangeService: RateExchangeService, private suppliertSerive: SupplierService, private shipmentService: ShipmentService,
    private feeCodeService: FeeCodeService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
    this._levelPermissionPayment = Number.parseInt(user.paymentConfirmLevel);
    this._accept = this.authService.hasPermission('PAYMENT_ACCEPT');
    this.listPermissionPM = permissionPaymentService.getPermissionPM();

    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    // let i=list?.findIndex(x=>x.id==this._functionId);
    // if(i!=-1){
    //   this._viewAll=list[i].value;
    // }

    // Lấy tên theo file json
    if (list?.filter(x => x.id == 'PAYMENT-TYPE')?.length > 0) {
      this.listType = [];
      list?.filter(x => x.id == 'PAYMENT-TYPE')?.forEach(z => {
        this.listType.push({ id: z.value, text: z.text })
      })
    }
  }
  ngOnInit(): void {
    this._type = parseInt(this.activatedRoute.snapshot.params["type"]);
    if (this._type <= 1) {
      this._wfId = parseInt(this.activatedRoute.snapshot.params["wfId"]);
    }
    else {
      this._shipmentId = parseInt(this.activatedRoute.snapshot.params["wfId"]);
    }
    this._type = this._type % 2;
    this.loadChiNhanh();
    this.loadFee();
    this.loadGroupFee();
    this.loadOtherCategory();
    this.entity = {
      status: false,
      branchId: this._branchId,
      employeeId: this._employeeId,
      type: this._type,
      isDirectPayment: this._type,
      refDate: moment(new Date()).format('DD/MM/YYYY'),
      workflowId: this._wfId,
      shipmentId: this._shipmentId
    };
    const flag = this.activatedRoute.snapshot.params["flag"];
    if (flag != null) {
      this.flagXem = flag == 'true';
    }
    const id = this.activatedRoute.snapshot.params["id"];
    if (id != undefined && id != null) {
      this.flagNew = false;
      this.edit(parseInt(id));
    }
    else {
      this.flagNew = true;
      this.listDetail = [];
      this.loadEmployee();
      this.loadWorkflow();
      this.loadShipment();
      this.customerService
        .getByJobId(this._type == 1 ? this._wfId : this._shipmentId, this._type == 1 ? 0 : 1)
        .subscribe((res: ResponseValue<Customer>) => {
          this._debitBranchId = (res.code === '200' || res.code === '201')
            ? res.data.invoiceIssuingBranchId
            : this._branchId;
          this.inputTen();
        });

      if (this._type == 1)
        this.loadSupplier();
    }
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
  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'CURRENCY');
    this._otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this._listCurrency = res.data;
    });
  }
  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this._branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }
  loadWorkflow(): void {
    if (this._wfId != undefined && this._wfId != null && this._wfId != 0) {
      this.workflowsService.getDetail(this._wfId.toString()).subscribe((res: ResponseValue<Workflow>) => {
        let itemWf: Workflow = res.data;
        this.listWorkflow = [];
        this.listWorkflow.push({ id: itemWf.id, jobName: itemWf.jobName, shipmentId: itemWf.shipmentId });
        this._shipmentId = itemWf.shipmentId;
      });
    }
  }

  loadShipment(): void {
    if (this._shipmentId != undefined && this._shipmentId != null && this._shipmentId != 0) {
      this.shipmentService.getDetail(this._shipmentId.toString()).subscribe((res: ResponseValue<Shipment>) => {
        let job: Shipment = res.data;
        this.listShipment = [];
        if (job.cdsNumber)
          job.jobId += ('/Tk: ' + job.cdsNumber.substring(0, 25));
        if (job.hawB_HBL)
          job.jobId += ('/HBill: ' + job.hawB_HBL);
        if (job.invoiceNo)
          job.jobId += ('/Inv: ' + job.invoiceNo);
        this.listShipment.push({ id: job.id, jobId: job.jobId });
      });
    }
  }

  validateNumberInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  loadGroupFee() {
    // FeeCode cấp 1 (Lĩnh vực) đã duyệt (status=2). bindValue = feeCode (lưu code, không id).
    this.feeCodeService.getAll(null, 1, 2).subscribe(res => {
      this._listGroupFee = res?.data || [];
    });
  }

  /** Load phân nhóm cấp 2 (chỉ mã được quét invoice) theo nhóm cấp 1. Robust nếu list cấp 1 chưa kịp load. */
  loadSubFee(groupCode: string) {
    this._listSubFee = [];
    if (!groupCode) return;
    const doLoad = () => {
      const parent = this._listGroupFee?.find(x => x.feeCode === groupCode);
      if (!parent?.id) return;
      this.feeCodeService.getAll(parent.id, 2, 2, true).subscribe(r => { this._listSubFee = r?.data || []; });
    };
    if (this._listGroupFee?.length) doLoad();
    else this.feeCodeService.getAll(null, 1, 2).subscribe(res => { this._listGroupFee = res?.data || []; doLoad(); });
  }

  _lastGroupFee: string;     // giá trị nhóm phí đã "chốt" (để revert khi user hủy)

  /** Đổi nhóm phí cấp 1 → reset phân nhóm cấp 2 + xóa toàn bộ chi tiết (phiếu thuộc 1 nhóm). */
  onChangeGroupFee(newCode: string) {
    if (newCode === this._lastGroupFee) return;
    const hasReal = (this.listDetail || []).some(x => x.feeId);
    // confirm() đồng bộ → revert được ngay khi user hủy (printConfirmationDialog không có callback hủy).
    if (hasReal && !confirm('Đổi nhóm phí cấp 1 sẽ XÓA toàn bộ chi tiết thanh toán hiện tại. Tiếp tục?')) {
      this.entity.groupFeeCode = this._lastGroupFee;   // hủy → revert
      return;
    }
    this.entity.groupFeeCode = newCode;
    this._lastGroupFee = newCode;
    this.entity.subFeeCode = null;     // đổi cấp 1 → bỏ chọn cấp 2
    this.loadSubFee(newCode);
    this.listDetail = [];
    this.sumTien();
    this.inputTen();
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
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }
  editItem(item: PaymentDetail) {
    this.showPaymentDetailed(item);
  }

  edit(id: number): void {
    this.paymentsService.getDetail(id).subscribe((res: ResponseValue<Payments>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this._lastGroupFee = this.entity.groupFeeCode;   // chốt giá trị nhóm phí để revert khi đổi
        this.loadSubFee(this.entity.groupFeeCode);       // load phân nhóm cấp 2 để hiển thị lựa chọn đã lưu
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
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this._ngay = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.listDetail = this.entity.paymentDetails ?? [];
        if (this.listDetail && this.listDetail.length != 0) {
          this.listDetail.every(_ => _.tempId = _.id);
          this.listDetail.every(_ => _.checked = false);
          this.listDetail.every(_ => _.isExpired = this._utilityService.checkWorkingDaysExceeded(new Date(_.acceptedDate), 7));
        }
        //Cập nhật lại là nếu chuyển duyệt rồi thì không cho phép thêm mới thanh toan nữa
        if (!this.flagXem && !this._isChuyeduyet)
          this.inputTen();
        //this.flagSave = this._isChuyeduyet;
        this.loadWorkflow();
        this.loadShipment();
        this.loadEmployee();
        if (this.entity.type == 1)
          this.loadSupplier();
        //Xet quyen duyet
        //1.Duyet theo khach hang
        //****Begin
        if (this.listPermissionPM != null && this.listPermissionPM.length == 0 || this._levelPermissionPayment <= 0) {
          this._accept = false;
        }
        else {
          let _b: boolean = false;
          // console.log(this.listPermissionPM);

          let listTheoKhachHang = this.listPermissionPM?.filter(x => x.type == 1);
          let listTheoMaPhi = this.listPermissionPM?.filter(x => x.type == 0);
          if (listTheoKhachHang?.length > 0) {
            if (listTheoKhachHang[0].listCustomerId?.split(',').findIndex(x => x == this.entity.customerId.toString()) != -1)
              _b = true;
            this.entity.paymentDetails.forEach(x =>
              x.hasAccept = _b
            );
          }
          else {
            if (listTheoMaPhi?.length > 0) {
              this.listPaymentFeeGroupIds = [];
              listTheoMaPhi[0].listPaymentFeeGroupId?.split(',')?.forEach(z => this.listPaymentFeeGroupIds.push(z));
            }
            if (this.listPaymentFeeGroupIds?.length != 0) {
              this.entity.paymentDetails.forEach(x => {
                if (this.listPaymentFeeGroupIds.findIndex(_ => _ == x.paymentFeeGroupId?.toString()) != -1)
                  x.hasAccept = true;
              });
            }
          }
        }
        //***End***/
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  save(frm: NgForm): void {
    if (frm.valid && !this.flagSave) {
      this.flagSave = true;
      if (this._ngay)
        this.entity.refDate = moment(this._ngay, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      this.entity.paymentDetails = this.listDetail.filter(
        (x) => x.feeId != undefined || x.feeId != null
      );
      if (this.entity.paymentDetails?.length == 0) {
        this._notificationService.printAlert("THÔNG BÁO", 'Bạn phải chọn mã phí!')
        this.flagSave = false;
        return;
      }
      var t = this.checkValue();
      if (t) {
        this._notificationService.printAlert("THÔNG BÁO", 'Chưa nhập đầy đủ thông tin chứng từ cần thiết!')
        this.flagSave = false;
        return;
      }
      var k = this.checkreferCode();
      if (k) {
        this._notificationService.printAlert("THÔNG BÁO", 'Chưa nhập thông tin mã tham chiếu!')
        this.flagSave = false;
        return;
      }
      if (this.flagNew) {
        this.paymentsService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            // frm.resetForm();
            this.entity.id = res.data.id;
            this.entity.refNo = res.data.refNo;
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.flagNew = false;
            this.SaveSuccess.emit(res.data.id);
            this.flagSave = false;
            this.paymentsService.getDetail(this.entity.id).subscribe((res: ResponseValue<Payments>) => {
              if (res.code == '200' || res.code == '201') {
                this.entity = res.data;
              } else {
                this.handleCancel();
              }
            });
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
        this.paymentsService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            // frm.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
            this.flagSave = false;
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

  handleCancel() {
    this.localtion.back();
  }
  removeAll() {
    if (this._isChuyeduyet) return;//Nếu đã chuyển duyệt thì không cho xóa
    this._notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => {
        this.listDetail = [];
        this.sumTien();
        this.inputTen();
      }
    );
  }

  onChangeTien(data: PaymentDetail) {
    let s1 = +(data.amount ?? 0);
    let vat = +(data.vat ?? 0);
    data.amountAfterVAT = s1 + vat;
    this.sumTien();
  }

  sumTien() {
    let tongThanhTien = 0;
    this.listDetail.forEach(element => {
      tongThanhTien += +(element.amountAfterVAT ?? 0);
    });
    this.entity.totalAmount = tongThanhTien;
    this._bangchu = this._utilityService.ReadNumber(this.entity.totalAmount);
  }

  chagedFee(item: PaymentDetail, event: Fee) {
    if (event.groupCode == 'CP03') {
      item.hasInvoice = 0;
    }
    else {
      item.hasInvoice = 1;
    }

  }
  changeCurrency(item: PaymentDetail, event: OtherCategories) {
    if (event.categoryCode == 'VND') {
      item.exchangeRate = 0;
    }
    else {
      let itemInput: RateExchange = {
        currencyCode: event.categoryCode
      }
      this.rateExchangeService.getByCurrency(itemInput).subscribe((res: ResponseValue<RateExchange>) => {
        let itemVal = res.data;
        item.exchangeRate = itemVal.buy ? itemVal.buy : 0;
      });
    }
  }
  checkValue(): boolean {
    let reval = false;
    this.listDetail?.forEach(it => {
      if (it.hasInvoice == 1 && it.feeId != undefined) {
        if (!it.invoiceNo || String(it.invoiceNo).trim().length < 1 || !it.invoiceDate || it.invoiceDate?.length < 1) reval = true;
      }
    })

    return reval;
  }
  checkreferCode(): boolean {
    let reval = false;
    this.listDetail?.forEach(it => {
      if (it.feeId != undefined) {
        if (it.referCode == undefined || it.referCode == null || it.referCode?.length < 1) reval = true;
      }
    })
    return reval;
  }

  inputTen() {
    if (this.entity.status) return;//Nếu đã chuyển duyệt thì không cho thêm mới nữa
    if (this.listDetail?.length == 0) {
      let item: PaymentDetail = {
        tempId: 1,
        contents: '', hasInvoice: 1,
        amount: 0, vat: 0,
        notes: '',
        feeId: null, branchId: this._debitBranchId,
        step: 0, currency: 'VND'
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
          contents: '', hasInvoice: 1,
          amount: 0,
          notes: '',
          feeId: null, branchId: this._debitBranchId,
          step: 0, currency: 'VND'
        };
        this.listDetail.push(item);
      }
    }
    this.listDetail = [...this.listDetail];
  }

  removeItem(i: number) {
    this.listDetail.splice(i, 1);
    if (this.listDetail?.length == 0)
      this.inputTen();
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
    let b = key == 'true';
    // let item: Payments = {
    //   id: entity.id,
    //   feedback:'',
    //   status: b
    // };
    let copy = Object.assign({}, entity)
    let _ok = b;
    if (!b) {
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
      this.paymentsService.acceptStep(copy).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData(entity, b);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      }, () => {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      });
    }
  }

  loadData(entity: PaymentDetail, b: boolean) {
    let i = this.listDetail.findIndex(x => x.id == entity.id);
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
      jobId: ''
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  showApprovedLog(id: number) {
    this.viewListApprovedLog = true;
    setTimeout(() => {
      this.modalListApprovedLog.view(id);
    }, 50);
  }

  showUserAccepting(id: number) {
    this.viewListAccept = true;
    setTimeout(() => {
      this.modalListAccept.view(id);
    }, 50);
  }
  selectedNgaybatdau(item: PaymentDetail, event) {
    item.invoiceDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaybatdau(item: PaymentDetail, event) {
    if (item.invoiceDate == null || item.invoiceDate?.length < 1)
      item.invoiceDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }
  saveSuccessAdvances(event: any): void {
    this.entity.advancesRefNo = event
  }
  savePaymentDetailed(event: any) {
    this.flagNew = false;
    this.edit(this.entity.id);
  }
  closeModalFile() {
    this.viewAttachFiles = false;
  }
  closeModalAdvances() {
    this.viewListAdvances = false;
  }
  closeModalListUserAccept() {
    this.viewListAccept = false;
  }

  showJob(): void {
    this.viewModalJob = true;
    setTimeout(() => {
      this.modalJob.edit(this._shipmentId.toString(), true);
    }, 50);
  }
  showPaymentDetailed(item: PaymentDetail): void {
    this.viewPaymentDetailed = true;
    setTimeout(() => {
      this.modalPaymentDetailed.edit(item);
    }, 50);
  }
  showAdvances(): void {
    if (this.flagXem) return;
    // Thanh toán Nhà cung cấp: bắt buộc chọn NCC trước để lọc đúng tạm ứng của NCC đó
    if (this._type == 1 && !this.entity.supplierId) {
      this._notificationService.printAlert("THÔNG BÁO", 'Vui lòng chọn Nhà cung cấp trước khi chọn tạm ứng!');
      return;
    }
    this.viewListAdvances = true;
    setTimeout(() => {
      this.modalAdvances.show();
    }, 50);
  }
  closeModalJob() {
    this.viewModalJob = false;
  }
  closeModalviewListApprovedLog() {
    this.viewListApprovedLog = false;
  }
  closePaymentDetailed() {
    this.viewPaymentDetailed = false;
  }

  viewImportExcel: boolean;
  @ViewChild(ModalImportExcelComponent, { static: false }) modalImport: ModalImportExcelComponent;

  viewInvoicePicker: boolean;
  @ViewChild(ModalPendingInvoicePickerComponent, { static: false }) modalInvoicePicker: ModalPendingInvoicePickerComponent;

  showImport(): void {
    this.viewImportExcel = true;
    setTimeout(() => {
      this.modalImport.view(1);
    }, 50);
  }

  saveSuccessImport(event: PaymentDetail[]): void {
    this.listDetail = event;
    this.listDetail = event.map(item => {
      item.step = 0;  // Add step property with value 0 to each item
      return item;
    });
    this.entity.totalAmount = this.listDetail.reduce((a, b) => a + b.amountAfterVAT, 0);
    this.inputTen();
  }

  closeImport() {
    this.viewImportExcel = false;
  }

  // ====== Pick từ PendingInvoice (Hóa đơn đã đọc) ======
  showInvoicePicker(): void {
    if (this.flagXem || this._isChuyeduyet) return;
    if (!this.entity.groupFeeCode) {
      this._notificationService.printAlert('THÔNG BÁO', 'Vui lòng chọn Nhóm phí cấp 1 trước khi lấy hóa đơn đã đọc!');
      return;
    }
    this.viewInvoicePicker = true;
    setTimeout(() => {
      if (this.modalInvoicePicker) {
        this.modalInvoicePicker.groupFeeCode = this.entity.groupFeeCode;
        this.modalInvoicePicker.subFeeCode = this.entity.subFeeCode;
      }
      this.modalInvoicePicker?.show();
    }, 50);
  }

  closeInvoicePicker(): void {
    this.viewInvoicePicker = false;
  }

  /** User chọn N hóa đơn → fill thành N dòng PaymentDetail. */
  onInvoicesPicked(items: PendingInvoicePickerItem[]): void {
    if (!items?.length) return;

    // Bỏ những dòng rỗng (chưa chọn FeeId) ở cuối list trước khi thêm
    this.listDetail = (this.listDetail ?? []).filter(x => x.feeId);

    // Tính tempId max hiện tại
    let nextTempId = this.listDetail.length === 0
      ? 1
      : Math.max(...this.listDetail.map(x => x.tempId ?? 0)) + 1;

    items.forEach(inv => {
      const netAmount  = inv.netAmount  ?? ((inv.totalAmount ?? 0) - (inv.taxAmount ?? 0));
      const vat        = inv.taxAmount  ?? 0;
      const total      = inv.totalAmount ?? (netAmount + vat);

      const row: PaymentDetail = {
        tempId: nextTempId++,
        feeId: null,                          // user tự chọn mã phí
        contents: '',                         // user tự nhập diễn giải
        referCode: '',                        // user tự nhập mã tham chiếu
        amount: netAmount,
        vat: vat,
        amountAfterVAT: total,
        currency: inv.currency ?? 'VND',
        exchangeRate: 0,
        hasInvoice: 1,
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.invoiceDate,
        invoicePattern: inv.invoicePattern,
        taxNumber: inv.taxNumber,
        web: inv.web,
        code: inv.code,
        branchId: this._debitBranchId,
        notes: '',
        step: 0,
        pendingInvoiceId: inv.id              // ⭐ key để BE Mark sau khi save Payment
      };
      this.listDetail.push(row);
    });

    // Thêm 1 dòng trống ở cuối nếu cần
    this.inputTen();
    this.sumTien();
    this.listDetail = [...this.listDetail];

    this.viewInvoicePicker = false;
    this._notificationService.printSuccessMessage(`Đã thêm ${items.length} hóa đơn vào danh sách. Hãy chọn mã phí + nhập mã tham chiếu cho từng dòng.`);
  }
}
