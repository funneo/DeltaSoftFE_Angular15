import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  Profile,
  ResponseValue,
  SummarySupplierCost,
  Supplier,
} from "@app/shared/models";
import {
  AuthService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { CbtService } from "@app/shared/services/cbt/cbt.service";
import { ExportService } from "@app/shared/services/export-excel.service";
import { SupplierService } from "@app/shared/services/supplier.service";
import { DispatchordersService } from "@app/shared/services/transports/dispatchorders.service";
import { DriverFuelApprovalService } from "@app/shared/services/transports/driver-fuel-approval.service";
import { ImportGasService } from "@app/shared/services/transports/import-gas.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { SummarySupplierCostsService } from "@app/shared/services/accounting/summary-supplier-cost.service";
import { MessageContstants } from "@app/shared/constants";
import { NgForm } from "@angular/forms";
import { DispatchOrderCbt } from "@app/shared/models/cbt/dispatch-order-cbt.model";
import { DriverFuelApproval } from "@app/shared/models/transports/driver-fuel-approval.model";
import * as moment from "moment";
import { Dispatchorder } from "@app/shared/models/transports/dispatchorders/dispatchorder";
import { ModalPhieuChiComponent } from "../modal-phieu-chi/modal-phieu-chi.component";

@Component({
  selector: "modal-summary-supplier-cost",
  templateUrl: "./modal-summary-supplier-cost.component.html",
  styleUrls: ["./modal-summary-supplier-cost.component.css"],
})
export class ModalSummarySupplierCostComponent implements OnInit {
  public entity: SummarySupplierCost;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = true;
  listSupplier: Supplier[] = [];
  approved_permission: boolean = false;
  maskNumber = UtilityService.maskNumber;
  mask0 = UtilityService.mask0;
  permission: Permissions;
  public userLoged: Profile;
  public viewModal?: boolean = false;
  isLoadingDetails: boolean = false;
  listType = [
    { id: 0, text: "Lệnh vận chuyển" },
    { id: 1, text: "Phiếu cấp dầu" },
    { id: 2, text: "Nhập dầu téc" },
  ];
  filter = {
    refNo: '',
    createdDate: '',
    contents: '',
    amount: ''
  };
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), true);
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private service: SummarySupplierCostsService,
    private _notificationService: NotificationService,
    private _authService: AuthService,
    private supplierService: SupplierService,
    private _utilityService: UtilityService,
    private dispatchOrderService: DispatchordersService,
    private driverFuelApprovalService: DriverFuelApprovalService,
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.approved_permission = this._authService.hasPermission('ADVANCE_ACCOUNT') ||
      this._authService.hasPermission("F018_ACCOUNT") || this.userLoged.isAdmin;
    this.loadSupplier();
  }
  loadDriverFuelApproval(supplierId: number) {
    // this.gasSiteService
    //   .getAll(0)
    //   .subscribe((res: ResponseValue<GasSite[]>) => {
    //     if (res.code == '200' || res.code == '201') {
    //       this.listGasSite = res.data;
    //     }
    //   });
  }

  loadSupplier() {
    const params = new HttpParams().set(
      "branchid",
      this.userLoged.branchId.toString()
    );
    this.supplierService
      .getAll(params)
      .subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listSupplier = res.data;
        }
      });
  }

  add(type: number) {
    this.entity = { status: 0, type: type };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }
  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "SUMSUPPLIERCOST",
      functionName: "SUMSUPPLIERCOST",
      refNo: this.entity.id.toString(),
    };
    debugger;
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  edit(id: number, flag: boolean) {
    this.service
      .getDetail(id)
      .subscribe((res: ResponseValue<SummarySupplierCost>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          if (this.entity.details) {
            this.entity.details.forEach((x: any) => x.selected = true);
          }
          if (this.entity.supplierId == 0) this.entity.supplierId = null;
          this.flagNew = false;
          this.flagXem = flag;
          this.flagSave = false;
          this.flagXem = this.userLoged.id != this.entity.createdBy;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }
  deleteItem(item: any) {
    const idx = this.entity.details.indexOf(item);
    if (idx !== -1) {
      this.entity.details.splice(idx, 1);
      this.calculateTotal();
    }
  }

  get filteredDetails() {
    if (!this.entity || !this.entity.details) return [];
    return this.entity.details.filter((item: any) => {
      let match = true;
      if (this.filter.refNo && !item.refNo?.toLowerCase().includes(this.filter.refNo.toLowerCase())) match = false;
      if (this.filter.createdDate && !moment(item.createdDate).format('DD/MM/YYYY').includes(this.filter.createdDate)) match = false;
      if (this.filter.contents && !item.contents?.toLowerCase().includes(this.filter.contents.toLowerCase())) match = false;
      if (this.filter.amount && !item.amount?.toString().includes(this.filter.amount.toString())) match = false;
      return match;
    });
  }

  get isCheckAll() {
    if (!this.filteredDetails || this.filteredDetails.length === 0) return false;
    return this.filteredDetails.every((x: any) => x.selected !== false);
  }

  toggleCheckAll(event: any) {
    const checked = event.target.checked;
    this.filteredDetails.forEach((x: any) => x.selected = checked);
    this.calculateTotal();
  }

  onItemCheck() {
    this.calculateTotal();
  }

  calculateTotal() {
    if (this.entity && this.entity.details) {
      this.entity.amount = this.entity.details
        .filter((x: any) => x.selected !== false)
        .reduce((accumulator, item) => accumulator + item.amount, 0);
      this.entity.amountAfterVAT = this.entity.amount;
    }
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      if (this.entity.details && this.entity.details.filter((x: any) => x.selected !== false).length === 0) {
        this._notificationService.printErrorMessage("Vui lòng chọn ít nhất 1 chi tiết để tổng kết!");
        return;
      }

      this.flagSave = true;
      let saveEntity = Object.assign({}, this.entity);
      if (saveEntity.details) {
        saveEntity.details = saveEntity.details.filter((x: any) => x.selected !== false);
      }

      if (saveEntity.id == undefined) {
        this.service.add(saveEntity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(true);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.service.update(saveEntity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
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

  supplierChanged(event: Supplier) {
    if (!event) return;
    this.isLoadingDetails = true;
    switch (this.entity.type) {
      case 0: //Nếu là lệnh vận chuyển
        this.dispatchOrderService.getSummarySupplier(event!.id).subscribe(
          (res: ResponseValue<Dispatchorder[]>) => {
            this.isLoadingDetails = false;
            if (res.code == "200" || res.code == "201") {
              let listData = res.data;
              this.entity.details = listData.map((item) => ({
                refNo: item.refNo,
                contents: item.tollRouteName,
                amount: item.purchasePrice,
                notes: item.note,
                createdDate: item.createdDate,
                selected: true
              }));
              this.calculateTotal();
            }
          },
          () => {
            this.isLoadingDetails = false;
          }
        );
        break;
      case 1: //Phiếu mua dầu
        this.driverFuelApprovalService.getBySupplierForAccount(event.id).subscribe({
          next: (res: ResponseValue<DriverFuelApproval[]>) => {
            this.isLoadingDetails = false;
            if (res.code == '200' || res.code == '201') {
              this.entity.details = res.data.map((item) => ({
                refNo: item.refNo,
                contents: item.driverName + (item.licensePlate ? ' - ' + item.licensePlate : ''),
                amount: item.totalCostIgas ?? 0,
                notes: item.note,
                createdDate: item.createdDate,
                selected: true
              }));
              this.calculateTotal();
            }
          },
          error: () => { this.isLoadingDetails = false; }
        });
        break;
      case 2: //Nếu là phiếu cấp dầu
        this.isLoadingDetails = false;
        break;
      case 3: //Nếu là phiếu nhập dầu téc
        this.isLoadingDetails = false;
        break;
      default:
        this.isLoadingDetails = false;
        break;
    }
    //Lấy thông tin toàn bộ các lệnh vận chuyển chưa được tổng kết dầu
  }
  selectedNgaybatdau(event) {
    this.entity.invoiceDate = moment(event.start).format("DD/MM/YYYY");
  }
  closedNgaybatdau(event) {
    if (this.entity.invoiceDate == null || this.entity.invoiceDate?.length < 1)
      this.entity.invoiceDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  changeStatus(status: number) {
    let item = Object.assign({}, this.entity);
    item.status = status;
    item.feedback = this.entity.feedback;
    this.service.update(item).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.modalAddEdit.hide();
          this._notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
          this.SaveSuccess.emit(res.data);
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG + res.code
          );
          this.flagSave = false;
        }
      },
      () => {
        this.flagSave = false;
      }
    );
  }

  viewAccounts = false;
  @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent;

  showPhieuChi() {
    let item: any = {};
    item.groupType = 3;
    item.supplierId = this.entity.supplierId;
    item.amount = this.entity.amount;
    item.refNo = this.entity.refNo;
    item.notes = this.entity.contents;
    item.accountid = this.entity.id;
    this.viewAccounts = true;
    setTimeout(() => {
      this.modalPhieuChi.add(item);
    }, 50);
  }
  saveSuccessAccounts(event: any): void {
    if (event > 0) {
      this.changeStatus(2);
      this.entity.status = 2;
    }
  }
  closeAccounts(): void {
    this.viewAccounts = false;
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeModalFile() {
    this.viewAttachFiles = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
