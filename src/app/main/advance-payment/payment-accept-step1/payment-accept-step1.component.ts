import { HttpParams } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ModalPhieuChiComponent } from "@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component";
import { ModalPhieuThuComponent } from "@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component";
import { ModalShipmentComponent } from "@app/shared/components/shipments/modal-shipment/modal-shipment.component";
import { ModalAttachfileComponent } from "@app/shared/components/systems/modal-attachfile/modal-attachfile.component";
import { MessageContstants } from "@app/shared/constants";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import {
  Branch,
  PaymentDetail,
  Payments,
  ResponseValue,
} from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import {
  AuthService,
  BranchService,
  NotificationService,
  PaymentsService,
  UtilityService,
} from "@app/shared/services";
import * as signalR from "@aspnet/signalr";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";

@Component({
  selector: "app-payment-accept-step1",
  templateUrl: "./payment-accept-step1.component.html",
  styleUrls: ["./payment-accept-step1.component.css"],
})
export class PaymentAcceptStep1Component implements OnInit {
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
    { id: 0, text: "Cá nhân" },
    { id: 1, text: "Nhà cung cấp" },
    { id: 2, text: "Tất cả" },
  ];
  _type = 2;
  _isDirectPayment: number = 2;
  selectedType: number = 0;
  selectedIsDirect: number = 2;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Cá nhân" }, { "value": 2, "text": "Nhà cung cấp" }];
  arrayD = [{ "id": 2, "text": "Tất cả" }, { "id": 1, "text": "Trực tiếp" }, { "id": 0, "text": "Có tạm ứng" }];
  listTypePayment = UtilityService.listTypePayment();
  _functionId = SystemContstants.PA1;
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
  _hubConnection: signalR.HubConnection;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild(ModalPhieuChiComponent, { static: false })
  modalPhieuChi: ModalPhieuChiComponent;
  @ViewChild(ModalPhieuThuComponent, { static: false })
  modalPhieuThu: ModalPhieuThuComponent;
  constructor(
    private authService: AuthService,
    private paymentsService: PaymentsService,
    private router: Router, private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private branchService: BranchService, private spinner: NgxSpinnerService,
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
    //signalR
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
      this._isDirectPayment = p.isDirectPayment ?? 2;
      //this.groupedItemLuu=p.groupedItem
      //Lưu các biến trạng thái filter
      this.maphiSearch = p.maphiSearch
      this.tenphiSearch = p.tenphiSearch,
        this.diengiaiSearch = p.diengiaiSearch,
        this.sotienSearch = p.sotienSearch,
        this.vatSearch = p.vatSearch,
        this.tongtienSearch = p.tongtienSearch,
        this.sohoadonSearch = p.sohoadonSearch,
        this.ngayhdSearch = p.ngayhdSearch,
        this.mstSearch = p.mstSearch,
        this.cnSearch = p.cnSearch,
        this.ghichuSearch = p.ghichuSearch,
        this.jobidSearch = p.jobidSearch,
        this.tokhaiSearch = p.tokhaiSearch,
        this.hbilSearch = p.hbilSearch,
        this.bookingSearch = p.bookingSearch,
        this.noidungSearch = p.noidungSearch,
        this.sophieuSearch = p.sophieuSearch,
        this.nguoittSearch = p.nguoittSearch
    }
    this.loadChiNhanh();
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
    this.loadData();
  }
  groupedItem: any[] = [];
  groupedItemLuu: any[] = [];
  // Hàm tách tên thành First Name và Last Name
  splitName(fullName: string): [string, string] {
    const parts = fullName.trim().split(' ');
    const firstName = parts[parts.length - 1]; // Lấy tên (First Name)
    const lastName = parts.slice(0, -1).join(' '); // Phần còn lại là họ (Last Name)
    return [firstName, lastName];
  }

  groupByAndSort(array: any[], key: string) {
    const groups = array.reduce((result, item) => {
      const groupKey = item[key] || 'Khác';
      if (!result[groupKey]) {
        result[groupKey] = { key: groupKey, items: [], isExpanded: false };
      }
      result[groupKey].items.push(item);
      return result;
    }, {});

    // Chuyển thành mảng và sắp xếp theo tên trước, họ sau
    return Object.values(groups)
      .sort((a: any, b: any) => {
        const [firstNameA, lastNameA] = this.splitName(a.key);
        const [firstNameB, lastNameB] = this.splitName(b.key);

        return firstNameA.localeCompare(firstNameB) || lastNameA.localeCompare(lastNameB);
      });
  }

  toggleGroup(group: any) {
    group.isExpanded = !group.isExpanded;
  }
  loadData(): void {
    this.spinner.show();
    const params = new HttpParams()
      .set("isDirectPayment", this._isDirectPayment == 2 ? "" : this._isDirectPayment.toString())
      .set("branchId", this._branchId?.toString());
    this.busy = this.paymentsService
      .getAcceptStep1(params)
      .subscribe((res: ResponseValue<PaymentDetail[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDetail = res.data;
          this.filter();
          this.spinner.hide();
          this.totalRows = this.listFilter?.length;
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          ); this.spinner.hide();
        }
      });
  }
  filter() {
    this.listFilter = Object.assign([], this.listDetail);

    if (this._isDirectPayment < 2) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.isDirectPayment == this._isDirectPayment;
      });
    }
    if (this.selectedIsDirect < 2) {
      this.listFilter = this.listFilter.filter((data) => {
        return data.isDirectPayment == this.selectedIsDirect;
      });
    }
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
    // this.groupedItem = this.groupByAndSort(this.listFilter, 'employeeName'); // Nhóm theo cột "customerName"
    //so sánh các nhóm đã mở ra đã lưu vào storage để set lại sau khi back màn hình
    // this.groupedItem.forEach(it=>{
    //   const matchedItem = this.groupedItemLuu.find(x => x.key === it.key);
    //   if (matchedItem) {
    //     // Nếu tìm thấy, gán giá trị từ groupedItemLuu sang groupedItem
    //     it.isExpanded = matchedItem.isExpanded;
    //   }
    // })
  }

  viewPayment(id: number) {
    let p = {
      trangthai: this._trangThai,
      branchId: this._branchId,
      type: this._type,
      isDirectPayment: this._isDirectPayment,
      keyword: this.keyword,
      maphiSearch: this.maphiSearch,
      tenphiSearch: this.tenphiSearch,
      diengiaiSearch: this.diengiaiSearch,
      sotienSearch: this.sotienSearch,
      vatSearch: this.vatSearch,
      tongtienSearch: this.tongtienSearch,
      sohoadonSearch: this.sohoadonSearch,
      ngayhdSearch: this.ngayhdSearch,
      mstSearch: this.mstSearch,
      cnSearch: this.cnSearch,
      ghichuSearch: this.ghichuSearch,
      jobidSearch: this.jobidSearch,
      tokhaiSearch: this.tokhaiSearch,
      hbilSearch: this.hbilSearch,
      bookingSearch: this.bookingSearch,
      noidungSearch: this.noidungSearch,
      sophieuSearch: this.sophieuSearch,
      nguoittSearch: this.nguoittSearch
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

  submit(entity: PaymentDetail, key: string): void {
    let b = key == "true";
    // this.groupedItemLuu=this.groupedItem;
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
      copy.step = 1;
    }
    if (_ok) {
      this.paymentsService.acceptStep(copy).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.loadData();
            this.cdr.detectChanges();
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
    item.groupType = 3;
    item.supplierId = entity.supplierId;
    item.amount = entity.amountAfterVAT;
    item.refNo = entity.refNo;
    item.notes = entity.noiDung;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalPhieuChi.add(item);
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
  }

  closeAccounts(): void {
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
