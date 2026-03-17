import { DatePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { MessageContstants } from "@app/shared/constants";
import { Pagination, Profile, ResponseValue } from "@app/shared/models";
import { GasSite } from "@app/shared/models/gas-site.model";
import { FuelClosingDetailed } from "@app/shared/models/transports/fuel-closing-detailed.model";
import { FuelClosing } from "@app/shared/models/transports/fuel-closing.model";
import { GasManagement } from "@app/shared/models/transports/gas-management.model";
import {
  AuthService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { GasSiteService } from "@app/shared/services/gas-site.service";
import { DriverFuelApprovalService } from "@app/shared/services/transports/driver-fuel-approval.service";
import { FuelClosingService } from "@app/shared/services/transports/fuel-closing.service";
import { GasManagementService } from "@app/shared/services/transports/gas-management.service";
import { ImportGasService } from "@app/shared/services/transports/import-gas.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { environment } from "@environments/environment";

@Component({
  selector: "modal-fuel-closing",
  templateUrl: "./modal-fuel-closing.component.html",
  styleUrls: ["./modal-fuel-closing.component.css"],
})
export class ModalFuelClosingComponent implements OnInit {
  public entity: FuelClosing;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = true;

  listGasSite: GasSite[] = [];
  listImportGas: FuelClosingDetailed[] = [];
  filteredData: FuelClosingDetailed[] = [];
  branchId: number = 0;
  listDriverFuelApproval: FuelClosingDetailed[] = [];
  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;
  filterColumns: { [key: string]: string } = {};
  filterColumns1: { [key: string]: string } = {};
  isChecked = false;
  _approvedPermission = false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  sortKey: string = "";
  sortOrder: "asc" | "desc" = "asc";
  constructor(
    private _notificationService: NotificationService,
    private _authService: AuthService,
    private gasSiteService: GasSiteService,
    private spinner: NgxSpinnerService,
    private fuelClosingService: FuelClosingService,
    private datePipe: DatePipe,
    private gasManagementService: GasManagementService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this._approvedPermission =
      this._authService.hasPermission("SITEFUELCLOSING_ACCEPT") ||
      this.userLoged.isAdmin;
  }
  /**
   * Load all gas site by branch id
   * @returns List of gas site
   */
  loadGasSite() {
    this.busy = this.gasSiteService
      .getAll(this.branchId)
      .subscribe((res: ResponseValue<GasSite[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listGasSite = res.data;
        }
      });
  }

  add(branchId: number) {
    this.entity = {
      checked: false,
      branchId: branchId,
      status: 0,
      price: 0,
    };
    this.branchId = branchId;
    this.loadGasSite();
    this.loadGasValue();
    this.flagXem = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.loadGasSite();
    this.fuelClosingService
      .getDetail(id)
      .subscribe((res: ResponseValue<FuelClosing>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.flagXem = flag;
          if (this.entity.createdBy != this.userLoged.id) this.flagXem = true;
          this.flagNew = false;
          this.filterData();
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }
  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "SITEFUELCLOSING",
      functionName: "SITEFUELCLOSING",
      refNo: this.entity.id.toString(),
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


  saveChange(form: NgForm) {
    if (this.entity.listFuelClosingDetailed.length < 1) return;
    this.flagSave = true;
    this.entity.branchId = Number.parseInt(this.userLoged.branchId);
    this.entity.createdBy = this.userLoged.id;
    const copiedObject = Object.assign({}, this.entity);
    if (this.isChecked) copiedObject.status = 1;
    if (copiedObject.id == undefined || copiedObject.id < 1) {
      this.fuelClosingService.add(copiedObject).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage(
              MessageContstants.FUEL_CLOSING_OK_MSG
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
      this.fuelClosingService.update(copiedObject).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage(
              MessageContstants.FUEL_CLOSING_OK_MSG
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
    }
  }

  /**
   * Tinh tong so luong nhap cua cac dong trong danh sach
   * @param list danh sach cac dong du lieu
   * @returns tong so luong nhap
   */
  calculateSumImport(list: FuelClosingDetailed[]): number {
    return list.reduce((sum, currentObj) => sum + currentObj.import, 0);
  }

  /**
   * Tinh tong so luong xuat cua cac dong trong danh sach
   * @param list danh sach cac dong du lieu
   * @returns tong so luong xuat
   */
  calculateSumExport(list: FuelClosingDetailed[]): number {
    return list.reduce((sum, currentObj) => sum + currentObj.export, 0);
  }


  loadGasValue() {
    this.busy = this.gasManagementService
      .getValue(Number.parseInt(this.userLoged.branchId))
      .subscribe((res: ResponseValue<GasManagement>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity.price = res.data.cost;
        }
      });
  }


  changedSite(event: GasSite) {
    if (!event) return;
    this.entity.listFuelClosingDetailed=[];
    this.filterData();
    this.entity.oldInventory=null;
    this.entity.import=null;
    this.entity.export=null;
    this.entity.newInventory=null;
    this.entity.realInverntory=null;
    this.entity.contents='';
    this.entity.note='';
    let id = event?.id;
    this.fuelClosingService
      .checkClosing(id)
      .subscribe((res: ResponseValue<boolean>) => {
        if (res.code == "200" || res.code == "201") {
          let reval = res.data;
          if (reval) {
            this._notificationService.printAlert(
              MessageContstants.TITLE_INFO,
              MessageContstants.EMPLOYEE_DEBIT_CLOSING_REQUIED_ERROR
            );
          } else {
            this.spinner.show();
            this.fuelClosingService
              .getForClosing(id)
              .subscribe((res: ResponseValue<FuelClosing>) => {
                if (
                  res.code == "200" ||
                  res.code == "201" ||
                  res.code == "204"
                ) {
                  this.entity = res.data;
                  this.entity.gasSiteId = id;
                  this.entity.import = this.calculateSumImport(
                    this.entity.listFuelClosingDetailed
                  );
                  this.entity.export = this.calculateSumExport(
                    this.entity.listFuelClosingDetailed
                  );
                  this.entity.newInventory =
                    this.entity.oldInventory +
                    this.entity.import -
                    this.entity.export;
                  this.filterData();
                  this.spinner.hide();
                } else {
                  this._notificationService.printErrorMessage(
                    MessageContstants.SYSTEM_ERROR_MSG
                  );
                  this.spinner.hide();
                }
              });
          }
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  
  filterData(): void {
    this.filteredData = this.entity.listFuelClosingDetailed.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue =
          key === "createdDate"
            ? this.datePipe.transform(item[key], "dd/MM/yyyy").toLowerCase()
            : String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  }

  exportExcel(): void {
    let type = 0;
    if (this.entity.id == undefined || this.flagNew) type = 1;
    this.busy = this.fuelClosingService
      .exportExcel(this.entity, type)
      .subscribe((res: ResponseValue<Pagination<FuelClosing>>) => {
        if (res.code == "200" || res.code == "201") {
          var a = document.createElement("a");
          a.href = environment.apiUrl + res.data;
          a.download;
          a.click();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }
  approved(flag: boolean) {
    if (
      !flag &&
      (this.entity?.note?.trim().length < 1 || this.entity.note == null)
    ) {
      this._notificationService.printAlert(
        "Thông báo",
        "Chưa nhập lý do từ chối vào phần Ghi chú!"
      );
      return;
    }else{
      //Đoạn này thực hiện chốt dầu
      let copy = Object.assign({}, this.entity)
      copy.status=flag?2:-1;
      this.busy = this.fuelClosingService
      .accept(copy)
      .subscribe((res: ResponseValue<FuelClosing>) => {
        if (res.code == "200" || res.code == "201") {
          this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage(
              MessageContstants.FUEL_CLOSING_OK_MSG
            );
            this.SaveSuccess.emit(true);
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG + "\n" + res.code
          );
        }
      });
    }
  }

  sortData(key: string): void {
    if (this.sortKey === key) {
      // Đảo chiều sắp xếp nếu cùng một cột được nhấp
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      // Sắp xếp theo cột mới
      this.sortOrder = "asc";
    }
    this.sortKey = key;
    this.filteredData.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue > bValue) {
        return this.sortOrder === "asc" ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sortOrder === "asc" ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  chagedValue() {
    this.entity.differential =
      this.entity.realInverntory - this.entity.newInventory;
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
