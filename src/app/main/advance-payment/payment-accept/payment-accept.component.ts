import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import {
  Branch,
  Pagination,
  PaymentDetail,
  Payments,
  ResponseValue,
} from "@app/shared/models";
import { Router } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import {
  AuthService,
  BranchService,
  NotificationService,
  PaymentsService,
  UtilityService,
} from "@app/shared/services";
import * as moment from "moment";
import { HttpParams } from "@angular/common/http";
import { MessageContstants } from "@app/shared/constants";
import { ModalAttachfileComponent } from "@app/shared/components/systems/modal-attachfile/modal-attachfile.component";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { ModalShipmentComponent } from "@app/shared/components/shipments/modal-shipment/modal-shipment.component";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import { ModalPhieuChiComponent } from "@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component";
import { ModalPhieuThuComponent } from "@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component";
import { ModalPhieuChiMultiComponent } from "@app/shared/components/accounting/modal-phieu-chi-multi/modal-phieu-chi-multi.component";
import { environment } from "@environments/environment";
import * as signalR from "@aspnet/signalr";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-payment-accept",
  templateUrl: "./payment-accept.component.html",
  styleUrls: ["./payment-accept.component.css"],
})
export class PaymentAcceptComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = "";
  flagXem: boolean;
  listDetail: PaymentDetail[];
  listFilter: PaymentDetail[];
  flagSave: boolean = false;
  busy: Subscription;
  isAdmin = false;
  listBranch: Branch[];
  listB: any[];
  _auth: number = 5;
  _branchId: number;
  listStep: any[] = [
    { id: 1, text: "Đã duyệt" },
    { id: 0, text: "Chưa duyệt" },
    { id: 2, text: "Tất cả" },
  ];
  _trangThai = 2;
  listType: any[] = [
    { id: 0, text: "Tiền mặt" },
    { id: 1, text: "Trả sau" },
    { id: 2, text: "Tất cả" },
  ];
  _type = 2;
  maphiSearch?: string;
  tenphiSearch?: string;
  diengiaiSearch?: string;
  sotienSearch?: string;
  vatSearch?: string;
  tongtienSearch?: string;
  sohoadonSearch?: string;
  ngayhdSearch?: string;
  mstSearch?: string;
  cnSearch?: string;
  ghichuSearch?: string;
  jobidSearch?: string;
  tokhaiSearch?: string;
  hbilSearch?: string;
  bookingSearch?: string;
  noidungSearch?: string;
  sophieuSearch?: string;
  nguoittSearch?: string;
  referCodeSearch?: string;
  _functionId = SystemContstants.PA;
  quantitySeach1?: string;
  grossWeightSeach1?: string;
  selectedType?: number = 0;
  _hubConnection: signalR.HubConnection;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Tiền mặt" }, { "value": 2, "text": "Chuyển khoản/Trả sau" }];
  listTypePayment = UtilityService.listTypePayment();
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild(ModalPhieuChiComponent, { static: false })
  modalPhieuChi: ModalPhieuChiComponent;
  @ViewChild(ModalPhieuThuComponent, { static: false })
  modalPhieuThu: ModalPhieuThuComponent;
  @ViewChild(ModalPhieuChiMultiComponent, { static: false })
  modalPhieuChiMulti: ModalPhieuChiMultiComponent;
  constructor(
    private authService: AuthService,
    private paymentsService: PaymentsService,
    private router: Router,
    private _utilityService: UtilityService,
    private notificationService: NotificationService, private spinner: NgxSpinnerService,
    private branchService: BranchService
  ) {
    let user = this.authService.getLoggedInUser();
    this.isAdmin = user.isAdmin;
    this._auth = Number.parseInt(user.authorisationLevel);
    this._branchId = Number.parseInt(user.branchId);
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
    //signalR Reload data when received push
    // this._hubConnection = new signalR.HubConnectionBuilder()
    //   .withUrl(`${environment.apiUrl}/signalr`)
    //   .build();

    // this._hubConnection
    //   .start()
    //   .then(() => console.log("Connection started!"))
    //   .catch((err) => console.log("Error while establishing connection :("));

    // this._hubConnection.on("sendToAll", (receivedMessage: string) => {
    //   this.loadData();
    // });
  }
  ngOnInit(): void {
    var p = UtilityService.getLocalParams(this._functionId);
    localStorage.removeItem(this._functionId);
    if (p != null) {
      this._branchId = p.branchId;
      this._type = p.type;
      this.keyword = p.keyword;
      this._trangThai = p.trangthai;
    }
    this.ngayBatDau = new Date(moment().subtract(30, "days").toString());
    this.ngayKetThuc = new Date(
      moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
    );
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.loadChiNhanh();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
      this.listB = [];
      this.listBranch?.forEach((x) => {
        this.listB.push({ id: x.id, text: x.branchCode });
      });
    });
  }

  changedChiNhanh() {
    this.timKiem();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  loadData(): void {
    this.spinner.show();
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("keyword", this.keyword)
      .set("type", this._type?.toString())
      .set("step", this._trangThai.toString())
      .set("branchId", this._branchId?.toString());
    this.busy = this.paymentsService
      .getAcceptStep2(params)
      .subscribe((res: ResponseValue<PaymentDetail[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDetail = res.data;
          this.filter();
          this.spinner.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          ); this.spinner.hide();
        }
      });
  }
  filter() {
    this.listFilter = Object.assign([], this.listDetail);
    console.log(this.listFilter);

    if (this.selectedType > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType == 1 ? data.type == 0 : data.type == 1;
      });
    }
    if (this.maphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.feeCode
          .toString()
          .toLowerCase()
          .includes(this.maphiSearch.trim().toLocaleLowerCase());
      });
    if (this.jobidSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.jobId
          ?.toLowerCase()
          .includes(this.jobidSearch.trim().toLocaleLowerCase());
      });
    if (this.tenphiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.feeName
          ?.toLowerCase()
          .includes(this.tenphiSearch.trim().toLocaleLowerCase());
      });
    if (this.diengiaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.contents
          ?.toLowerCase()
          .includes(this.diengiaiSearch.trim().toLocaleLowerCase());
      });
    if (this.sotienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.amount
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
    if (this.tongtienSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.amountAfterVAT
          ?.toString()
          .toLowerCase()
          .includes(this.tongtienSearch.trim().toLocaleLowerCase());
      });
    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo
          ?.toLowerCase()
          .includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayhdSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceDate
          ?.toLowerCase()
          .includes(this.ngayhdSearch.trim().toLocaleLowerCase());
      });

    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.mstSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.taxNumber
          ?.toLowerCase()
          .includes(this.mstSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.ghiChu
          ?.toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.bookingSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo
          ?.toLowerCase()
          .includes(this.bookingSearch.trim().toLocaleLowerCase());
      });
    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.hbilSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL
          ?.toLowerCase()
          .includes(this.hbilSearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.noiDung
          ?.toLowerCase()
          .includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoittSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.employeeName
          ?.toLowerCase()
          .includes(this.nguoittSearch.trim().toLocaleLowerCase());
      });
    if (this.sophieuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo
          ?.toLowerCase()
          .includes(this.sophieuSearch.trim().toLocaleLowerCase());
      });
    this.totalRows = this.listFilter?.length;
  }

  viewPayment(id: number) {
    let p = {
      trangthai: this._trangThai,
      branchId: this._branchId,
      type: this._type,
      keyword: this.keyword,
    };
    UtilityService.setLocalParams(p, this._functionId);
    this.router.navigateByUrl(
      "/main/advance-payment/payment/detail/" + id.toString() + "/" + true
    );
  }

  accept(item: PaymentDetail, key: string) {
    //this._notificationService.printConfirmationDialog('Bạn có chắc muốn kết thúc hợp đồng không?', () => this.accept(item,key));
    this.submit(item, key);
  }

  // submit(entity: PaymentDetail, key: string): void {
  //   let b = key == 'true';
  //   let item: Payments = {
  //     id: entity.id,
  //     feedback:'',
  //     status: b
  //   };
  //   let _ok = b;
  //   if (!b) {
  //     let retVal = prompt("Lý do từ chối", '');
  //     if (retVal) {
  //       _ok = true;
  //     }
  //     item.feedback = retVal ?? '';
  //   }
  //   if (_ok) {
  //   this.paymentsService.accept(item).subscribe((res: ResponseValue<any>) => {
  //     if (res.code == '200' || res.code == '201') {
  //       this.loadData();
  //     }
  //     else {
  //       this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
  //     }
  //   }, () => {
  //     this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
  //   });
  // }
  // }
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
      copy.step = 2;
    }
    if (_ok) {
      this.paymentsService.acceptStep(copy).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.loadData();
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG
            );
          }
        },
        () => {
          this.notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG
          );
        }
      );
    }
  }

  _entity: PaymentDetail;
  viewAccounts = false;
  showPhieuChi(entity: PaymentDetail) {
    this._entity = entity;
    let item: any = {};
    item.id = entity.id;
    item.groupType = 3;
    item.supplierId = entity.supplierId;
    item.amount = entity.amountAfterVAT;
    item.refNo = entity.refNo;
    item.notes = entity.noiDung;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalPhieuChiMulti.add(item);
    }, 50);
  }

  showPhieuThu(entity: PaymentDetail) {
    this._entity = entity;
    let item: any = {};
    item.groupType = 1;
    item.supplierId = entity.supplierId;
    item.amount = -entity.amountAfterVAT;
    item.refNo = entity.refNo;
    item.notes = entity.noiDung;
    item.paymentDetailId = entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalPhieuThu.add(item);
    }, 50);
  }

  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      let item: Payments = {
        id: this._entity.id,
        feedback: "Paymented",
        status: true,
      };
      this.paymentsService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
          this.viewAccounts = false;
        }
      });
    }
    // if (event > 0) {
    //   this.loadData();
    // }
  }
  saveSuccessPhieuthu(event: any): void {
    if (event > 0) {
      let item: Payments = {
        id: this._entity.id,
        feedback: "Paymented",
        status: true,
      };
      this.paymentsService.accept(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
          this.viewAccounts = false;
        }
      });
    }
  }
  closeAccounts(): void {
    this.loadData();
    this.viewAccounts = false;
  }

  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  showFiles(obj: PaymentDetail) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "PAYMENT",
      functionName: "PAYMENT",
      refNo: obj.paymentId.toString(),
    };
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

  viewModalJob = false;
  @ViewChild(ModalShipmentComponent, { static: false })
  modalJob: ModalShipmentComponent;
  showJob(obj: PaymentDetail): void {
    this.viewModalJob = true;
    setTimeout(() => {
      this.modalJob.edit(obj.shipmentId.toString(), true);
    }, 50);
  }
  closeModalJob() {
    this.viewModalJob = false;
  }
}
