import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { DebitNoteDetail, PaymentDetail, Branch, Fee, Shipment, Profile, Employee, DebitNotes, Supplier, OtherCategories, Customer, PermissionCS, ResponseValue, Payments, RatingCS, PrintForm } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { PaymentCbt } from '@app/shared/models/cbt/payment-cbt.model';
import { UtilityService, AuthService, BranchService, EmployeeService, DebitNotesService, FeeService, NotificationService, ShipmentService, CustomerService, PaymentsService, OtherCategoriesService, PermissionCSService } from '@app/shared/services';
import { PaymentCbtService } from '@app/shared/services/cbt/payment-cbt.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription, Observable } from 'rxjs';
import { ModalDebtDebitnotesComponent } from '../../accounting/modal-debt-debitnotes/modal-debt-debitnotes.component';
import { ModalPaymentDetailComponent } from '../../advance-payment/modal-payment-detail/modal-payment-detail.component';
import { ModalDispatchOrderCbtComponent } from '../../cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.component';
import { ModalPaymentCbtComponent } from '../../cbt/modal-payment-cbt/modal-payment-cbt.component';
import { ModalCsRatingComponent } from '../../shipments/modal-cs-rating/modal-cs-rating.component';
import { ModalShipmentViewSearchComponent } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { ModalShipmentComponent } from '../../shipments/modal-shipment/modal-shipment.component';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalDispatchOrderFclComponent } from '../../transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.component';
import { ModalDispatchorderComponent } from '../../transports/modal-dispatchorder/modal-dispatchorder.component';
import { ModalListDispatchOrderComponent } from '../../transports/modal-list-dispatch-order/modal-list-dispatch-order.component';

@Component({
  selector: 'modal-debit-note-canon',
  templateUrl: './modal-debit-note-canon.component.html',
  styleUrls: ['./modal-debit-note-canon.component.css']
})
export class ModalDebitNoteCanonComponent implements OnInit {
  flagXem: boolean;
  _type: number;
  _shipmentId: number;
  _sId?: number;//Dùng view lệnh vận chuyển
  // _jobId?: string;
  flagLocked = false;
  listDetail: DebitNoteDetail[];
  listFilter: PaymentDetail[];
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  listFee: Fee[];
  listShipments: Shipment[];
  listType: any[] = [
    { id: 0, text: 'Khách hàng' },
    { id: 1, text: 'Đối tác' },
  ];
  buttonDisabled = false;
  tongchuavat?: number = 0;
  vat?: number = 0;
  tongtien?: number = 0;
  listVAT: any[] = [
    { id: 10, text: '10' },
    { id: 9, text: '9' },
    { id: 8, text: '8' },
    { id: 7, text: '7' },
    { id: 6, text: '6' },
    { id: 5, text: '5' },
    { id: 0, text: '0' },
  ];
  viewModal = false;
  userLoged: Profile;
  _vat = 10;
  _flagViewInfor?: boolean = true;
  _isChuyeduyet = false;
  mask3Number = UtilityService.mask3Number;
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId: number;
  // _levelPermissionDebitNote: number;
  _accept: boolean;
  _lockPermission: boolean = false;
  _customerId: number;
  entity: DebitNotes;
  feedback: string;
  listDebitNoteFeeGroupIds: string[];
  listSupplier: Supplier[];
  listTienTes: OtherCategories[];
  viewDispatchOrder = false;
  viewDebt = false;

  maphiSearch?: string;
  tenphiSearch?: string;
  refnoSearch?: string;
  diengiaiSearch?: string;
  sotienSearch?: string;
  vatSearch?: string;
  tongtienSearch?: string;
  sohoadonSearch?: string;
  ngayhoadonSearch?: string;
  ghichuSearch?: string;
  referCodeSearch?: string;
  _ngayHachtoan: string;
  _ngayLamDebit: string = moment(new Date()).format('DD/MM/YYYY');
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  _ngayDoanhThu: string = moment(new Date()).format('DD/MM/YYYY');
  dateTimeOptions2 = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listCustomer: Customer[];
  _luongHang: string;
  _thongTinLoHang: string;
  listChiPhiLoHang: PaymentDetail[];
  listDebitTypes: OtherCategories[];
  listPermissionCS: PermissionCS[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalDebit: ModalDirective;
  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent
  @ViewChild(ModalDebtDebitnotesComponent, { static: false }) modalAddEdit: ModalDebtDebitnotesComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalListDispatchOrderComponent, { static: false }) modalListDispatchOrder: ModalListDispatchOrderComponent;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private localtion: Location, private _utilityService: UtilityService,
    private authService: AuthService, private branchService: BranchService, private employeeService: EmployeeService, private debitNotesService: DebitNotesService,
    private feeService: FeeService, private _notificationService: NotificationService, private paymentCbtService: PaymentCbtService,
    private shipmentService: ShipmentService, private suppliertSerive: SupplierService, private customerService: CustomerService, private paymentsService: PaymentsService,
    private http: HttpClient, private otherCategoriesService: OtherCategoriesService, permissionCSService: PermissionCSService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._employeeId = Number.parseInt(this.userLoged.employeeId);
    // this._levelPermissionDebitNote = Number.parseInt(user.paymentConfirmLevel);
    this.listPermissionCS = permissionCSService.getPermissionCS();
    this._accept = (this.authService.hasPermission('DEBITNOTES_ACCEPT') || this.userLoged.isAdmin);
    this._lockPermission = (this.authService.hasPermission('DEBITNOTES_CLOSING') || this.userLoged.isAdmin);

  }

  getVAT(): Observable<any> {
    return this.http.get("./assets/data/vat.json");
  }

  ngOnInit(): void {
    this.getVAT().subscribe(data => {
      if (data) {
        this.listVAT = data?.list;
        let i = this.listVAT.findIndex(x => x.status);
        if (i > -1) this._vat = this.listVAT[i].id;
      }
    });

    this.loadChiNhanh();
    this.loadFee();
    this.loadCustomer();
    this.loadOtherCategory();
  }



  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  viewPayment: boolean;
  @ViewChild(ModalPaymentDetailComponent, { static: false }) modalPayment: ModalPaymentDetailComponent;
  viewFcl: boolean;
  @ViewChild(ModalDispatchOrderFclComponent, { static: false }) modalFcl: ModalDispatchOrderFclComponent;
  viewCbt: boolean;
  @ViewChild(ModalDispatchOrderCbtComponent, { static: false }) modalCbt: ModalDispatchOrderCbtComponent;

  viewPaymentCbt: boolean;
  @ViewChild(ModalPaymentCbtComponent, { static: false }) modalPaymentCbt: ModalPaymentCbtComponent;

  showPayment(ref: string): void {
    if (ref.substring(0, 4) == "PM-C") {
      this.paymentCbtService.getbyRefno(ref).subscribe((res: ResponseValue<PaymentCbt>) => {
        let t = res.data;
        if (res.code == '200' || res.code == '201') {
          this.viewPaymentCbt = true;
          setTimeout(() => {
            this.modalPaymentCbt.edit(t.id, true);
          }, 50);
        }
      })
    } else
      if (ref.substring(0, 1) == "P")
        this.paymentsService.getByRefNo(ref).subscribe((res: ResponseValue<Payments>) => {
          let t = res.data;
          if (res.code == '200' || res.code == '201') {
            this.viewPayment = true;
            setTimeout(() => {
              this.modalPayment.edit(t.id, true);
            }, 50);
          }
        })
      else if (ref.substring(0, 1) == "C") //Nếu là lệnh vận chuyển thì view lên thôi
      {
        this.viewCbt = true;
        setTimeout(() => {
          this.modalCbt.edit(ref, true);
        }, 50);
      }
      else if (ref.substring(0, 1) != "F") //Nếu là lệnh vận chuyển thì view lên thôi
      {
        this.viewModal = true;
        setTimeout(() => {
          this.modalDispatchOrderAddEdit.edit(ref, true);
        }, 50);
      }
      else {
        this.viewFcl = true;
        setTimeout(() => {
          this.modalFcl.edit(ref, true);
        }, 50);
      }
  }

  loadEmployee(): void {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadCustomer(): void {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data.filter(x => x.locked === false);
    });
  }

  listFeebyCus: string;
  changedCustomer(event: Customer): void {
    this._shipmentId = null;
    this._customerId = event?.id;
    this.entity.debitBranchId = event?.invoiceIssuingBranchId;
    this.listFeebyCus = event.listFee;
    this.entity.shipmentId = null;
    this.listChiPhiLoHang = [];
    this._thongTinLoHang = '';
    this._luongHang = '';
    this.entity.notes = '';
    this.entity.shipmentId = null;
    this.loadShipment();
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

  filter(): void {
    this.listFilter = Object.assign([], this.listChiPhiLoHang);
    if (this.maphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.feeCode.toString().toLowerCase().includes(this.maphiSearch.trim().toLocaleLowerCase());
      });
    if (this.tenphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.feeName?.toLowerCase().includes(this.tenphiSearch.trim().toLocaleLowerCase());
      });
    if (this.refnoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo?.toLowerCase().includes(this.refnoSearch.trim().toLocaleLowerCase());
      });
    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode?.toLowerCase().includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });

    if (this.diengiaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.contents?.toLowerCase().includes(this.diengiaiSearch.trim().toLocaleLowerCase());
      });
    if (this.sotienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.amount?.toString().toLowerCase().includes(this.sotienSearch.trim().toLocaleLowerCase());
      });
    if (this.vatSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.vat?.toString().toLowerCase().includes(this.vatSearch.trim().toLocaleLowerCase());
      });
    if (this.tongtienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.amountAfterVAT?.toString().toLowerCase().includes(this.tongtienSearch.trim().toLocaleLowerCase());
      });
    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo?.toLowerCase().includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayhoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceDate?.toLowerCase().includes(this.ngayhoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.notes?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    this.calculator();
  }

  calculator(): void {
    this.tongchuavat = 0;
    this.vat = 0;
    this.tongtien = 0;
    this.listFilter.forEach(it => {
      this.tongchuavat += it.amount;
      this.vat += it.vat;
      this.tongtien += it.amountAfterVAT;
    })
  }

  loadShipment(): void {
    if (this._customerId == null)
      return;
    if (this._shipmentId != undefined && this._shipmentId != null && this._shipmentId != 0) {
      this.shipmentService.getDetail(this._shipmentId.toString()).subscribe((res: ResponseValue<Shipment>) => {
        let item: Shipment = res.data;
        this.listShipments = [];
        this.listShipments.push({ id: item.id, jobId: item.jobId });
        this.getThongTinJob(item);
      });
    }
    else {
      const params = new HttpParams()
        .set('branchId', this._branchId?.toString())
        .set('customerId', this._customerId?.toString())
      this.shipmentService.getForDebitNotes(params).subscribe((res: ResponseValue<Shipment[]>) => {
        this.listShipments = res.data;
      });
    }
  }

  isDeb = false;
  changedShipment(item: Shipment): void {
    if (!item) {
      this.listChiPhiLoHang = [];
      this.listDetail = [];
    } else {
      this.isDeb = item.isDeb;
      this._ngayDoanhThu = moment(item.jobDate).format('DD/MM/YYYY');
      this.getThongTinJob(item);
      this.loadChiPhi(item);
      if (this.entity.id == undefined) {
        this.loadSoHoaBaoGia(item);
      }
    }
  }
  debt(): void {
    this.viewDebt = true;
    setTimeout(() => {
      this.modalAddEdit.add(this.entity);
    }, 50);
  }
  closeDebt(): void {
    this.viewDebt = false;
  }
  getThongTinJob(item: Shipment): void {
    if (item) {
      this._sId = item.id;
      this._thongTinLoHang = '';
      this._thongTinLoHang += 'Tờ khai: ' + (item.cdsNumber ?? '');
      this._thongTinLoHang += '/Booking: ' + (item.bookingNo ?? '');
      this._thongTinLoHang += '/HBill: ' + (item.hawB_HBL ?? '');
      this._thongTinLoHang += '/Invoice: ' + (item.invoiceNo ?? '');
      this._thongTinLoHang += '/Loại hình: ' + (item.shipmentTypeName ?? '');
      if (this.entity.id == undefined) {
        this._luongHang = '';
        if (item.weight && item.weight > 0)
          this._luongHang += 'GW: ' + item.weight.toString();
        if (item.volume && item.volume > 0)
          this._luongHang += (this._luongHang.length > 0 ? ' -Cbm: ' : 'Cbm: ') + item.volume.toString();
        if (item.conts)
          this._luongHang += (this._luongHang.length > 0 ? ' -Cont: ' : 'Cont: ') + item.conts;
        if (item.cartons && item.cartons > 0)
          this._luongHang += (this._luongHang.length > 0 ? ' -Pkg: ' : 'Pkg: ') + item.cartons.toString();
        if (item.pallets && item.pallets > 0)
          this._luongHang += (this._luongHang.length > 0 ? ' -Plt: ' : 'Plt: ') + item.pallets.toString();
        this.entity.notes = item.notes;
        if (this.listDebitTypes?.findIndex(x => x.categoryCode == item.shipmentTypeName) != -1) {
          this.entity.debitType = item.shipmentTypeName;
        }
      }
    }
  }

  loadChiPhi(job: Shipment): void {
    if (job) {
      const params = new HttpParams()
        .set('branchId', this._branchId?.toString())
        .set('jobId', job.jobId)
        .set('shipmentId', job.id.toString());
      this.paymentsService.getPaymentByJob(params).subscribe((res: ResponseValue<PaymentDetail[]>) => {
        this.listChiPhiLoHang = res.data;
        this.listFilter = this.listChiPhiLoHang;
        this.calculator();
      });
    }
  }

  loadSoHoaBaoGia(job: Shipment): void {
    this.shipmentService.getDetail(job.id.toString()).subscribe((res: ResponseValue<Shipment>) => {
      if (res.code == '200' || res.code == '201') {
        let listDichVuSoHoa = res.data.shipmentServiceDetails ?? [];
        if (listDichVuSoHoa && listDichVuSoHoa.length != 0) {
          this.listDetail = [];
          let tongThanhTien = 0;
          listDichVuSoHoa.forEach(x => {
            let item: DebitNoteDetail = {};
            item.feeId = x.feeId;
            item.quantity = x.num;
            item.unit = x.unit;
            item.contents = x.contents;
            item.price = x.amount;
            item.amount = x.num * x.amount;
            item.vat = item.amount * this._vat / 100;
            item.rVat = this._vat;
            item.amountAfterVAT = item.amount + item.vat;
            item.tempId = x.id;
            this.listDetail.push(item);
            //tinh tong tien

            tongThanhTien += +(item.amountAfterVAT ?? 0);

          });
          this.entity.totalAmount = tongThanhTien;
          this.inputTen();
        }
        else {
          this.inputTen();
        }
      }
    });
  }

  loadFee(): void {
    const params = new HttpParams()
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(_ => _.groupCode == 'DT01' || _.groupCode == 'CP03' || _.groupCode == 'DT03') || [];
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

  loadOtherCategory(): void {
    const params = new HttpParams()
      .set('type', '');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listDebitTypes = [...res.data.filter(x => x.type === 'DEBIT_TYPE')];
      this.listTienTes = [...res.data.filter(x => x.type === 'CURRENCY')];
    });
  }

  selectedNgayLam(event): void {
    this._ngayLamDebit = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayLam(event): void {
    if (this._ngayLamDebit == null)
      this._ngayLamDebit = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  selectedNgayDoanhThu(event) {
    var d = new Date();
    var currDate = d.getDate();
    var currMonth = d.getMonth() + 1;
    var currYear = d.getFullYear();
    //Nếu là update thì phải chỉnh lại là ngày tạo
    if (this.entity.id != undefined) {
      currDate = this.entity.creaatedDate.getDate();
      currMonth = this.entity.creaatedDate.getMonth() + 1;
      currYear = this.entity.creaatedDate.getFullYear();
    }
    let number = currYear * 100 + currMonth
    if (currDate > 13 && Number.parseInt(moment(event.start).format('YYYYMM')) < number) {
      this._notificationService.printAlert("Lỗi nhập liêu", "Không được lưa chọn tháng doanh thu nhở hơn tháng hiện tại!");
      this._ngayDoanhThu = '';
      return;
    }
    else if (Number.parseInt(moment(event.start).format('MM')) < currMonth - 1) {
      this._notificationService.printAlert("Lỗi nhập liêu", "Không được lưa chọn tháng doanh thu tháng trước nữa!");
      this._ngayDoanhThu = '';
      return;
    } else
      this._ngayDoanhThu = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayDoanhThu(event) {
    if (this._ngayDoanhThu == null || this._ngayDoanhThu?.length < 1)
      this._ngayDoanhThu = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  edit(id: number): void {
    this.debitNotesService.getDetail(id.toString()).subscribe((res: ResponseValue<DebitNotes>) => {
      if (res.code == '200' || res.code == '201') {
        this.flagXem = true;
        this.entity = res.data;
        this.flagLocked = (this.entity.step > 0 || this.entity.isDebitApproved);
        this._shipmentId = this.entity.shipmentId;
        this._sId = this.entity.shipmentId;
        this._customerId = this.entity.customerId;
        this._isChuyeduyet = this.entity.status;
        if (this.listPermissionCS.findIndex(z => z.customerId == this._customerId && z.isAcceptDebit) == -1 && !this.userLoged.isAdmin) {
          this._accept = false;
        }
        this._branchId = this.entity.branchId;
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this._ngayLamDebit = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }

        if (this.entity.debitDate) {
          this.dateTimeOptions2 = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.debitDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this._ngayDoanhThu = moment(this.entity.debitDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.accountingDate) {
          this.dateTimeOptions2 = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.accountingDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this._ngayHachtoan = moment(this.entity.accountingDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.listDetail = this.entity.debitNoteDetails ?? [];
        if (this.listDetail && this.listDetail.length != 0) {
          this.listDetail.every(_ => _.tempId = _.id);
        }
        this.flagSave = false;
        this.loadShipment();
        this.loadEmployee();
        let job: Shipment = { jobId: '', id: this.entity.shipmentId };
        this.loadChiPhi(job);
        if (this.entity.type == 1)
          this.loadSupplier();
        this._luongHang = this.entity.quantityOfGgoods;
        this.modalDebit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  save(frm: NgForm): void {
    if (frm.valid && !this.flagSave) {
      this.flagSave = true;
      if (this._ngayLamDebit)
        this.entity.refDate = moment(this._ngayLamDebit, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );

      if (this._ngayDoanhThu) {
        if (moment(this._ngayDoanhThu, FormatContstants.DATEVN).isValid()) {
          this.entity.debitDate = moment(this._ngayDoanhThu, FormatContstants.DATEVN).format(
            FormatContstants.CLIENTDATE
          );
        } else {
          this._notificationService.printErrorMessage("Ngày doanh thu không hợp lệ");
          this._ngayDoanhThu = '';
          return;
        }
      }
      this.entity.debitNoteDetails = this.listDetail.filter(
        (x) => x.feeId != undefined || x.feeId != null
      );
      if (this.entity.debitNoteDetails.length < 1) {
        this._notificationService.printErrorMessage("Chi tiết DebitNote không hợp lệ, kiểm tra lại!");
        return;
      }
      this.entity.quantityOfGgoods = this._luongHang;
      if (this.entity.id == undefined) {
        this.debitNotesService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            // frm.resetForm();
            this.entity.id = res.data.id;
            this.entity.debitNo = res.data.debitNo;
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data.id);
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
        this.debitNotesService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            // frm.resetForm();
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

  handleCancel() {
    this.localtion.back();
  }

  onChangeVat(data: DebitNoteDetail) {
    let s1 = +(data.amount ?? 0);
    let vat = +(data.vat ?? 0);
    data.amountAfterVAT = s1 + vat;
    this.sumTien();
  }

  onChangeTien(data: DebitNoteDetail) {
    let sl = +(data.quantity ?? 0);
    let dg = +(data.price ?? 0);
    if (sl > 0 && dg > 0)
      data.amount = sl * dg;
    let s1 = +(data.amount ?? 0);
    let rvat = +(data.rVat ?? 0);
    data.vat = data.currency == 'VND' ? Math.round(s1 * rvat / 100) : Math.round(s1 * rvat) / 100;
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
  }

  inputTen() {
    if (this.listDetail?.length == 0) {
      let item: DebitNoteDetail = {
        tempId: 1,
        contents: '',
        amount: 0,
        notes: '',
        feeId: null,
        rVat: this._vat,
        currency: 'VND'
      };
      this.listDetail.push(item);
    } else {
      let arrayId = this.listDetail?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });
      let _item = this.listDetail?.find((x) => x.tempId == maxId);
      if (_item && _item.feeId) {
        let item: DebitNoteDetail = {
          tempId: maxId + 1,
          contents: '',
          amount: 0,
          notes: '',
          feeId: null,
          rVat: this._vat,
          currency: 'VND'
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

  accept(item: DebitNoteDetail, key: string) {
    this.submit(item, key);
  }

  submit(entity: DebitNoteDetail, key: string): void {
    let item: any = {
      id: entity.id.toString(),
      text: key
    };
    this.debitNotesService.accept(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalDebit.hide();
        this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
        this.SaveSuccess.emit(res.data.id);
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      }
    }, () => {
      this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
    });
  }

  viewRating: boolean;
  @ViewChild(ModalCsRatingComponent, { static: false }) modalRating: ModalCsRatingComponent;
  showRating(): void {
    this.viewRating = true;
    let item: RatingCS = {
      debitId: this.entity.id,
      employeeId: this.entity.employeeId,
      debitNo: this.entity.debitNo
    };
    setTimeout(() => {
      this.modalRating.add(item);
    }, 50);
  }

  saveRating(event: any): void {

  }

  closeRating(): void {
    this.viewRating = false;
  }

  _flagShowPayment: boolean = true;
  showChiPhi(): void {
    this._flagShowPayment = !this._flagShowPayment;
  }
  showDebit(): void {
    this._flagViewInfor = !this._flagViewInfor;
  }

  // _flagShowDebit: boolean = true;
  // showDebit(): void {
  //   this._flagShowDebit = !this._flagShowDebit;
  // }

  getCP03(): void {

    if (this.listChiPhiLoHang?.findIndex(x => x.feeCode.startsWith('CP03')) != -1) {
      let n = this.listDetail.length;
      if (n > 0) {
        this.listDetail.splice(n - 1, 1);
        this.listChiPhiLoHang?.forEach(x => {
          if (x.feeCode.startsWith('CP03')) {
            let item: DebitNoteDetail = {};
            item.tempId = n;
            item.feeId = x.feeId;
            item.amount = x.amount;
            item.vat = x.vat;
            item.amountAfterVAT = x.amountAfterVAT;
            item.contents = x.contents;
            item.invoiceNo = x.invoiceNo;
            item.invoiceDate = x.invoiceDate;
            item.notes = x.notes;
            this.listDetail.push(item);
            n++;
          }
        });
        this.sumTien();
        this.listDetail = [...this.listDetail];
        this.inputTen();
      }

    }

  }

  getDef(): void {
    if (this.listDetail?.length > 1) {
      this._notificationService.printConfirmationDialog('Bạn muốn lấy mã phí mặc định cho Debit-Note?', () => this.okDef());
    }
    else {
      this.okDef();
    }
  }

  okDef(): void {
    let listDef: Fee[] = [];
    if (this.listFeebyCus) {
      let lst = this.listFeebyCus?.split(',');
      lst?.forEach(element => {
        listDef.push({ id: parseInt(element) });
      });
    }
    if (listDef.length == 0) {
      listDef = this.listFee.filter(x => x.groupCode == "DT01" && x.isDef);
    }
    if (listDef?.length > 0) {
      let n = this.listDetail.length;
      if (n > 0) {
        this.listDetail.splice(n - 1, 1);
        listDef?.forEach(x => {
          let item: DebitNoteDetail = {};
          item.tempId = n;
          item.feeId = x.id;
          item.amount = 0;
          item.vat = 0;
          item.rVat = this._vat
          item.amountAfterVAT = 0;
          item.contents = null;
          item.invoiceNo = null;
          item.invoiceDate = null;
          item.notes = null;
          item.currency = 'VND';
          this.listDetail.push(item);
          n++;
        });
        this.listDetail = [...this.listDetail];
        this.inputTen();
      }
    }
  }


  viewAttachFiles: boolean;
  showFiles(): void {
    if (this.entity.shipmentId) {
      this.viewAttachFiles = true;
      let item: Attachfiles = {
        frmName: 'SHIPMENT',
        functionName: 'SHIPMENT',
        refNo: this.entity.shipmentId?.toString(),
        readOnly: true
      }
      setTimeout(() => {
        this.modalAttackFiles.edit(item, false);
      }, 50);
    }
  }

  showDispatchOrder(): void {
    this.viewDispatchOrder = true;
    setTimeout(() => {
      this.modalListDispatchOrder.view(this._sId.toString(), false);
    }, 50);
  }
  showDispatchOrderFCl(): void {
    this.viewDispatchOrder = true;
    setTimeout(() => {
      this.modalListDispatchOrder.view(this._sId.toString(), true);
    }, 50);
  }

  showFiles2(job: PaymentDetail) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'PAYMENT',
      functionName: 'PAYMENT',
      refNo: job.paymentId?.toString(),
      readOnly: true
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }

  changedVAT(): void {
    this.listDetail.forEach(x => {
      x.rVat = this._vat;
      this.onChangeTien(x);
    });
    this.sumTien();
  }

  viewModalJob = false;
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  showJob(): void {
    if (this.entity.shipmentId) {
      this.viewModalJob = true;
      setTimeout(() => {
        this.modalJob.edit(this.entity?.shipmentId?.toString(), true);
      }, 50);
    }
  }
  closeModalJob() {
    this.viewModalJob = false;
  }


  viewSearchJobId = false;
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalSearchJob: ModalShipmentViewSearchComponent
  FindJob(): void {
    if (this.entity.customerId) {
      this.viewSearchJobId = true;
      setTimeout(() => {
        this.modalSearchJob.showSearchJob();
      }, 50);
    }
  }

  saveSuccessSearchJob(job: Shipment): void {
    this.entity.shipmentId = job.id;
    this.changedShipment(job);
  }

  saveSuccessDebt() {
    this.entity.isDebt = true;
  }

  closeSearchJob() {
    this.viewSearchJobId = false;
  }
  closeDispatchOrder() {
    this.viewDispatchOrder = false;
  }

  showPrint(kieu: number) {
    setTimeout(() => {
      this.debitNotesService.getDetail(this.entity.id.toString()).subscribe((res: ResponseValue<DebitNotes>) => {
        if (res.code == '200' || res.code == '201') {
          this.print(res.data, kieu)
        }
      });
    }, 50);
  }

  print(entity: DebitNotes, kieu: number) {
    let _entity: any = {};

    _entity.Ngay = moment(entity.debitDate, FormatContstants.DATETIMEEN).format(
      'DD-MMM-YY'
    );
    if (entity.tenKhachHang?.toLowerCase().includes('dsv')) entity.debitNo = entity.debitNo.substring(2);
    _entity.DebitNo = entity.debitNo;
    _entity.TenCongTy = entity.tenCongTy ?? '';
    _entity.DiaChiCongTy = entity.diaChiCongTy ?? '';
    _entity.DienThoaiCongTy = entity.dienThoaiCongTy ?? '';
    _entity.FaxCongTy = entity.faxCongTy ?? '';
    _entity.TenKhachHang = entity.tenKhachHang ?? '';
    _entity.DiaChiKhachHang = entity.diaChiKhachHang ?? '';
    _entity.MaSoThue = 'MST: ' + (entity.maSoThue ?? '');
    _entity.LoaiHinh = entity.tenLoaiHinh ?? '';
    _entity.HBill = entity.hawB_HBL ?? '';
    _entity.MBill = entity.mawB_MBL ?? ''
    _entity.InVoiceNo = entity.invoiceNo ?? '';
    _entity.CDFNo = entity.cdsNumber;
    _entity.LuongHang = entity.quantityOfGgoods;
    _entity.GhiChu = entity.notes;
    _entity.MstCongty = entity.mstCongTy;
    _entity.Accounts = entity.accounts;
    _entity.Bank = entity.bank;
    _entity.HadgDate = moment(entity.ngayToKhai, FormatContstants.DATETIMEEN).format(
      'DD-MMM-YY'
    );
    // _entity.HadgDate=entity.ngayToKhai;
    _entity.DebitChiTiets = [];
    let vat = 0;
    let vatVND = 0;
    let vatUSD = 0;
    entity.debitNoteDetails.forEach(x => {
      let item: any = {};
      item.TenPhi = x.feeName;
      item.SoHoaDon = x.invoiceNo;
      item.DonViTinh = x.unit;
      item.DonGia = x.price;
      item.SoLuong = x.quantity;

      vat = vat == 0 ? x.rVat : vat;
      if (x.rVat > 0) {
        vatVND += x.currency == 'VND' ? x.vat : 0;
        vatUSD += x.currency == 'USD' ? x.vat : 0;
        item.VND = x.currency == 'VND' ? x.amount : null;
        item.USD = x.currency == 'USD' ? x.amount : null;
      }
      else {
        item.VND = x.currency == 'VND' ? x.amountAfterVAT : null;
        item.USD = x.currency == 'USD' ? x.amountAfterVAT : null;
      }
      _entity.DebitChiTiets.push(item);
    });
    if (vatUSD + vatVND > 0) {
      let item: any = {};
      item.TenPhi = 'VAT ' + vat.toString() + '%';
      item.SoHoaDon = '';
      item.VND = vatVND;
      item.USD = vatUSD;
      _entity.DebitChiTiets.push(item);
    }
    let printContents;
    let noiDung: string = "";

    let list = localStorage.getItem(SystemContstants.LISTMAUIN);
    if (list != null) {
      let listMauIn: PrintForm[] = JSON.parse(list);
      let index = listMauIn.findIndex(x => x.type == kieu);
      if (index != -1)
        noiDung = listMauIn[index].content;
    }
    // console.log(noiDung);

    printContents = this._utilityService.printDebitNote(noiDung, _entity);

    printContents = '<div class="kho-giay page-a4">' + printContents + '</div>';
    var newWin = window.frames["printf"];
    newWin.document.write(`
      <html>
        <head>
          <title>---------------THANK YOU FOR DOING BUSINESS WITH US!--------------</title>
          <link rel="stylesheet" type="text/css" href="../../../assets/css/print.css" />
        </head>
        <body onload="window.print(); window.close()">${printContents}</body>
      </html>`
    );
    newWin.document.close();
  }
  selectedNgayHachtoan(event) {
    this._ngayHachtoan = moment(event.start).format("DD/MM/YYYY");
  }
  closedNgayHachtoan(event) {
    if (this._ngayHachtoan == null || this._ngayHachtoan?.length < 1)
      this._ngayHachtoan = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  closeModal() {
    this.viewModal = false;
  }

  closeModalFcl() {
    this.viewFcl = false;
  }
  closeModalCbt() {
    this.viewCbt = false;
  }
  closePayment() {
    this.viewPayment = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
