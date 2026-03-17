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
import { FormatContstants } from "@app/shared/constants/format.constants";
import { Profile, ResponseValue, Supplier } from "@app/shared/models";
import { GasSite } from "@app/shared/models/gas-site.model";
import { ImportGas } from "@app/shared/models/transports/import-gas.model";
import {
  AuthService,
  BranchService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { GasSiteService } from "@app/shared/services/gas-site.service";
import { SupplierService } from "@app/shared/services/supplier.service";
import { ImportGasService } from "@app/shared/services/transports/import-gas.service";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { Attachfiles } from "@app/shared/models/attachfiles.models";

@Component({
  selector: "modal-import-gas",
  templateUrl: "./modal-import-gas.component.html",
  styleUrls: ["./modal-import-gas.component.css"],
})
export class ModalImportGasComponent implements OnInit {
  public entity: ImportGas;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = true;

  listSupplier: Supplier[] = [];
  listGasSite: GasSite[] = [];

  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;

  hasPermissionApproved = false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), true);

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private supplierService: SupplierService,
    private importGasService: ImportGasService,
    private _authService: AuthService,
    private gasSiteService: GasSiteService,
    private _utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.hasPermissionApproved =
      this._authService.hasPermission("IMPORTGAS_ACCEPT");
    this.loadGasSite();
    this.loadSupplier();
  }

  loadGasSite() {
    this.busy = this.gasSiteService
      .getAll(0)
      .subscribe((res: ResponseValue<GasSite[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listGasSite = res.data;
        }
      });
  }
  loadSupplier() {
    const params = new HttpParams().set(
      "branchid",
      this.userLoged.branchId.toString()
    );
    this.busy = this.supplierService
      .getAll(params)
      .subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listSupplier = res.data;
        }
      });
  }

  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "IMPORTGAS",
      functionName: "IMPORTGAS",
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
  add() {
    this.entity = {
      checked: false,
      quantity: 0,
      unitPrice: 0,
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean, permission: boolean) {
    this.importGasService
      .getDetail(id)
      .subscribe((res: ResponseValue<ImportGas>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.flagNew = false;
          this.flagXem = flag;
          if (
            this.entity.status == 2 ||
            this.entity.createdBy != this.userLoged.id
          )
            this.flagXem = true;
          this.flagSave = false;
          if (this.entity.finishImportTime) {
            this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
              new Date(
                moment(
                  this.entity.finishImportTime,
                  FormatContstants.DATETIMEEN
                ).format(FormatContstants.DATETIMEEN)
              ),
              true
            );
            this.entity.finishImportTime = moment(
              this.entity.finishImportTime,
              FormatContstants.DATETIMEEN
            ).format(FormatContstants.DATETIMEVN);
          }
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
      this.entity.branchId = Number.parseInt(this.userLoged.branchId);
      this.entity.createdBy = this.userLoged.id;
      if (this.entity.id == undefined) {
        this.importGasService.add(this.entity).subscribe(
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
        this.importGasService.update(this.entity).subscribe(
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

  //Chuyển duyệt
  changeStatus(type: number) {
    this.entity.approvedBy = this.userLoged.id;
    this.importGasService
      .updateState(this.entity, type)
      .subscribe((res: ResponseValue<ImportGas>) => {
        if (res.code == "200" || res.code == "201") {
          this.SaveSuccess.emit(true);
          this.modalAddEdit.hide();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  selectedNgaybatdau(event) {
    this.entity.finishImportTime = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedNgaybatdau(event) {
    if (this.entity.finishImportTime == null)
      this.entity.finishImportTime = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
