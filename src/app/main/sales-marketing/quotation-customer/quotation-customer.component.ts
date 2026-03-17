import { DatePipe } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDigitizationQuotationCustomerComponent } from "@app/shared/components/sales-marketing/modal-digitization-quotation-customer/modal-digitization-quotation-customer.component";
import { ModalQuotationCustomerComponent } from "@app/shared/components/sales-marketing/modal-quotation-customer/modal-quotation-customer.component";
import { ModalAttachfileComponent } from "@app/shared/components/systems/modal-attachfile/modal-attachfile.component";
import { MessageContstants } from "@app/shared/constants";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import {
  Branch,
  Customer,
  Employee,
  Pagination,
  QuotationCustomer,
  ResponseValue,
} from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import {
  AuthService,
  BranchService,
  CustomerService,
  EmployeeService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { QuotationCustomerService } from "@app/shared/services/sales-marketing/quotation-customer.service";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";

@Component({
  selector: "app-quotation-customer",
  templateUrl: "./quotation-customer.component.html",
  styleUrls: ["./quotation-customer.component.css"],
})
export class QuotationCustomerComponent implements OnInit {
  pageIndex = 1;
  pageSize = 9999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  keyword = "";
  listDatas: QuotationCustomer[];
  listFilter: QuotationCustomer[] = [];
  busy: Subscription;
  viewModal = false;
  viewModalDigital = false;
  _branchId: number;
  _customerId: number;
  _accept: boolean;
  _auth: number;
  _type: number = 3;
  _viewAll = 2;

  saleSearch: string = "";
  tenkhSearch: string = "";
  mabgSearch: string = "";
  sobgSearch: string = "";
  tenbgSearch: string = "";
  noidungSearch: string = "";
  ngay1Search: string = "";
  ngay2Search: string = "";
  ghichuSearch: string = "";

  listCustomer: Customer[];
  listBranch: Branch[];
  listTypes: any[] = [
    { id: 0, text: "Báo giá khách hàng" },
    { id: 1, text: "Số hóa báo giá" },
    { id: 3, text: "Tất cả" },
  ];
  public flagLinkEdit: boolean = false;
  @ViewChild(ModalQuotationCustomerComponent, { static: false })
  modalAddEdit: ModalQuotationCustomerComponent;
  @ViewChild(ModalDigitizationQuotationCustomerComponent, { static: false })
  modalDigital: ModalDigitizationQuotationCustomerComponent;
  constructor(
    private notificationService: NotificationService,
    private quotationCustomerService: QuotationCustomerService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private customerService: CustomerService,
    private branchService: BranchService,
    public datepipe: DatePipe
  ) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._accept = this.authService.hasPermission("QUOTATIONCUSTOMER_ACCEPT");
    this._auth = Number.parseInt(user.authorisationLevel);
  }

  ngOnInit(): void {
    let list: any[] = UtilityService.getLocalParams(
      SystemContstants.APPSETTING
    );
    let i = list?.findIndex((x) => x.id == "CONTRACT");
    if (i != -1) {
      this._viewAll = list[i].value;
    }

    this.loadChiNhanh();
    this.loadCustomer();
    this.loadData();
  }

  loadCustomer()  :void{
    const params = new HttpParams();
    this.customerService
      .getAll(params)
      .subscribe((res: ResponseValue<Customer[]>) => {
        this.listCustomer = res.data;
      });
  }

  changedCustomer(event: Customer) :void {
    this._customerId = event?.id;
    this.loadData();
  }

  loadChiNhanh() :void {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() :void {
    this.loadData();
  }

  changedType() :void {
    this.loadData();
  }


  filter() :void{
    this.listFilter = [...this.listDatas]; // Use spread operator for shallow copy
    const searchFields = [
      { key: "employeeFullName", searchTerm: this.saleSearch },
      { key: "customerName", searchTerm: this.tenkhSearch },
      { key: "quotationId", searchTerm: this.mabgSearch },
      { key: "quotationNo", searchTerm: this.sobgSearch },
      { key: "quotationName", searchTerm: this.tenbgSearch },
      { key: "contents", searchTerm: this.noidungSearch },
      { key: "notes", searchTerm: this.ghichuSearch },
      { key: "sDate", searchTerm: this.ngay1Search, transform: true },
      { key: "fDate", searchTerm: this.ngay2Search, transform: true },
    ];

    searchFields.forEach(({ key, searchTerm, transform }) => {
      if (searchTerm?.length > 0) {
        this.listFilter = this.listFilter.filter((data) => {
          const value =
            transform && data[key]
              ? this.datepipe
                  .transform(data[key], "dd/MM/yyyy")
                  .toString()
                  .toLowerCase()
              : data[key]?.toString().toLowerCase();
          return value?.includes(searchTerm.trim().toLowerCase());
        });
      }
    });

    this.totalRows = this.listFilter.length;
  }


  loadData(): void {
    this.spinner.show();
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", this.pageSize.toString())
      .set("keyword", this.keyword)
      .set("branchId", this._branchId?.toString())
      .set("type", this._type?.toString())
      .set("customerId", this._customerId?.toString());
    this.busy = this.quotationCustomerService
      .getPaging(params)
      .subscribe((res: ResponseValue<Pagination<QuotationCustomer>>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDatas = res.data?.items;
          this.filter();
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }

  clickRow(item: Customer): void {
    item.checked = !item.checked;
    this.listFilter.forEach((it) => {
      if (it != item) it.checked = false;
    });
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
    if (type == 1) {
      this.viewModalDigital = true;
      setTimeout(() => {
        //this.modalAddEdit.add(type);
        this.modalDigital.add();
      }, 50);
    } else {
      this.viewModal = true;
      setTimeout(() => {
        this.modalAddEdit.add(type);
      }, 50);
    }
  }

  edit(flag: boolean): void {
    const index = this.listDatas.findIndex((x) => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listDatas[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDatas.filter((x) => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks.join(","))
    );
  }

  delete(listIds: string): void {
    this.quotationCustomerService
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

  checkAll(ev) {
    this.listDatas.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  isAllChecked() {
    if (this.listDatas) return this.listDatas.every((_) => _.checked);
  }

  icheck() {
    let checks = this.listDatas.filter((x) => x.checked);
    const checkCount = checks.length;
    // Đặt các flag mặc định là false
    this.flagDelete = false;
    this.flagEdit = false;
    this.flagView = false;
    if (checkCount === 1) {
      this.flagDelete = true;
      this.flagEdit = true;
      this.flagView = true;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showModal(item: QuotationCustomer) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  finish(item: QuotationCustomer, key: string) {
    this.notificationService.printConfirmationDialog(
      "Bạn có chắc muốn kết thúc hợp đồng không?",
      () => this.accept(item, key)
    );
  }

  /**
   * @description Duyet hop dong
   * @param {QuotationCustomer} item: Doi tuong hop dong
   * @param {string} key: Truyen vao "Yes" hoac "No". Neu la "No" thi se hien thi hop thoai nhap ly do tu choi
   * @returns {void}
   */
  accept(item: QuotationCustomer, key: string) {
    if (key == "No") {
      var retVal = prompt("Lý do từ chối", "Lý do từ chối");
      if (retVal) {
        this.quotationCustomerService
          .accept(item.id.toString(), retVal)
          .subscribe(
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
    } else {
      this.quotationCustomerService.accept(item.id.toString(), key).subscribe(
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

  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  showFiles(job: QuotationCustomer) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "QUOTATIONCUSTOMER",
      functionName: "QUOTATIONCUSTOMER",
      refNo: job.id.toString(),
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
}
