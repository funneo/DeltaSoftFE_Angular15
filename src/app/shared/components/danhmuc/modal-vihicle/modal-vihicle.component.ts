
import { EmployeeService } from "./../../../services/employee.service";
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
import {
  Branch,
  Employee,
  OtherCategories,
  Profile,
  ResponseValue,
  Vihicle,
} from "@app/shared/models";
import {
  AuthService,
  BranchService,
  NotificationService,
  OtherCategoriesService,
  UtilityService,
} from "@app/shared/services";
import { VihicleService } from "@app/shared/services/vihicle.service";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { VehicleType } from "@app/shared/models/danhmuc/vehicle-type.model";
import { TireDiagramType } from "@app/shared/models/danhmuc/tire-diagram-type.model";
import { VehicleTypeService } from "@app/shared/services/danhmuc/vehicle-type.service";
import { TireDiagramService } from "@app/shared/services/danhmuc/tire-diagram-type.service";

@Component({
  selector: "modal-vihicle",
  templateUrl: "./modal-vihicle.component.html",
  styleUrls: ["./modal-vihicle.component.css"],
})
export class ModalVihicleComponent implements OnInit {
  public entity: Vihicle;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public userLoged: Profile;
  public busy: Subscription;

  maskNumber = UtilityService.maskNumber;
  listBranch?: Branch[];
  listEmployee: Employee[] = [];
  listVihicleType: OtherCategories[];
  listVihicleTypeBot: OtherCategories[];
  listVehicleType:VehicleType[]=[];
  listTireDiagramType:TireDiagramType[]=[];
  viewAttachFiles = false;
  public mask = {
    guide: true,
    showMask: true,
    mask: [/\d/, /\d/, /\w/, /\d/, "-", /\d/, /\d/, ".", /\d/, /\d/, /\d/],
  };

  _jobDate?: string;
  ngayJobOptions = this._utilityService.dateTimeOptionDays(new Date(), false);

  ngayHandangkiem = this._utilityService.dateTimeOptionDays(new Date(), false);
  ngayBHTNDS = this._utilityService.dateTimeOptionDays(new Date(), false);
  ngayBHVC = this._utilityService.dateTimeOptionDays(new Date(), false);
  ngayLuuhanhNH = this._utilityService.dateTimeOptionDays(new Date(), false);
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private vihicleService: VihicleService,
    private otherService: OtherCategoriesService,
    private _authService: AuthService,
    private _utilityService: UtilityService,
    private branchService: BranchService, private _vehicleTypeService:VehicleTypeService, private _tireDiagramService:TireDiagramService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadChinhanh();
    this.loadVihicleType();
    this.loadVihicleTypeBot();
    this.loadEmployee();
    this.loadVehicleType();
    this.loadTireDiagramType();
  }
  loadVihicleType() {
    const params = new HttpParams().set("type", "VIHITYPE");
    this.busy = this.otherService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listVihicleType = res.data;
        }
      });
  }
  onChangeVehicleType(event:VehicleType){
    if(!event) return;
    this.entity.garageTypeName = event.typeName;
    this.entity.garageGroupId = event.categoryId;
    debugger;
  }
  loadVehicleType(){
    const params = new HttpParams();
    this.busy = this._vehicleTypeService
      .getAll()
      .subscribe((res: ResponseValue<VehicleType[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listVehicleType = res.data;
        }
      });
  }
  loadTireDiagramType(){
    const params = new HttpParams();
    this.busy = this._tireDiagramService
      .getAll()
      .subscribe((res: ResponseValue<TireDiagramType[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listTireDiagramType = res.data;
        }
      });
  }

  loadEmployee() {
    const params = new HttpParams();
    this.employeeService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        this.listEmployee = res.data;
      });
  }
  loadVihicleTypeBot() {
    const params = new HttpParams().set("type", "BOT");
    this.busy = this.otherService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listVihicleTypeBot = res.data;
        }
      });
  }
  loadChinhanh() {
    const params = new HttpParams();
    this.busy = this.branchService
      .getAll()
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listBranch = res.data;
        }
      });
  }

  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "VEHICLE",
      functionName: "VEHICLE",
      refNo: this.entity.id.toString(),
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }
  add() {
    this.entity = {
      checked: false,
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.vihicleService
      .getDetail(id)
      .subscribe((res: ResponseValue<Vihicle>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          if (this.entity.vehicleHandoverDate) {
            this.ngayJobOptions = this._utilityService.dateTimeOptionDays(
              new Date(
                moment(
                  this.entity.vehicleHandoverDate,
                  FormatContstants.DATEEN
                ).format(FormatContstants.DATEVN)
              )
            );
            this._jobDate = moment(
              this.entity.vehicleHandoverDate,
              FormatContstants.DATEEN
            ).format(FormatContstants.DATEVN);
          }
          this.flagXem = flag;
          this.flagSave = false;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.entity.createdBy = this.userLoged.id;
      this.entity.vehicleHandoverDate = this._jobDate;
      if (this.entity.id == undefined) {
        debugger;
        this.vihicleService.add(this.entity).subscribe(
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
        this.entity.updatedBy = this.userLoged.id;
        const updateObservable =
          this.entity.listOilQuota?.length > 0
            ? this.vihicleService.updateContainer(this.entity)
            : this.vihicleService.update(this.entity);

        updateObservable.subscribe(
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
                MessageContstants.UPDATED_ERR_MSG + res.message
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
  selectedNgayJob(event) {
    this._jobDate = moment(event.start).format("DD/MM/YYYY");
  }

  closedNgayJob(event) {
    if (this._jobDate == null)
      this._jobDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }
  selectedngayHandangkiem(event) {
    this.entity.vehicleInspectionDeadline = moment(event.start).format(
      "DD/MM/YYYY"
    );
  }

  closedngayHandangkiem(event) {
    if (this.entity.vehicleInspectionDeadline == null)
      this.entity.vehicleInspectionDeadline = moment(event.oldStartDate).format(
        "DD/MM/YYYY"
      );
  }
  selectedngayBHTNDS(event) {
    this.entity.civilLiabilityInsuranceExpirationDate = moment(
      event.start
    ).format("DD/MM/YYYY");
  }

  closedngayBHTNDS(event) {
    if (this.entity.civilLiabilityInsuranceExpirationDate == null)
      this.entity.civilLiabilityInsuranceExpirationDate = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY");
  }
  selectedngayBHVC(event) {
    this.entity.vehicleDamageInsuranceExpirationDate = moment(
      event.start
    ).format("DD/MM/YYYY");
  }

  closedngayBHVC(event) {
    if (this.entity.vehicleDamageInsuranceExpirationDate == null)
      this.entity.vehicleDamageInsuranceExpirationDate = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY");
  }
  selectedngayLuuhanhNH(event) {
    this.entity.vehicleLicenseCopyExpirationDate = moment(event.start).format(
      "DD/MM/YYYY"
    );
  }

  closedngayLuuhanhNH(event) {
    if (this.entity.vehicleLicenseCopyExpirationDate == null)
      this.entity.vehicleLicenseCopyExpirationDate = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY");
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
}
