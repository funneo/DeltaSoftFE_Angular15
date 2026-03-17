import { HttpParams } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MessageContstants } from "@app/shared/constants";
import {
  Debt,
  Pagination,
  ResponseValue,
  Customer,
  Supplier,
  DebtReportViewModel,
  ReportViewModel,
  Branch,
  Payments,
} from "@app/shared/models";
import {
  NotificationService,
  UtilityService,
  AuthService,
  CustomerService,
  ReportsService,
  BranchService,
  PaymentsService,
} from "@app/shared/services";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { environment } from "@environments/environment";
import { Router } from "@angular/router";
import { ModalShipmentComponent } from "@app/shared/components/shipments/modal-shipment/modal-shipment.component";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import { DatePipe } from "@angular/common";
import { ExportService } from "@app/shared/services/export-excel.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ModalPaymentDetailComponent } from "@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.component";

@Component({
  selector: "app-report-payment-detail",
  templateUrl: "./report-payment-detail.component.html",
  styleUrls: ["./report-payment-detail.component.css"],
})
export class ReportPaymentDetailComponent implements OnInit {
  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  soTien = 0;
  tienVat = 0;
  tongTien = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listData: ReportViewModel[];
  listFilter: ReportViewModel[];
  listSupplier: Supplier[];
  listCustomer: Customer[];
  _customerId?: number;
  _branchId: number;
  busy: Subscription;
  viewModal = false;
  //bien tim kiem
  makhSearch?: string;
  jobIdSearch?: string;
  loaihinhSearch?: string;
  tokhaiSearch?: string;
  ngaytokhaiSearch?: string;
  vandonSearch?: string;
  bookingSearch?: string;
  invoiceSearch?: string;
  sottSearch?: string;
  ngayttSearch?: string;
  maphiSearch?: string;
  nhomdtSearch?: string;
  nhomttSearch?: string;
  tenphiSearch?: string;
  diengiaiSearch?: string;
  sotienSearch?: string;
  vatSearch?: string;
  sotienvatSearch?: string;
  sohoadonSearch?: string;
  ngayhoadonSearch?: string;
  mauhoadonSearch?: string;
  ghichuphieuSearch?: string;
  tknoSearch?: string;
  tkcoSearch?: string;
  noidungSearch?: string;
  referCodeSearch?: string;
  ghichuSearch?: string;
  loaittSearch?: string;
  nguoittSearch?: string;
  tenkhSearch?: string;
  dvttSearch?: string;
  selectedType?: number = 0;
  phapnhanSearch = "";
  array = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Tiền mặt" },
    { value: 2, text: "Chuyển khoản/Trả sau" },
  ];
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  // listTypes = [{ id: 0, text: 'Debit-note' }, { id: 1, text: 'Thanh toán' }];
  _quyen = 5;
  listStep: any[] = [
    { id: 5, text: "Đã chi" },
    { id: 1, text: "Đã duyệt" },
    { id: 0, text: "Chưa duyệt" },
    { id: 3, text: "Khởi tạo" },
    { id: 4, text: "Từ chối" },
    { id: 2, text: "Tất cả" },
  ];
  _trangThai = 2;
  listType: any[] = [
    { id: 0, text: "Tiền mặt" },
    { id: 1, text: "Trả sau" },
    { id: 2, text: "Tất cả" },
  ];
  listTypePayment = UtilityService.listTypePayment();
  _reportType = false;
  _type = 2;
  dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  listBranch: Branch[];
  viewModalJob = false;

  @ViewChild(ModalShipmentComponent, { static: false })
  modalJob: ModalShipmentComponent;
  constructor(
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private cdr: ChangeDetectorRef,
    private reportsService: ReportsService,
    private authService: AuthService,
    private customerService: CustomerService,
    private exportService: ExportService,
    private spinner: NgxSpinnerService,
    private branchService: BranchService,
    private router: Router,
    public datepipe: DatePipe,
    private paymentsService: PaymentsService
  ) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._quyen = parseInt(user.authorisationLevel);

    let list: any[] = UtilityService.getLocalParams(
      SystemContstants.APPSETTING
    );
    // Lấy tên theo file json
    if (list?.filter((x) => x.id == "PAYMENT-TYPE")?.length > 0) {
      this.listType = [];
      list
        ?.filter((x) => x.id == "PAYMENT-TYPE")
        ?.forEach((z) => {
          this.listType.push({ id: z.value, text: z.text });
        });
      this.listType.push({ id: 2, text: "Tất cả" });
    }
  }

  ngOnInit(): void {
    var p = UtilityService.getLocalParams("PAYMENTDETAIL");
    localStorage.removeItem("PAYMENTDETAIL");
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this._customerId = p.customerId;
      this._trangThai = p.trangthai;
      this.keyword = p.keyword;
      this._type = p.type;
      this._branchId = p.branchid;
    } else {
      this.ngayBatDau = new Date(
        moment().hours(0).minutes(0).seconds(0).startOf("month").toString()
      );
      this.ngayKetThuc = new Date(
        moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
      );
    }
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.loadCustomer();
    this.loadBranch();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService
      .getAll(params)
      .subscribe((res: ResponseValue<Customer[]>) => {
        this.listCustomer = res.data;
      });
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }
  loadData(): void {
    this.spinner.show();
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("keyword", this.keyword)
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", this.pageSize.toString())
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("customerId", this._customerId?.toString())
      .set("branchId", this._branchId?.toString())
      .set("step", this._trangThai.toString())
      .set("type", this._type.toString())
      .set("reporttype", this._reportType ? "1" : "0");
    this.busy = this.reportsService
      .getPaymentDetail(params)
      .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
        if (res.code == "200" || res.code == "201") {
          this.listData = res.data?.items;
          this.filter();
          this.spinner.hide();
          // this.totalRows = res.data?.totalRows;
          // this.soTien=res.data?.totalAmount;
          // this.tienVat=res.data?.totalVat;
          // this.tongTien=res.data?.totalAmountVat;
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
          this.spinner.hide();
        }
      });
  }
  calculate() {
    this.soTien = 0;
    this.tienVat = 0;
    this.tongTien = 0;
    this.totalRows = this.listFilter.length;
    this.listFilter.forEach((it) => {
      this.soTien += it.soTien;
      this.tienVat += it.vat;
      this.tongTien += it.tongTien;
    });
  }
  filter() {
    this.listFilter = Object.assign([], this.listData);
    this.cdr.detectChanges();
    if (this.makhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerCode
          .toString()
          .toLowerCase()
          .includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if (this.jobIdSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId
          ?.toLowerCase()
          .includes(this.jobIdSearch.trim().toLocaleLowerCase());
      });
    if (this.tenkhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName
          ?.toLowerCase()
          .includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if (this.loaihinhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.loaiHinh
          ?.toLowerCase()
          .includes(this.loaihinhSearch.trim().toLocaleLowerCase());
      });
    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.referCodeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.referCode
          ?.toLowerCase()
          .includes(this.referCodeSearch.trim().toLocaleLowerCase());
      });
    if (this.phapnhanSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.phapnhan
          ?.toLowerCase()
          .includes(this.phapnhanSearch.trim().toLocaleLowerCase());
      });
    if (this.ngaytokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.cdsDate, "dd/MM/yyyy")
          .toLowerCase()
          .includes(this.ngaytokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.vandonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL
          ?.toLowerCase()
          .includes(this.vandonSearch.trim().toLocaleLowerCase());
      });
    if (this.bookingSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo
          ?.toLowerCase()
          .includes(this.bookingSearch.trim().toLocaleLowerCase());
      });
    if (this.invoiceSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo
          ?.toLowerCase()
          .includes(this.invoiceSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayhoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceDate
          ?.toLowerCase()
          .includes(this.ngayhoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.mauhoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoicePattern
          ?.toLowerCase()
          .includes(this.mauhoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.sottSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soPhieu
          ?.toLowerCase()
          .includes(this.sottSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayttSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.ngay, "dd/MM/yyyy")
          .toLowerCase()
          .includes(this.ngayttSearch.trim().toLocaleLowerCase());
      });
    if (this.maphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.maPhi
          ?.toLowerCase()
          .includes(this.maphiSearch.trim().toLocaleLowerCase());
      });
    if (this.nhomdtSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.revenueGroupCode
          ?.toLowerCase()
          .includes(this.nhomdtSearch.trim().toLocaleLowerCase());
      });
    if (this.nhomttSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.paymentGroupCode
          ?.toLowerCase()
          .includes(this.nhomdtSearch.trim().toLocaleLowerCase());
      });
    if (this.tenphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tenPhi
          ?.toLowerCase()
          .includes(this.tenphiSearch.trim().toLocaleLowerCase());
      });
    if (this.diengiaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.noiDung
          ?.toLowerCase()
          .includes(this.diengiaiSearch.trim().toLocaleLowerCase());
      });
    if (this.sotienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soTien
          ?.toString()
          .toLowerCase()
          .includes(this.sotienSearch.trim().toLocaleLowerCase());
      });
    if (this.vatSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.vat
          ?.toString()
          .toLowerCase()
          .includes(this.vatSearch.trim().toLocaleLowerCase());
      });
    if (this.sotienvatSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.tongTien
          ?.toString()
          .toLowerCase()
          .includes(this.sotienvatSearch.trim().toLocaleLowerCase());
      });
    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.soHoaDon
          ?.toLowerCase()
          .includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuphieuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note
          ?.toLowerCase()
          .includes(this.ghichuphieuSearch.trim().toLocaleLowerCase());
      });
    if (this.tknoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.debitAccount
          ?.toLowerCase()
          .includes(this.tknoSearch.trim().toLocaleLowerCase());
      });
    if (this.tkcoSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.creditAccount
          ?.toLowerCase()
          .includes(this.tkcoSearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.contents
          ?.toLowerCase()
          .includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ghiChu
          ?.toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.selectedType > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType == 1 ? data.type == "0" : data.type == "1";
      });
    }
    if (this.loaittSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.type
          ?.toString()
          .toLowerCase()
          .includes(this.loaittSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoittSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeName
          ?.toLowerCase()
          .includes(this.nguoittSearch.trim().toLocaleLowerCase());
      });
    if (this.dvttSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.supplierName
          ?.toLowerCase()
          .includes(this.dvttSearch.trim().toLocaleLowerCase());
      });

    if (this._trangThai == 4) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.step == -1;
      });
    } else if (this._trangThai == 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.step == 0 && data.status == 1;
      });
    } else if (this._trangThai == 3) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.step == 0 && data.status == 0;
      });
    } else if (this._trangThai == 1) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.duyet && !data.isPaymented;
      });
    } else if (this._trangThai == 5) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.isPaymented;
      });
    }
    this.calculate();
  }
  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  // showPayment(item: ReportViewModel): void {
  //   let p={
  //     d1:moment(this.ngayBatDau).format('YYYY-MM-DD'),
  //     d2:moment(this.ngayKetThuc).format('YYYY-MM-DD'),
  //     customerId:this._customerId,
  //     branchid:this._branchId,
  //     trangthai:this._trangThai,
  //     type:this._type,
  //     keyword:this.keyword,
  //   }
  //   UtilityService.setLocalParams(p,'PAYMENTDETAIL');
  //   let id=item.id;
  //   this.router.navigateByUrl('/main/advance-payment/payment/detail/' + id + '/' + true);
  // }

  showJob(item: ReportViewModel): void {
    if (item.shipmentId) {
      this.viewModalJob = true;
      setTimeout(() => {
        this.modalJob.edit(item?.shipmentId?.toString(), true);
      }, 50);
    }
  }
  closeModalJob() {
    this.viewModalJob = false;
  }
  // exportExcel() {
  //   console.log(this.listFilter);
  //   let list=this.listFilter.map((({ id, ...item }) => item));
  //    this.exportService.exportExcel(list, 'chitietthanhtoan');
  // }

  viewPayment: boolean;
  @ViewChild(ModalPaymentDetailComponent, { static: false })
  modalPayment: ModalPaymentDetailComponent;

  showPayment(ref: string): void {
    this.paymentsService
      .getByRefNo(ref)
      .subscribe((res: ResponseValue<Payments>) => {
        let t = res.data;
        if (res.code == "200" || res.code == "201") {
          this.viewPayment = true;
          setTimeout(() => {
            this.modalPayment.edit(t.id, true);
          }, 50);
        }
      });
  }
  closePayment() {
    this.viewPayment = false;
  }

  exportExcel(): void {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("keyword", this.keyword)
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", this.pageSize.toString())
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("customerId", this._customerId?.toString())
      .set("branchId", this._branchId?.toString())
      .set("type", this._type.toString())
      .set("reporttype", this._reportType ? "1" : "0");
    this.busy = this.reportsService
      .exportPaymentDetail(params)
      .subscribe((res: ResponseValue<Pagination<ReportViewModel>>) => {
        if (res.code == "200" || res.code == "201") {
          var a = document.createElement("a");
          a.href = environment.apiUrl + res.data;
          a.download;
          a.click();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }
}
