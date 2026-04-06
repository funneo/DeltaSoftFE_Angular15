import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDebitNoteUpdateExchangeRateComponent } from '@app/shared/components/shipments/modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.component';
import { ModalDebitNoteUpdateInvoiceComponent } from '@app/shared/components/shipments/modal-debit-note-update-invoice/modal-debit-note-update-invoice.component';
import { ModalDebitNotesComponent } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.component';
import { ModalOpenDebitNoteComponent } from '@app/shared/components/shipments/modal-open-debit-note/modal-open-debit-note.component';
import { ModalUpdateAccountingDateComponent } from '@app/shared/components/shipments/modal-update-accounting-date/modal-update-accounting-date.component';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { DebitNotes, Customer, Branch, ResponseValue, Pagination, OpenDebitNote } from '@app/shared/models';
import { NotificationService, UtilityService, CustomerService, DebitNotesService, AuthService, OpenDebitNoteService, BranchService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-debit-note',
  templateUrl: './list-debit-note.component.html',
  styleUrls: ['./list-debit-note.component.css']
})
export class ListDebitNoteComponent implements OnInit {
 pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  totalAmount = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  array = [
    { value: 0, text: "Tất cả" },
    { value: 1, text: "Chưa duyệt" },
    { value: 2, text: "Duyệt" },
  ];
  listDebitNotes: DebitNotes[];
  listFilter: DebitNotes[] = [];
  listCustomer: Customer[];
  _customerId?: number;
  _branchId: number;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _dateType: number = 0; //Biến xác định ngày nào được chọn để hạch toán, 0: Ngày lập,1: Ngày doanh thu, 2: Ngày vận hành
  busy: Subscription;
  viewModal = false;
  viewModalDebit = false;
  viewModalExchangeRate = false;
  isFilter = false;
  selectedValue = false; //Biến dùng để xác định xem có debit note đã duyệt được chọn để thực hiện khóa hay không?
  _lockPermission: boolean = false; //Biễn xác định tài khoản đăng nhập có quyền khóa debit hay không?
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  debitType = 0;
  listTypes1 = [{ id: 0, text: 'Ngày lập' },{ id: 1, text: 'Ngày doanh thu' }, { id: 2, text: 'Ngày vận hành' }];
  arrayDebit = [
    { id: 0, value: "Tất cả" },
    { id: 1, value: "Chưa nhập số hóa đơn" },
    { id: 2, value: "Đã nhập số hóa đơn" },
  ];
  listTypes = [
    { id: 0, text: "Khách hàng" },
    { id: 1, text: "Đối tác" },
    { id: 2, text: "Tất cả" },
  ];
  _type: number = 2;
  _functionId = SystemContstants.DEBITNOTES;
  listBranch: Branch[];
  dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  //Bổ sung các biến cho tìm kiếm
  makhSearch?: string;
  loaihinhSearch?: string;
  sodebitSearch?: string;
  ngaySearch?: string;
  ngayDTSearch?: string;
  ngayVHSearch?: string;
  jobIdSearch?: string;
  tokhaiSearch?: string;
  vandonSearch?: string;
  sobookingSearch?: string;
  invoiceSearch?: string;
  ghichuSearch?: string;
  nguoilapSearch?: string;
  selectedType = 0;
  sohoadonSearch = "";
  viewDebitnote = false;
  viewUpdateAccountingDate = false;
  @ViewChild(ModalUpdateAccountingDateComponent, { static: false })
  modalUpdateAccountingDate: ModalUpdateAccountingDateComponent;
  @ViewChild(ModalOpenDebitNoteComponent, { static: false })
  modalOpenDebit: ModalOpenDebitNoteComponent;
  @ViewChild(ModalDebitNoteUpdateInvoiceComponent, { static: false })
  modalDebit: ModalDebitNoteUpdateInvoiceComponent;
  @ViewChild(ModalDebitNoteUpdateExchangeRateComponent, { static: false })
  modalTygia: ModalDebitNoteUpdateExchangeRateComponent;
  @ViewChild(ModalDebitNotesComponent, { static: false })
  modalDebitNote: ModalDebitNotesComponent;
  constructor(
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private customerService: CustomerService,
    private debitNotesService: DebitNotesService,
    private exportService: ExportService,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private openDebitNoteService: OpenDebitNoteService,
    private branchService: BranchService,
    public datepipe: DatePipe
  ) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._accept = this.authService.hasPermission("DEBITNOTE_ACCEPT");
    this._lockPermission =
      this.authService.hasPermission("DEBITNOTES_CLOSING") || user.isAdmin;
  }

  ngOnInit(): void {
    var p = UtilityService.getLocalParams(this._functionId);
    localStorage.removeItem(this._functionId);
    if (p != null) {
      this.ngayBatDau = new Date(p.d1);
      this.ngayKetThuc = new Date(p.d2);
      this._customerId = p.customerId;
      this._branchId = p.branchId;
      this.makhSearch = p.makhSearch;
      this.loaihinhSearch = p.loaihinhSearch;
      this.sodebitSearch = p.sodebitSearch;
      this.ngaySearch = p.ngaySearch;
      this.ngayDTSearch = p.ngayDTSearch;
      this.ngayVHSearch = p.ngayVHSearch;
      this.jobIdSearch = p.jobIdSearch;
      this.tokhaiSearch = p.tokhaiSearch;
      this.vandonSearch = p.vandonSearch;
      this.sobookingSearch = p.sobookingSearch;
      this.invoiceSearch = p.invoiceSearch;
      this.ghichuSearch = p.ghichuSearch;
      this.selectedType = p.selectedType;
      this.keyword = p.keyword;
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
    this.loadChiNhanh();
    this.loadData();
  }

  // locked(): void {
  //   this.notificationService.printConfirmationDialog(MessageContstants.LOCKLED_OR_NOT, () => {
  //    let listChecks = this.listFilter.filter(x => x.checked);
  //   let checks: number[] = [];
  //   for (let items of listChecks) {
  //     checks.push(items.id)
  //   }
  //    this.debitNotesService.lockedlist(checks.join(',')).subscribe((res: ResponseValue<any>) => {
  //     if (res.code == '200' || res.code == '201') {
  //       this.loadData();
  //     }
  //     else {
  //       this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
  //     }
  //   }, () => {
  //     this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
  //   });

  //   });
  // }

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

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changeTypeDebit() {
    this.timKiem();
  }
  changedDateType() {
    this.timKiem();
  }

  changedChiNhanh() {
    this.timKiem();
  }

  changedCustomer(event: Customer) {
    this.timKiem();
  }

  changedType(event: any): void {
    this.timKiem();
  }

  export() {
    let printList = this.listFilter.map(
      ({
        id,
        partnerId,
        jobId,
        rating,
        tenCongTy,
        diaChiCongTy,
        dienThoaiCongTy,
        faxCongTy,
        tenKhachHang,
        diaChiKhachHang,
        maSoThue,
        tenLoaiHinh,
        ngayToKhai,
        ...item
      }) => item
    );
    printList.forEach((it) => {
      it.debitDate = this._utilityService.dateStringtoString(it.debitDate);
    });
    this.exportService.exportExcel(printList, "debitnote");
  }

  filter() {
    this.listFilter = Object.assign([], this.listDebitNotes);
    if (this.selectedType > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.selectedType == 1 ? !data.step : data.step;
      });
    }
    if (this.debitType > 0) {
      this.listFilter = this.listFilter.filter((data) => {
        return this.debitType == 1
          ? data.deltaInvoiceNo?.length == 0 || data.deltaInvoiceNo == null
          : data.deltaInvoiceNo?.length > 0;
      });
    }
    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.deltaInvoiceNo?.toLowerCase().includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.makhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.customerName
          .toLowerCase()
          .includes(this.makhSearch.trim().toLocaleLowerCase());
      });
    if (this.loaihinhSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.debitType
          ?.toLowerCase()
          .includes(this.loaihinhSearch.trim().toLocaleLowerCase());
      });
    if (this.sodebitSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.debitNo
          ?.toLowerCase()
          .includes(this.sodebitSearch.trim().toLocaleLowerCase());
      });

    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.refDate, "dd/MM/yyyy")
          .toString()
          .toLowerCase()
          .includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if (this.ngayDTSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.debitDate, "dd/MM/yyyy")
          .toString()
          .toLowerCase()
          .includes(this.ngayDTSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayVHSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe
          .transform(data.accountingDate, "dd/MM/yyyy")
          .toString()
          .toLowerCase()
          .includes(this.ngayVHSearch.trim().toLocaleLowerCase());
      });

    if (this.jobIdSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.shipmentNo
          ?.toLowerCase()
          .includes(this.jobIdSearch.trim().toLocaleLowerCase());
      });
    if (this.vandonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.hawB_HBL
          ?.toLowerCase()
          .includes(this.vandonSearch.trim().toLocaleLowerCase());
      });
    if (this.tokhaiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.cdsNumber
          ?.toLowerCase()
          .includes(this.tokhaiSearch.trim().toLocaleLowerCase());
      });
    if (this.sobookingSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.bookingNo
          ?.toLowerCase()
          .includes(this.sobookingSearch.trim().toLocaleLowerCase());
      });
    if (this.invoiceSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo
          ?.toLowerCase()
          .includes(this.invoiceSearch.trim().toLocaleLowerCase());
      });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.notes
          ?.toLowerCase()
          .includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });
    if (this.nguoilapSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName
          ?.toLowerCase()
          .includes(this.nguoilapSearch.trim().toLocaleLowerCase());
      });
    this.calculator();
  }
  calculator() {
    this.totalAmount = 0;
    this.listFilter.forEach((it) => {
      this.totalAmount += it.totalAmount ?? 0;
    });
  }

  updateInvoice() {
    this.viewModalDebit = true;
    setTimeout(() => {
      this.modalDebit.view();
    }, 50);
  }
  updateTygia() {
    this.viewModalExchangeRate = true;
    setTimeout(() => {
      this.modalTygia.view();
    }, 50);
  }
  public _typeChanged ?: number = 0; // 0: Ngày doanh thu, 1: Ngày vận hành
  updateNgayHachtoan(type: number): void {
    this._typeChanged = type;
    this.viewUpdateAccountingDate = true;
    setTimeout(() => {this._typeChanged
      this.modalUpdateAccountingDate.view(type);
    }, 50);
  }
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    this.spinner.show();
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", "99999")
      .set("keyword", this.keyword)
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("customerId", this._customerId?.toString())
      .set("branchId", this._branchId?.toString())
      .set("type", this._type?.toString())
      .set('datetype', this._dateType.toString());;
    this.busy = this.debitNotesService
      .getCanon(params)
      .subscribe((res: ResponseValue<Pagination<DebitNotes>>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDebitNotes = res.data?.items;
          this.listFilter = res.data?.items;
          this.spinner.hide();
          this.filter();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
          this.spinner.hide();
        }
      });
  }

  clickRow(item: DebitNotes): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add(type: number): void {
    let p = {
      d1: moment(this.ngayBatDau).format("YYYY-MM-DD"),
      d2: moment(this.ngayKetThuc).format("YYYY-MM-DD"),
      customerId: this._customerId,
      branchId: this._branchId,
    };
    UtilityService.setLocalParams(p, this._functionId);
    this.router.navigateByUrl(
      "/main/shipments/debit-notes/create/" + type + "/0"
    );
  }

  edit(id: number, flag: boolean): void {
    if (id == null) {
      const index = this.listDebitNotes.findIndex((x) => x.checked);
      if (index >= 0) {
        id = this.listDebitNotes[index].id;
      }
    }
    this.debitNotesService
      .getDetail(id.toString())
      .subscribe((res: ResponseValue<DebitNotes>) => {
        if (res.code == "200" || res.code == "201") {
          let t = res.data;
          this.viewDebitnote = true;
          setTimeout(() => {
            this.modalDebitNote.edit(t.id);
          }, 50);
        }
      });
  }

  show(id: number): void {
    this.debitNotesService
      .getDetail(id.toString())
      .subscribe((res: ResponseValue<DebitNotes>) => {
        if (res.code == "200" || res.code == "201") {
          let t = res.data;
          this.viewDebitnote = true;
          setTimeout(() => {
            this.modalDebitNote.edit(t.id);
          }, 50);
        }
      });
  }

  deleteConfirm(): void {
    let listChecks = this.listFilter.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks.join(","))
    );
  }
  updateAccountingDateConfirm(accountingDate: string): void {
    let listChecks = this.listFilter.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.UPDATE_ACCOUNTING_DATE,
      () => this.updateAccountingDate(checks.join(","), accountingDate)
    );
  }
  delete(listIds: string): void {
    this.debitNotesService
      .delete(listIds)
      .subscribe((res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.DELETE_ERR_MSG + "\n" + res.code
          );
        }
      });
  }
updateAccountingDate(listIds: string, accountingDate: string): void {
  const request$ =
    this._typeChanged === 0
      ? this.debitNotesService.updateDebitDate(listIds, accountingDate)
      : this.debitNotesService.updateAccountingDate(listIds, accountingDate);

  request$.subscribe((res: ResponseValue<any>) => {
    if (res.code === "200" || res.code === "201") {
      this.loadData();
    } else {
      this.notificationService.printErrorMessage(
        MessageContstants.DELETE_ERR_MSG + "\n" + res.code
      );
    }
  });
}

  checkAll(ev) {
    this.listFilter.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  isAllChecked() {
    if (this.listDebitNotes) return this.listFilter.every((_) => _.checked);
  }
  isSelected = false;
  icheck() {
    let checks = this.listFilter.filter((x) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = checks[0].step < 1;
      this.flagEdit = checks[0].step < 1;
    }
    // else if (checks.length > 1) {
    //   this.flagDelete = true;
    //   this.flagEdit = false;
    // }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
    if (checks.length > 0) this.selectedValue = true;
    checks.forEach((it) => {
      if (it.step < 1) this.selectedValue = false;
    });
    this.isSelected = checks.length > 0;
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  closeDebitnote() {
    this.viewDebitnote = false;
  }
  closeUpdateAccountingDate() {
    this.viewUpdateAccountingDate = false;
  }

  viewOpenDebit = false;
  showOpenDebit(event: DebitNotes): void {
    const params = new HttpParams()
      .set("debitNoteId", event.id?.toString())
      .set("customerId", event.customerId?.toString());
    this.busy = this.openDebitNoteService
      .getAll(params)
      .subscribe((res: ResponseValue<OpenDebitNote[]>) => {
        let list = res.data?.filter((x) => x.status && x.step == 0);
        if (list.length > 0) {
          this.notificationService.printErrorMessage(
            "Đã có yêu cầu mở đang chờ duyệt!" + "\n" + list[0].notes
          );
        } else {
          this.viewOpenDebit = true;
          let item: any = {
            debitNoteId: event.id,
            debitNo: event.debitNo,
            customerId: event.customerId,
            notes: event.notes,
          };
          setTimeout(() => {
            this.modalOpenDebit.add(item);
          }, 50);
        }
      });
  }

  saveOpenDebit(event: any): void {
    console.log(event);
  }

  closeOpenDebit(): void {
    this.viewOpenDebit = false;
  }

  closeModalDebit(): void {
    this.viewModalDebit = false;
  }
  closeModalExchangeRate() {
    this.viewModalExchangeRate = false;
  }
  saveDebit() {
    this.loadData();
  }
  saveUpdateAccountingDate(event: any) {
    if (event) {
      let accountingDate = "";
      let _ngayDoanhthu = event;
      if (_ngayDoanhthu) {
        if (moment(_ngayDoanhthu, FormatContstants.DATEVN).isValid()) {
          accountingDate = moment(_ngayDoanhthu,FormatContstants.DATEVN).format(FormatContstants.CLIENTDATE);
          
          this.updateAccountingDateConfirm(accountingDate);
        } else {
          this.notificationService.printErrorMessage(
            "Ngày hạch toán không hợp lệ"
          );
          return;
        }
      }
    }
  }

}
