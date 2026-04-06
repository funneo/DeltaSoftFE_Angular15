import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { MessageContstants } from "@app/shared/constants";
import {
  Branch,
  District,
  Employee,
  OtherCategories,
  Profile,
  Province,
  ResponseValue,
  Supplier,
  Bank,
} from "@app/shared/models";
import {
  AuthService,
  BankService,
  BranchService,
  EmployeeService,
  NotificationService,
  OtherCategoriesService,
} from "@app/shared/services";
import { DistrictService } from "@app/shared/services/district.service";
import { ProvinceService } from "@app/shared/services/province.service";
import { SupplierService } from "@app/shared/services/supplier.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { ModalSupplierDriverComponent } from "../modal-supplier-driver/modal-supplier-driver.component";
import { ModalSupplierVehicleComponent } from "../modal-supplier-vehicle/modal-supplier-vehicle.component";
import { SupplierDriversService } from "@app/shared/services/danhmuc/supplier-drivers.service";
import { SupplierVehiclesService } from "@app/shared/services/danhmuc/supplier-vehicles.service";
import { SupplierDrivers } from "@app/shared/models/danhmuc/supplier-drivers.model";
import { SupplierVehicles } from "@app/shared/models/danhmuc/supplier-vehicles.model";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";


@Component({
  selector: "modal-supplier",
  templateUrl: "./modal-supplier.component.html",
  styleUrls: ["./modal-supplier.component.css"],
})
export class ModalSupplierComponent implements OnInit {
  public entity: Supplier;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listProvince: Province[];
  public listDistrict: District[];
  public listEmployee: Employee[];
  public listSupplierService: OtherCategories[];
  public listIndustrialZone: OtherCategories[];
  public listBranch: Branch[];
  public listBank: Bank[] = [];
  public provinceCode?: string;
  public userLoged: Profile;
  public busy: Subscription;
  approvedPermission = false;
  viewAttachFiles = false;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private supplierService: SupplierService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private otherService: OtherCategoriesService,
    private _authService: AuthService,
    private branchService: BranchService,
    private bankService: BankService,
    private supplierDriverService: SupplierDriversService,
    private supplierVehicleSevice: SupplierVehiclesService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.approvedPermission = (this._authService.hasPermission("SUPPLIER_ACCEPT") || this.userLoged.isAdmin)
    this.loadProvince();
    this.loadSupplierService();
    this.loadIndustrialZone();
    this.loadBranch();
    this.loadBank();
  }

  loadDrivers() {
    this.busy = this.supplierDriverService
      .getAll(this.entity.id, false)
      .subscribe((res: ResponseValue<SupplierDrivers[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity.listSupplierDrivers = res.data;
        }
      });
  }
  loadVehicles() {
    this.busy = this.supplierVehicleSevice
      .getAll(this.entity.id, false)
      .subscribe((res: ResponseValue<SupplierVehicles[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity.listSupplierVehicles = res.data;
        }
      });
  }

  saveSuccessDriver() {
    this.loadDrivers();
  }
  closeModalDriver() {
    this.viewDrivers = false;
  }
  saveSuccessVehicle() {
    this.loadVehicles();
  }
  closeModalVehicle() {
    this.viewVehicles = false;
  }

  loadBank() {
    this.bankService.getAll().subscribe((res: ResponseValue<Bank[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listBank = res.data || [];
      }
    });
  }

  loadBranch() {
    this.busy = this.branchService
      .getAll()
      .subscribe((res: ResponseValue<Branch[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listBranch = res.data;
        }
      });
  }
  loadSupplierService() {
    const params = new HttpParams().set("type", "SUPSV");
    this.busy = this.otherService
      .getAll(params)
      .subscribe((res: ResponseValue<Province[]>) => {
        console.log(res);
        if (res.code == "200" || res.code == "201") {
          this.listSupplierService = res.data;
        }
      });
  }
  loadIndustrialZone() {
    const params = new HttpParams().set("type", "ZONE");
    this.busy = this.otherService
      .getAll(params)
      .subscribe((res: ResponseValue<Province[]>) => {
        console.log(res);
        if (res.code == "200" || res.code == "201") {
          this.listIndustrialZone = res.data;
        }
      });
  }
  loadProvince(): void {
    const params = new HttpParams();
    this.busy = this.provinceService
      .getAll(params)
      .subscribe((res: ResponseValue<Province[]>) => {
        console.log(res);
        if (res.code == "200" || res.code == "201") {
          this.listProvince = res.data;
        }
      });
  }
  loadDistrict(): void {
    this.busy = this.districtService
      .getbyProvinceCode(this.provinceCode)
      .subscribe((res: ResponseValue<Province[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listDistrict = res.data;
        }
      });
  }

  add() {
    this.entity = {
      checked: false, listSupplierDrivers: [], listSupplierVehicles: []
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(code: string, flag: boolean) {
    this.supplierService
      .getDetail(code)
      .subscribe((res: ResponseValue<Supplier>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.flagXem = flag;
          this.flagSave = false;
          this.loadDrivers();
          this.loadVehicles();
          this.provinceCode = this.entity.provinceCode;
          this.loadDistrict();
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.entity.createdBy = this.userLoged.id;
      if (this.entity.id == undefined) {
        this.supplierService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG + ' : ' + res.message
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.entity.updatedBy = this.userLoged.id;
        this.supplierService.update(this.entity).subscribe(
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
                MessageContstants.UPDATED_ERR_MSG + ' : ' + res.message
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

  onProvinceChanged(event: Province) {
    this.provinceCode = event?.provinceCode;
    this.loadDistrict();
  }

  viewDrivers = false;
  @ViewChild(ModalSupplierDriverComponent, { static: false }) modalDrivers: ModalSupplierDriverComponent
  newDriver(supplierId: number) {
    this.viewDrivers = true;
    setTimeout(() => {
      this.modalDrivers.add(supplierId);
    }, 50);
  }

  viewVehicles = false;
  @ViewChild(ModalSupplierVehicleComponent, { static: false }) modalVehicles: ModalSupplierVehicleComponent
  newVehilce(supplierId: number) {
    this.viewVehicles = true;
    setTimeout(() => {
      this.modalVehicles.add(supplierId);
    }, 50);
  }

  update(id: number) {
    this.viewDrivers = true;
    setTimeout(() => {
      this.modalDrivers.edit(id, false);
    }, 50);
  }
  deleteConfirm(id: number): void {
    this._notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(id));
  }

  delete(id: number) {
    this.
      supplierDriverService.delete(id)
      .subscribe((res: ResponseValue<SupplierDrivers>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadDrivers();
          this._notificationService.printSuccessMessage(
            MessageContstants.DELETED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  accept(id: number, flag: boolean) {
    this.supplierDriverService
      .accept(id, flag)
      .subscribe((res: ResponseValue<SupplierDrivers>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadDrivers();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }
  updateVehicle(id: number) {
    this.viewVehicles = true;
    setTimeout(() => {
      this.modalVehicles.edit(id, false);
    }, 50);
  }
  deleteConfirmVehicle(id: number): void {
    this._notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(id));
  }

  deleteVehicle(id: number) {
    this.
      supplierDriverService.delete(id)
      .subscribe((res: ResponseValue<SupplierDrivers>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadVehicles();
          this._notificationService.printSuccessMessage(
            MessageContstants.DELETED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  acceptVehicle(id: number, flag: boolean) {
    this.supplierVehicleSevice
      .accept(id, flag)
      .subscribe((res: ResponseValue<SupplierDrivers>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadVehicles();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'SUPPLIER',
      functionName: 'SUPPLIER',
      refNo: this.entity.supplierCode,
      jobId: ''
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }
  saveSuccessFile(event: any): void {
  }
  closeModalFile() {
    this.viewAttachFiles = false;
  }
}
