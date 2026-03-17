import { DatePipe } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalAttachfileComponent } from "@app/shared/components/systems/modal-attachfile/modal-attachfile.component";
import { ModalShippingTaskCsComponent } from "@app/shared/components/transports/modal-shipping-task-cs/modal-shipping-task-cs.component";
import { ModalWorkflowComponent } from "@app/shared/components/workflows/modal-workflow/modal-workflow.component";
import { MessageContstants } from "@app/shared/constants";
import { FormatContstants } from "@app/shared/constants/format.constants";
import { listContants } from "@app/shared/constants/list-type.constants";
import {
  Branch,
  Customer,
  OtherCategories,
  Profile,
  ResponseValue,
} from "@app/shared/models";
import { ShippingTask } from "@app/shared/models/transports/shipping-task.model";
import {
  AuthService,
  BranchService,
  CustomerService,
  NotificationService,
  OtherCategoriesService,
  UtilityService,
} from "@app/shared/services";
import { ExportService } from "@app/shared/services/export-excel.service";
import { GetDayService } from "@app/shared/services/get-day.service";
import { ShippingTaskService } from "@app/shared/services/transports/shipping-task.service";
import * as moment from "moment";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxSpinnerService } from "ngx-spinner";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-shipping-task-cs",
  templateUrl: "./shipping-task-cs.component.html",
  styleUrls: ["./shipping-task-cs.component.css"],
})
export class ShippingTaskCsComponent implements OnInit {
  pageIndex = 1;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listWorkflow: ShippingTask[];
  listFilter: ShippingTask[];
  listCustomer: Customer[];
  listBranch: Branch[] = [];
  branchId?: number;
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  viewGrade: boolean = false;
  viewAttachFile = false;
  currentDate: Date;
  day?: number;
  month: number;
  year: number;
  listDay: number[] = [];
  totalrows = 0;
  selectedTypeCs = 0;
  selecteDate: string = moment(new Date()).format("DD/MM/YYYY");
  listShipmentType: any[];
  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  refreshSubscription: Subscription;

  filterColumns: { [key: string]: string } = {};
  dateTimeFields: string[] = ['pickupTime', 'deliveryTime', 'cutOffTime', 'demurageTime'];
  filteredData: any[] = [];

  @ViewChild(ModalShippingTaskCsComponent, { static: false })
  modalAddEdit: ModalShippingTaskCsComponent;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttachFile: ModalAttachfileComponent;
  constructor(
    private service: ShippingTaskService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService,
    private customerService: CustomerService,
    private _exportService:ExportService,
    private _authService: AuthService,
    private branchService: BranchService,
    private dayService: GetDayService, private datePipe:DatePipe,
    private otherCategoriesService: OtherCategoriesService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.loadData();
    this.loadBranch();
    this.loadOtherCategory();
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.loadData();
    });
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    //this.selecteDate= moment(this.ngayBatDau).format('DD/MM/YYYY');
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changedBranch(event: Branch) {
    this.branchId = event?.id;
    this.loadData();
  }

  loadOtherCategory() {
    const params = new HttpParams().set("type", "SHIPMENT_T02");
    this.otherCategoriesService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        this.listShipmentType = [];
        res.data.forEach((x) =>
          this.listShipmentType.push({
            id: x.id.toString(),
            text: x.categoryCode,
            name: x.categoryName,
          })
        );
      });
  }

  loadData(): void {
    this.spinner.show("spinner1");
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set("branchId", this.branchId ? this.branchId.toString() : "0")
      .set("keyword", this.keyword);
    this.busy = this.service
      .getAllByCs(params)
      .subscribe((res: ResponseValue<ShippingTask[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.listWorkflow = res.data;
          this.spinner.hide("spinner1");
          this.filterData();
        } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
          this.spinner.hide("spinner1");
      });
  }
  filterData(): void {
    this.filteredData = this.listWorkflow?.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        if (!this.filterColumns[key]) return true; // Nếu không nhập gì, bỏ qua filter
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue =
        this.dateTimeFields.includes(key) // Kiểm tra nếu key nằm trong danh sách DateTime
          ? this.datePipe.transform(item[key], "dd/MM/yyyy HH:mm").toLowerCase()
          : String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  }
  export(){
    this._exportService.exportExcel(this.filteredData,'thuc-hien-cong-viec-vc-cs');
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  viewModalAttachFile(event: ShippingTask) {}
  closeModalAttach() {
    this.viewAttachFile = false;
  }

  clickRow(item: ShippingTask): void {
    item.checked = !item.checked;
    this.listWorkflow.forEach((it) => {
      if (it.id != item.id) it.checked = false;
    });
    this.icheck();
  }

  timKiem(): void {
    this.loadData();
  }

  add(): void {
    let item: ShippingTask = {
      checked: false,
      status: 0,
      taskType: 0,
    };
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(item, true);
    }, 50);
  }

  copy(item: ShippingTask): void {
    let copy = Object.assign({}, item);
    copy.status = 0;
    copy.id = undefined;
    copy.containerNumber = "";
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(copy, false);
    }, 50);
  }
  huyviec(item: ShippingTask): void {
    if(item.refNo?.length > 0)return;
    if (this.userLoged.id != item.createdBy && !this.userLoged.isAdmin ) return;
    this.notificationService.printConfirmationDialog(
      MessageContstants.CANCE_SHIPPINGTASK,
      () => {
        this.service.cancel(item).subscribe((res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.loadData();
            this.notificationService.printSuccessMessage(
              MessageContstants.UPDATED_OK_MSG 
            );
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG + "\n" + res.code
            );
          }
        });
      }
    );
    
  }

  edit(flag: boolean): void {
    const index = this.listWorkflow.findIndex((x) => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listWorkflow[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listWorkflow.filter((x) => x.checked);
    let item = listChecks[0];
    if (this.userLoged.id != item.createdBy) return;
    if (item.status > 0) return;
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(item.id)
    );
  }

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
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
    this.listWorkflow.forEach((x) => (x.checked = ev.target.checked));
    this.icheck();
  }

  icheck() {
    let checks = this.listWorkflow.filter((x) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    } else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeGradeModal(): void {
    this.viewGrade = false;
  }
}
