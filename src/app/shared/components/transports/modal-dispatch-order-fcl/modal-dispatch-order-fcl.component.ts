import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Route } from "@angular/router";
import { MessageContstants } from "@app/shared/constants";
import { FormatContstants } from "@app/shared/constants/format.constants";
import {
  Profile,
  Fee,
  Supplier,
  Vihicle,
  Employee,
  OtherCategories,
  ResponseValue,
  DispatchOrderTicket,
  DispatchOrderMonthlyticket,
  DispatchOrderEtc,
} from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { HandOver } from "@app/shared/models/customer-communicate/app-garage-delta/hand-over.model";
import { TollStation } from "@app/shared/models/toll-station.model";
import { Tollroute } from "@app/shared/models/tollroute.model";
import { DispatchOrderAttachfiles } from "@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles";
import { DispatchOrderFee } from "@app/shared/models/transports/dispatchorders/dispatch-order-fee";
import { DispatchOrderParkingticket } from "@app/shared/models/transports/dispatchorders/dispatch-order-parkingticket.model";
import { DispatchOrderPurchasePrice } from "@app/shared/models/transports/dispatchorders/dispatch-order-purchase-price";
import { DispatchOrderSurcharge } from "@app/shared/models/transports/dispatchorders/dispatch-order-surcharge.model";
import { Dispatchorder } from "@app/shared/models/transports/dispatchorders/dispatchorder";
import { Dispatchorderdetailed } from "@app/shared/models/transports/dispatchorders/dispatchorderdetailed";
import { GasManagement } from "@app/shared/models/transports/gas-management.model";
import { Quotationsubcontractors } from "@app/shared/models/transports/quotationsubcontractors.model";
import { Quotationsubcontractorsdetailed } from "@app/shared/models/transports/quotationsubcontractorsdetailed.model";
import {
  UtilityService,
  NotificationService,
  EmployeeService,
  AuthService,
  OtherCategoriesService,
  FeeService,
} from "@app/shared/services";
import { QuotationsubcontractorsService } from "@app/shared/services/quotationsubcontractors.service";
import { SupplierService } from "@app/shared/services/supplier.service";
import { TollStationService } from "@app/shared/services/toll-station.service";
import { TollrouteService } from "@app/shared/services/tollroute.service";
import { GasManagementService } from "@app/shared/services/transports/gas-management.service";
import { VihicleService } from "@app/shared/services/vihicle.service";
import { environment } from "@environments/environment";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { ModalDispatchorderTicketComponent } from "../modal-dispatchorder-ticket/modal-dispatchorder-ticket.component";
type AOA = any[][];
import * as XLSX from "xlsx";
import { TransportCategoryService } from "@app/shared/services/danhmuc/transport-category.service";
import { ShippingTask } from "@app/shared/models/transports/shipping-task.model";
import { CustomerRoutes } from "@app/shared/models/danhmuc/customer-routes.model";
import { SupplierDrivers } from "@app/shared/models/danhmuc/supplier-drivers.model";
import { SupplierVehicles } from "@app/shared/models/danhmuc/supplier-vehicles.model";
import { SupplierDriversService } from "@app/shared/services/danhmuc/supplier-drivers.service";
import { SupplierVehiclesService } from "@app/shared/services/danhmuc/supplier-vehicles.service";
import { ModalCustomerRoutesComponent } from "../../danhmuc/modal-customer-routes/modal-customer-routes.component";
import { DispatchOrderStandardRoute } from "@app/shared/models/transports/dispatchorders/dispatch-order-standard-route.model";
import { VehicleOilQuota } from "@app/shared/models/danhmuc/vehicle-oil-quota.model";
import { PortsService } from "@app/shared/services/danhmuc/ports.service";
import { CustomerLocationsService } from "@app/shared/services/danhmuc/customer-locations.service";
import { CustomerLocations } from "@app/shared/models/danhmuc/customer-locations.model";
import { GroupPorts } from "@app/shared/models/danhmuc/group-ports.model";
import {
  DispatchOrderFcl,
  DispatchOrderFclDetail,
} from "@app/shared/models/fcl/dispatch-order-fcl";
import { DispatchOrderFclService } from "@app/shared/services/fcl/dispatch-order-fcl.service";
import { Ports } from "@app/shared/models/danhmuc/ports.model";
import { ModalListShippingTaskComponent } from "../modal-list-shipping-task/modal-list-shipping-task.component";
import { ModalShippingTaskCsComponent } from "../modal-shipping-task-cs/modal-shipping-task-cs.component";
import { ModalViewShippingTaskComponent } from "../modal-view-shipping-task/modal-view-shipping-task.component";
import { NgSelectComponent } from "@ng-select/ng-select";
import { ShippingTaskService } from "@app/shared/services/transports/shipping-task.service";
import { ModalShippingTaskAttachFileComponent } from "../modal-shipping-task-attach-file/modal-shipping-task-attach-file.component";
import { TransitPortsService } from "@app/shared/services/danhmuc/transit-ports.service";
import { TransitPorts } from "@app/shared/models/danhmuc/transit-ports";
import { CustomerRoutesService } from "@app/shared/services/danhmuc/customer-routes.service";

@Component({
  selector: "modal-dispatch-order-fcl",
  templateUrl: "./modal-dispatch-order-fcl.component.html",
  styleUrls: ["./modal-dispatch-order-fcl.component.css"],
})
export class ModalDispatchOrderFclComponent implements OnInit {
  public entity: DispatchOrderFcl = {};
  public flagNew?: boolean = false;
  public flagXem: boolean = false;
  public flagOpMan = false;
  public flagSave: boolean = false;
  public flagOption: boolean = false;
  public viewWorkflow: boolean = false;
  public viewRoute: boolean = false;
  public viewAttachFiles: boolean = false;
  public viewTicket: boolean = false;
  public viewModalWorkflows: boolean = false;
  public viewJobModal: boolean = false;
  public userLoged: Profile;
  public startTime?: string;
  public endTime?: string;
  public supplierId?: number = 0;
  public listTollRoute: Tollroute[] = [];
  public listPod: DispatchOrderAttachfiles[] = [];
  public listAttachFile: DispatchOrderAttachfiles[] = [];
  public listFee: Fee[];
  public listQuotation: Quotationsubcontractors[] = [];
  public selectedItem: Dispatchorderdetailed = {};
  public flagOk: boolean = false;
  public selectdTicketIndex?: number;
  public selectdEtcIndex?: number;
  public quotationDetailed: Quotationsubcontractorsdetailed;

  public listPort: Ports[] = [];
  public listCFS: Ports[] = [];
  public listShipBrand: OtherCategories[] = [];
  closing_permission: boolean = false;
  accept_permission: boolean = false;
  account_permission: boolean = false;
  job_locked: boolean = false;
  admin_permission = false;
  permission: Permissions;
  listCungduongDi: DispatchOrderStandardRoute[] = [{}, {}];
  listCungduongVe: DispatchOrderStandardRoute[] = [{}, {}];
  listLocationsCustomer: CustomerLocations[] = [];
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), true);
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  public listSupplier: Supplier[];
  public listVihicle: Vihicle[];
  public listMooc: Vihicle[];
  public listEmployee: Employee[];
  public listDriver: Employee[];
  public listRoute: Route[];
  public listcontType: OtherCategories[] = [];
  public listdocumentType: OtherCategories[] = [];
  public listVihicleType: OtherCategories[] = [];
  public listSurcharge: OtherCategories[] = [];
  public vihicleTypeId?;
  public driverId?: string;
  public secondDriverId?: string;
  public vihicleId?: number;
  public moocId?: number;
  public tollRouteCode?: string = "";
  branchId?: string;
  maskNumber = UtilityService.maskNumber;
  mask0 = UtilityService.mask0;
  public _gradeDriver = 0;
  public _evaluationDriver = "";
  selectedSupplier: Supplier = {};
  gasValue: GasManagement;
  public busy: Subscription;
  km: number = 0;
  isExport: boolean = false;
  public listTollStation: TollStation[] = [];
  totalEtc = 0;
  listHandover: HandOver[];
  listOilQuota: VehicleOilQuota[] = [];
  cangExpanded = false;
  nhaMayExpanded = false;
  orderType = 0;
  array = [
    { value: 0, text: "Đường dài" },
    { value: 1, text: "Đường ngắn" },
  ];
  @Input() appFuncion: any;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalDispatchOrderFcl", { static: false })
  modalDispatchOrderFcl: ModalDirective;
  flagManualChange: boolean = false;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalDispatchorderTicketComponent, { static: false })
  modalTicket: ModalDispatchorderTicketComponent;
  @ViewChild(ModalCustomerRoutesComponent, { static: false })
  modalCustomerRoutes: ModalCustomerRoutesComponent;
  // @ViewChild(ModalShippingTaskCsComponent, { static: false })  modalAddShippingTask: ModalShippingTaskCsComponent;
  @ViewChild(ModalViewShippingTaskComponent, { static: false })
  modalAddShippingTask: ModalViewShippingTaskComponent;
  constructor(
    private notificationService: NotificationService,
    private vihicleService: VihicleService,
    private employeeService: EmployeeService,
    private suppliertSerive: SupplierService,
    private _authService: AuthService,
    private otherCategoryService: OtherCategoriesService,
    private _utilityService: UtilityService,
    private supplierDriverService: SupplierDriversService,
    private otherService: OtherCategoriesService,
    private _shippingTaskSerrvice: ShippingTaskService,
    private quotationsubService: QuotationsubcontractorsService,
    private tollRouteService: TollrouteService,
    private vehicleService: VihicleService,
    private portsService: PortsService,
    private dispatchOrderService: DispatchOrderFclService,
    private _groupPortsService: PortsService,
    private feeService: FeeService,
    private _customerLocationsService: CustomerLocationsService,
    private tollStationService: TollStationService,
    private gasManagementService: GasManagementService,
    private _transportCategoryService: TransportCategoryService,
    private _customerRoutesService: CustomerRoutesService,
    private _transitPortsService: TransitPortsService,
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = this.userLoged.branchId;
    this.closing_permission =
      this._authService.hasPermission("FCL_CLOSING") || this.userLoged.isAdmin;
    this.accept_permission =
      this._authService.hasPermission("FCL_ACCEPT") || this.userLoged.isAdmin;
    this.account_permission =
      this._authService.hasPermission("FCL_ACCOUNT") || this.userLoged.isAdmin;
    this.admin_permission = this.userLoged.isAdmin;
    this.loadSupplier();
    this.loadEmployee();
    this.loadVihicleType();
    this.loadListVihicles();
    //this.loadTollRoute();
    this.loadContType();
    this.loadFee();
    this.loadMooc();
    // this.loadSurcharge();
    this.loadTollStation();
    //this.loadHandover();
    this.loadOtherCategory();
    this.loadPorts();
    this.loadGroupPorts();
    this.loadTransitPorts();
  }

  expandedCang() {
    this.cangExpanded = !this.cangExpanded;
  }
  expandedNhamay() {
    this.nhaMayExpanded = !this.nhaMayExpanded;
  }
  viewModalShippingTask = false;
  viewCongviec(id: number) {
    this.viewModalShippingTask = true;
    setTimeout(() => {
      this.modalAddShippingTask.edit(id?.toString(), true);
    }, 50);
  }

  viewJob(id: number) { }

  newShippingTask() {
    this.viewModal = true;
    setTimeout(() => {
      this.modalList.view();
    }, 50);
  }

  deleteWorkflow(item: DispatchOrderFclDetail) {
    let index = this.entity.listDetailed.indexOf(item);
    if (index !== -1) {
      this.entity.listDetailed.splice(index, 1);
    }
  }
  viewAttackFiles = false;
  attack(id: number) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "SHIPPINGTASK",
      functionName: "SHIPPINGTASK",
      refNo: id.toString(),
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(
        item,
        this.entity.createdBy != this.userLoged.id
      );
    }, 50);
  }
  viewAttackDriver = false;
  @ViewChild(ModalShippingTaskAttachFileComponent, { static: false }) modalAttackDriverFiles: ModalShippingTaskAttachFileComponent;
  attackDriver(id: number) {
    this.viewAttackDriver = true;
    setTimeout(() => {
      this.modalAttackDriverFiles.edit(
        id,
        false
      );
    }, 50);
  }
  duplicate(id: number) {
    this.notificationService.printConfirmationDialog(MessageContstants.DUPLICATE_SHIPPINGTASK, () => {
      this._shippingTaskSerrvice
        .duplicate(id)
        .subscribe((res: ResponseValue<number>) => {
          if (res.code == "200" || res.code == "201") {
            let newId = res.data;
            this.notificationService.printSuccessMessage(MessageContstants.DUPLICATE_SHIPPINGTASK_SUCCESS + ' Id: ' + newId.toString());
          } this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG + "\n" + res.code);
        });
    });
  }

  //biến lưu xe nhà hay là thuê ngoài
  isLocal = true;
  isSubcontractors = false;

  listContTypes: OtherCategories[] = [];
  loadOtherCategory() {
    const params = new HttpParams().set("type", null);
    this.otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        this.listContTypes = res.data.filter((x) => x.type === "CONTTYPE");
        this.listShipBrand = res.data.filter((x) => x.type === "HANGTAU");
      });
  }
  listGroupPorts: GroupPorts[] = [];
  loadGroupPorts(): void {
    this.busy = this._groupPortsService
      .getAllGroupPorts()
      .subscribe((res: ResponseValue<GroupPorts[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listGroupPorts = res.data;
          this.listGroupPorts = this.listGroupPorts.map((element) => ({
            ...element,
            name: `${element.code} - ${element.name}`,
          }));
        }
      });
  }
  loadPorts(): void {
    this.busy = this.portsService
      .getAll()
      .subscribe((res: ResponseValue<GroupPorts[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listPort = res.data;
          this.listCFS = res.data;
        }
      });
  }
  listTransitPorts: TransitPorts[] = [];
  loadTransitPorts(): void {
    this.busy = this._transitPortsService
      .getAll(true)
      .subscribe((res: ResponseValue<TransitPorts[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listTransitPorts = res.data;
        }
      });
  }

  orderTypeChange(event: any) {
    if (event.value === 0) {
      // Nếu là đường dài
      this.entity.dinhmucDauLuotDi = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangIdLuotDi
      )?.value;
      this.entity.dinhmucDauLuotVe = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangIdLuotVe
      )?.value;
      this.entity.dinhmucDauTrungchuyenCang = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenCang
      )?.value;
      this.entity.dinhmucDauTrungchuyenCangVe = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenCangVe
      )?.value;
      this.entity.dinhmucDauTrungchuyenNhamay = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenNhamay
      )?.value;
      this.entity.dinhmucDauTrungchuyenNhamayVe = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenNhamayVe
      )?.value;
    } else {
      this.entity.dinhmucDauLuotDi = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangIdLuotDi
      )?.shortWayValue;
      this.entity.dinhmucDauLuotVe = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangIdLuotVe
      )?.shortWayValue;
      this.entity.dinhmucDauTrungchuyenCang = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenCang
      )?.shortWayValue;
      this.entity.dinhmucDauTrungchuyenCangVe = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenCangVe
      )?.shortWayValue;
      this.entity.dinhmucDauTrungchuyenNhamay = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenNhamay
      )?.shortWayValue;
      this.entity.dinhmucDauTrungchuyenNhamayVe = this.listOilQuota.find(
        (x) => x.id === this.entity.luonghangTrungchuyenNhamayVe
      )?.shortWayValue;
    }
    this.calulateOil();
  }
  //Cập nhật lại toàn bộ phần lựa chọn định mức
  updateOilQuota() {
    if (this.listOilQuota?.length == 0) return;
    this.entity.luonghangIdLuotDi = null;
    this.entity.dinhmucDauLuotDi = 0;
    this.entity.luonghangIdLuotVe = null;
    this.entity.luonghangTrungchuyenCang = null;
    this.entity.luonghangTrungchuyenCangVe = null;
    this.entity.luonghangTrungchuyenNhamay = null;
    this.entity.luonghangTrungchuyenNhamayVe = null;
    this.entity.dinhmucDauLuotVe = 0;
    this.entity.dinhmucDauTrungchuyenCang = 0;
    this.entity.dinhmucDauTrungchuyenCangVe = 0;
    this.entity.dinhmucDauTrungchuyenNhamay = 0;
    this.entity.dinhmucDauTrungchuyenNhamayVe = 0;
  }
  loadVehicle(id: number) {
    this.vehicleService
      .getDetail(id)
      .subscribe((res: ResponseValue<Vihicle>) => {
        if (res.code == "200" || res.code == "201") {
          this.listOilQuota = res.data.listOilQuota;
        } else this.listOilQuota = [];
      });
  }

  loadLocations(listCus: string) {
    this.busy = this._customerLocationsService
      .getMultiCustomer(listCus)
      .subscribe((res: ResponseValue<CustomerLocations[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listLocationsCustomer = res.data;
        } else this.listLocationsCustomer = [];
      });
  }

  listCustomerRoutes: CustomerRoutes[] = [];
  loadRoutes(listCus: string) {
    this.busy = this._customerRoutesService
      .getMultiCustomer(listCus)
      .subscribe((res: ResponseValue<CustomerRoutes[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listCustomerRoutes = res.data;
        } else this.listCustomerRoutes = [];
      });
  }
  //Nếu thay đổi loại lệnh từ xe nhà qua xe ngoài hoặc ngược lại thì xóa hết dữ liệu của cái cũ đi
  changeSub() {
    if (!this.isSubcontractors) {
      //Nếu là xe nhà thì xóa hết thông tin về NCC, xóa chi phí thuê ngoài
      this.entity.shippingUnitId = null;
      this.entity.shippingUnitCode = "";
      this.entity.shippingUnitName = "";
      this.entity.subcontractorsPurchaseCost = 0;
      this.entity.subcontractorsPurchaseVat = 0;
      this.isLocal = true;
      this.isSubcontractors = false;
      this.selectedSupplier = {};
    } else {
      //Xóa cung đường, xóa chi phí dầu
      this.entity.listEtc = [];
      this.entity.listFee = [];
      this.entity.driverId = null;
      this.entity.fuelDriverId = null;
      this.isLocal = false;
      this.entity.fuelDriverId = null;
      this.entity.isSubcontractors = true;
    }
  }
  changeLocal() {
    if (!this.entity.isSubcontractors) {
      //Nếu là xe nhà thì xóa hết thông tin về NCC, xóa chi phí thuê ngoài
      this.entity.shippingUnitId = null;
      this.entity.shippingUnitCode = "";
      this.entity.shippingUnitName = "";
      this.entity.subcontractorsPurchaseCost = 0;
      this.entity.subcontractorsPurchaseVat = 0;
      this.isLocal = true;
      this.isSubcontractors = false;
      this.selectedSupplier = {};
      this.vihicleTypeId = 16;
    } else {
      //Xóa cung đường, xóa chi phí dầu
      this.entity.listEtc = [];
      this.entity.listFee = [];
      this.entity.driverId = null;
      this.entity.fuelDriverId = null;
      this.isLocal = false;
      this.entity.fuelDriverId = null;
      this.entity.isSubcontractors = true;
    }
  }
  loadTollStation() {
    this.tollStationService
      .getAll()
      .subscribe((res: ResponseValue<TollStation[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listTollStation = res.data;
        }
      });
  }
  loadFee() {
    const params = new HttpParams();
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(
        (_) =>
          _.groupCode == "CP01" ||
          _.groupCode == "CP02" ||
          _.groupCode == "CP03"
      ) || [];
      // Create a new array with copied objects to prevent cache mutation
      this.listFee = filtered.map(fee => ({
        ...fee,
        feeName: fee.feeCode + "-" + fee.feeName
      }));
    });
  }

  feeCodeChanged(item: DispatchOrderPurchasePrice, event: Fee) {
    item.feeId = event?.id;
  }

  feeCodeParkingChanged(item: DispatchOrderParkingticket, event: Fee) {
    item.feeId = event?.id;
  }
  feeCodeTicketChanged(item: DispatchOrderTicket, event: Fee) {
    item.feeId = event?.id;
  }

  feeCodeMonthlyChanged(item: DispatchOrderMonthlyticket, event: Fee) {
    item.feeId = event?.id;
  }

  feeCodeEtcChanged(item: DispatchOrderEtc, event: Fee) {
    item.feeId = event?.id;
  }

  feeCode2Changed(item: DispatchOrderFee, event: Fee) {
    item.feeId = event?.id;
  }

  driver1Change(event: Employee) {
    this.entity.fuelDriverId = event?.id;
    this.entity.driverName = event?.employeeFullName;
    this.entity.driverTel = event?.telephone;
  }
  driverSupplierChange(event: SupplierDrivers) {
    this.entity.driverName = event?.driverName;
    this.entity.driverTel = event?.telephone;
  }

  driverNameChange(): void {
    this.driverId = null;
    this.entity.driverId = null;
  }
  vehicleNameChange() {
    this.entity.vehicleId = null;
  }
  driver2Change(event: Employee) {
    this.entity.secondDriverId = event?.id;
    this.entity.secondDriverName = event?.employeeFullName;
    this.entity.secondDriverTel = event?.telephone;
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
  loadContType() {
    const params = new HttpParams().set("type", "CONTTYPE");
    this.busy = this.otherService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listcontType = res.data;
        }
      });
  }
  loadMooc() {
    const params = new HttpParams().set(
      "branchid",
      this.userLoged.branchId.toString()
    );
    this.busy = this.vihicleService
      .getAllMooc(params)
      .subscribe((res: ResponseValue<Vihicle[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listMooc = res.data;
        } else {
          if (res.code == "204") {
            this.listMooc = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  loadSupplier(): void {
    const params = new HttpParams().set(
      "branchid",
      this.userLoged.branchId.toString()
    );
    this.busy = this.suppliertSerive
      .getAll(params)
      .subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listSupplier = res.data;
        } else {
          if (res.code == "204") {
            this.listSupplier = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  showDriverList = false;
  toggleDriverList() {
    this.showVehicleList = false;
    this.showDriverList = !this.showDriverList;
    setTimeout(() => {
      if (this.driverSelect) {
        this.driverSelect.open();
      }
    }, 100);
  }
  updateSelectedDriverName() {
    const selectedDriver = this.selectedSupplier.listSupplierDrivers.find(
      (d) => d.id === this.entity.driverId
    );
    this.entity.driverName = selectedDriver ? selectedDriver.driverName : "";
    this.entity.driverTel = selectedDriver ? selectedDriver.telephone : "";
    this.showDriverList = false;
  }

  @ViewChild("vehicleSelect") vehicleSelect!: NgSelectComponent;
  @ViewChild("driverSelect") driverSelect!: NgSelectComponent;
  showVehicleList = false;
  toggleVehicleList() {
    this.showDriverList = false;
    this.showVehicleList = !this.showVehicleList;

    // Chờ cho ng-select render xong rồi mới mở dropdown
    setTimeout(() => {
      if (this.vehicleSelect) {
        this.vehicleSelect.open();
      }
    }, 100);
  }
  updateSelectedVehicleName() {
    const selectedVehicle = this.selectedSupplier.listSupplierVehicles.find(
      (d) => d.id === this.entity.vehicleId
    );
    this.entity.vehiclelLicensePlates = selectedVehicle
      ? selectedVehicle.licensePlates
      : "";
    this.showVehicleList = false;
  }

  loadTollRoute(): void {
    const params = new HttpParams()
      .set("branchid", this.userLoged.branchId)
      .set("supplierid", this.supplierId.toString());
    this.busy = this.tollRouteService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listTollRoute = res.data;
        } else {
          if (res.code == "204") {
            this.listTollRoute = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  isFileSelected = false;
  fileSelected: File;
  data: AOA = [[], []];
  data1: AOA = [[], []];
  wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "array" };

  onChange(event: any) {
    this.isFileSelected = false;
    if (event) {
      this.isFileSelected = true;
      this.fileSelected = event.target.files[0];
      /* wire up file reader */
      const target: DataTransfer = <DataTransfer>event.target;
      if (target.files.length !== 1)
        throw new Error("Cannot use multiple files");
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: "binary" });
        //Đoạn này lấy dữ liệu chi tiết
        const wsname1: string = wb.SheetNames[0];
        const ws1: XLSX.WorkSheet = wb.Sheets[wsname1];
        this.data1 = <AOA>(
          XLSX.utils.sheet_to_json(ws1, { header: 1, raw: false })
        );
        for (var i = 2; i < this.data1.length; i++) {
          let v1 = this.data1[i];
          if (v1) {
            let item: DispatchOrderEtc = {
              refNo: this.entity.refNo,
              tollStationId: v1[0] != null ? Number.parseInt(v1[0]) : 0,
              feeId: 659,
              cost: v1[3] != null ? Number.parseInt(v1[3]) : 0,
              vat: v1[4] != null ? Number.parseInt(v1[4]) : 0,
              totalCost: v1[5] != null ? Number.parseInt(v1[5]) : 0,
              note: v1[6],
            };
            if (item.tollStationId != null) {
              this.entity.listEtc.push(item);
              this.totalEtc += item.totalCost;
            }
          }
        }
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  loadEmployee(): void {
    const params = new HttpParams()
      // .set('usergroupid')
      .set("branchId", this.userLoged.branchId.toString());
    this.busy = this.employeeService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listEmployee = res.data;
          this.listDriver = this.listEmployee.filter(
            (x) => x.departmentId == 1147
          );
        } else {
          if (res.code == "204") {
            this.listEmployee = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  loadQuotationDetailed() {
    if (!this.flagManualChange) return;
    debugger;
    if (
      this.supplierId > 0 &&
      this.vihicleTypeId > 0 &&
      this.entity.subcontractorsQuoteRouteCode?.length > 0
    ) {
      const params = new HttpParams()
        .set("supplierid", this.supplierId.toString())
        .set("tollroutecode", this.entity.subcontractorsQuoteRouteCode)
        .set("vihicletypeid", this.vihicleTypeId.toString());
      this.busy = this.quotationsubService
        .getQuotation(params)
        .subscribe((res: ResponseValue<Quotationsubcontractorsdetailed>) => {
          debugger;
          if (res.code == "200" || res.code == "201") {
            this.quotationDetailed = res.data;
            this.entity.subcontractorsPurchaseCost =
              this.quotationDetailed.price;
            this.entity.subcontractorsPurchaseVat = this.quotationDetailed.vat;
          } else {
            if (res.code == "204") {
              this.notificationService.printErrorMessage(
                "Không tìm thấy báo giá tương ứng!"
              );
              this.entity.subcontractorsQuoteRouteCode = null;
              this.tollRouteCode = null;
              this.entity.subcontractorsPurchaseCost = 0;
              this.entity.subcontractorsPurchaseVat = 0;
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
              );
            }
          }
        });
    }
  }
  loadListVihicles(): void {
    const params = new HttpParams()
      .set("branchid", this.userLoged.branchId.toString())
      .set("vihicletype", "16");
    this.busy = this.vihicleService
      .getAll(params)
      .subscribe((res: ResponseValue<Vihicle[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listVihicle = res.data;
        } else {
          if (res.code == "204") {
            this.listVihicle = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  viewModal = false;
  @ViewChild(ModalListShippingTaskComponent, { static: false })
  modalList: ModalListShippingTaskComponent;

  // loadAttackFiles() {
  //   let p: DispatchOrderAttachfiles = {
  //     refNo: this.entity.refNo,
  //     isPod: false
  //   }
  //   this.dispatchOrderService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
  //     if (res.code == '200' || res.code == '201'|| res.code == '204') {
  //       this.listAttachFile = res.data;
  //     }
  //     else {
  //       this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
  //     }
  //   });
  // }

  clickLink(item: DispatchOrderAttachfiles) {
    let url = environment.apiUrl + item.pathFile.replace("~", "");
    window.open(url, "_blank");
  }

  vihicleTypeChargeChanged(event: OtherCategories) {
    this.entity.vehicleTypeCharge = event?.id;
  }

  changeVihicle(event: Vihicle) {
    this.entity.vehiclelLicensePlates = event?.licensePlates;
    this.loadVehicle(event?.id);
    this.entity.driverId = event?.employeeId;
    let driver = this.listEmployee.find((it) => it.id == event?.employeeId);
    this.entity.driverName = driver?.employeeFullName;
    this.entity.driverTel = driver?.telephone;
    this.updateOilQuota();
    if (this.userLoged.branchId.toString() != "5")
      this.entity.fuelDriverId = event?.employeeId;
  }

  changeSupplierVihicle(event: SupplierVehicles) {
    this.entity.vehiclelLicensePlates = event?.licensePlates;
  }

  changeMooc(event: Vihicle) {
    this.entity.moocLicensePlates = event?.licensePlates;
  }

  kmDieuchinh: number = 0;
  noLoadingkmDieuchinh: number = 0;

  add(listItem: ShippingTask[]) {
    this.gasManagementService
      .getOldValue(this.userLoged.branchId)
      .subscribe((res: ResponseValue<GasManagement>) => {
        if (res.code == "200" || res.code == "201") {
          this.gasValue = res.data;
          this.entity = {
            checked: false,
            branchId: Number.parseInt(this.userLoged.branchId),
            status: 0,
            oilPrice: this.gasValue.cost,
            startVehicleOdor: 0,
            startEupOdor: 0,
            finishVehicleOdor: 0,
            finishEupOdor: 0,
            weight: 0,
            volume: 0,
            listFee: [],
            chang1KmLuotDi: 0,
            chang2KmLuotDi: 0,
            chang1KmLuotVe: 0,
            chang2KmLuotVe: 0,
            dinhmucDauLuotDi: 0,
            dinhmucDauLuotVe: 0,
            luotdiQuabai: false,
            luotveQuabai: false,
            listEtc: [],
            dieuchinhKmLuotDi: 0,
            dieuchinhKmLuotVe: 0,
            tongdauLuotDi: 0,
            tongdauLuotVe: 0,
            tongdau: 0,
            oilCompensation: 0,
            kmTrungchuyenCang: 0,
            dinhmucDauTrungchuyenCang: 0,
            kmTrungchuyenCangVe: 0,
            dinhmucDauTrungchuyenCangVe: 0,
            tongdauTrungchuyenCang: 0,
            tongdauTrungchuyenCangVe: 0,
            kmTrungchuyenNhamay: 0,
            dinhmucDauTrungchuyenNhamay: 0,
            shortWay: false,
            // shippingTaskId:item.id,isExport:item.shipmentType==1174,
            shippingTaskItem: {},
            listDetailed: [],
          };
          this.orderType = 0;
          listItem.forEach((item) => {
            let detaileds: DispatchOrderFclDetail = {
              shippingTaskId: item.id,
              shippingTaskItem: item,
            };
            this.entity.listDetailed.push(detaileds);
          });
          const checksToDelete = listItem.map((item) => item.customerId);
          this.loadLocations(checksToDelete.join(","));
          this.loadRoutes(checksToDelete.join(","));
          this.flagNew = true;
          this.flagXem = false;
          this.flagSave = false;
          this.isExport = listItem[0].shipmentType == 1174;
          this.modalDispatchOrderFcl.show();
        } else {
          if (res.code == "204") {
            this.notificationService.printErrorMessage(
              MessageContstants.FUEL_REQUIED_ERROR
            );
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.SYSTEM_ERROR_MSG
            );
          }
        }
      });
  }
  totalOil: number = 0;
  calulateOil() {
    // Calculate total fuel for round-trip operations
    this.entity.tongdauLuotDi = this._utilityService.round2(
      (((Number(this.entity.chang1KmLuotDi) || 0) +
        (Number(this.entity.chang2KmLuotDi) || 0) +
        (Number(this.entity.dieuchinhKmLuotDi) || 0)) /
        100) *
      (Number(this.entity.dinhmucDauLuotDi) || 0)
    );

    this.entity.tongdauLuotVe = this._utilityService.round2(
      (((Number(this.entity.chang1KmLuotVe) || 0) +
        (Number(this.entity.chang2KmLuotVe) || 0) +
        (Number(this.entity.dieuchinhKmLuotVe) || 0)) /
        100) *
      (Number(this.entity.dinhmucDauLuotVe) || 0)
    );


    // Calculate total fuel for transportation between port and destination

    this.entity.tongdauTrungchuyenCang = this._utilityService.round2(
      (((Number(this.entity.kmTrungchuyenCang) || 0) + (Number(this.entity.dieuchinhKmTrungchuyenCang) || 0)) / 100) *
      (Number(this.entity.dinhmucDauTrungchuyenCang) || 0)
    );

    this.entity.tongdauTrungchuyenCangVe = this._utilityService.round2(
      (((Number(this.entity.kmTrungchuyenCangVe) || 0) + (Number(this.entity.dieuchinhKmTrungchuyenCangVe) || 0)) / 100) *
      (Number(this.entity.dinhmucDauTrungchuyenCangVe) || 0)
    );

    this.entity.tongdauTrungchuyenNhamay = this._utilityService.round2(
      ((Number(this.entity.kmTrungchuyenNhamay) || 0) / 100) *
      (Number(this.entity.dinhmucDauTrungchuyenNhamay) || 0)
    );

    this.entity.tongdauTrungchuyenNhamayVe = this._utilityService.round2(
      ((Number(this.entity.kmTrungchuyenNhamayVe) || 0) / 100) *
      (Number(this.entity.dinhmucDauTrungchuyenNhamayVe) || 0)
    );
    let budau = (Number(this.entity.oilCompensation) || 0)
    // Calculate total fuel for all operations
    this.entity.tongdau =
      (this.entity.tongdauLuotDi ?? 0) +
      (this.entity.tongdauLuotVe ?? 0) +
      (this.entity.tongdauTrungchuyenCang ?? 0) +
      (this.entity.tongdauTrungchuyenCangVe ?? 0) +
      (this.entity.tongdauTrungchuyenNhamay ?? 0) +
      (this.entity.tongdauTrungchuyenNhamayVe ?? 0) + budau;
    this.entity.tongKm =
      (Number(this.entity.chang1KmLuotDi) || 0) +
      (Number(this.entity.dieuchinhKmTrungchuyenCang) || 0) +
      (Number(this.entity.dieuchinhKmTrungchuyenCangVe) || 0) +
      (Number(this.entity.chang2KmLuotDi) || 0) +
      (Number(this.entity.chang1KmLuotVe) || 0) +
      (Number(this.entity.chang2KmLuotVe) || 0) +
      (Number(this.entity.kmTrungchuyenCang) || 0) +
      (Number(this.entity.kmTrungchuyenCangVe) || 0) +
      (Number(this.entity.kmTrungchuyenNhamay) || 0) +
      (Number(this.entity.kmTrungchuyenNhamayVe) || 0);
  }

  // ===== Dầu MÁY PHÁT (2026-06-23) — bổ sung cho lệnh FCL CŨ (dùng song song FCL mới) =====
  // Dầu máy phát = số giờ × định mức (lít/giờ); chi phí = dầu × giá. Lưu qua SP riêng (cần có refNo).
  computeGenerator() {
    const hours = Number(this.entity.generatorRunningHours) || 0;
    const norm = Number(this.entity.generatorFuelNorm) || 0;
    const price = Number(this.entity.oilPrice) || 0;
    this.entity.generatorFuelAmount = this._utilityService.round2(hours * norm);
    this.entity.generatorFuelCost = Math.round((this.entity.generatorFuelAmount || 0) * price);
  }

  // Tổng dầu của lệnh = dầu định mức (tongdau) + dầu máy phát (chỉ hiển thị, KHÔNG lưu DB).
  get totalOrderOil(): number {
    return (Number(this.entity.tongdau) || 0) + (Number(this.entity.generatorFuelAmount) || 0);
  }

  saveGenerator() {
    if (!this.entity.refNo) {
      this.notificationService.printErrorMessage('Vui lòng lưu lệnh trước khi nhập dầu máy phát.');
      return;
    }
    this.computeGenerator();
    this.dispatchOrderService.updateGenerator(this.entity).subscribe((res: any) => {
      if (res.code == '200' || res.code == '201') {
        if (res.data) {
          this.entity.generatorFuelAmount = res.data.generatorFuelAmount;
          this.entity.generatorFuelCost = res.data.generatorFuelCost;
        }
        this.notificationService.printSuccessMessage('Đã lưu dầu máy phát.');
      } else {
        this.notificationService.printErrorMessage(res.message ?? 'Lưu dầu máy phát thất bại.');
      }
    });
  }

  edit(refNo: string, flag: boolean) {
    this.dispatchOrderService
      .getDetail(refNo)
      .subscribe((res: ResponseValue<DispatchOrderFcl>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          if (!this.entity.isSubcontractors) {
            this.loadListVihicles();
            const checksToDelete = this.entity.listDetailed.map(
              (item) => item.shippingTaskItem.customerId
            );
            this.orderType = this.entity.shortWay ? 1 : 0;
            this.loadLocations(checksToDelete.join(","));
            this.loadRoutes(checksToDelete.join(","));
            this.loadVehicle(this.entity.vehicleId);
            if (this.entity.cang1Id > 0 || this.entity.cang2Id > 0)
              this.cangExpanded = true;
            if (this.entity.nhamay1 > 0 || this.entity.nhamay2 > 0)
              this.nhaMayExpanded = true;
            if (this.entity.inquiryTimeToTheFactory) {
              this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
                new Date(
                  moment(
                    this.entity.inquiryTimeToTheFactory,
                    FormatContstants.DATETIMEEN
                  ).format(FormatContstants.DATETIMEEN)
                ),
                true
              );
              this.entity.inquiryTimeToTheFactory = moment(
                this.entity.inquiryTimeToTheFactory,
                FormatContstants.DATETIMEEN
              ).format(FormatContstants.DATETIMEVN);
            }
            if (this.entity.inquiryTimeToThePorts) {
              this.ngayhoanthanhOption =
                this._utilityService.dateTimeOptionDays(
                  new Date(
                    moment(
                      this.entity.inquiryTimeToThePorts,
                      FormatContstants.DATETIMEEN
                    ).format(FormatContstants.DATETIMEEN)
                  ),
                  true
                );
              this.entity.inquiryTimeToThePorts = moment(
                this.entity.inquiryTimeToThePorts,
                FormatContstants.DATETIMEEN
              ).format(FormatContstants.DATETIMEVN);
            }
          } else {
            this.supplierId = this.entity.shippingUnitId;
            this.vihicleTypeId = this.entity.vehicleType;
            this.loadSupplierInfo(this.entity.shippingUnitId);
            this.loadTollRoute();
          }
          this.flagXem = flag;
          this.flagSave = false;
          this.modalDispatchOrderFcl.show();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      //Kiểm tra nếu là lệnh thì phải có giá dầu
      if (!this.entity.isSubcontractors && this.entity.oilPrice < 1) {
        this.notificationService.printErrorMessage(
          MessageContstants.FUEL_REQUIED_ERROR
        );
        return;
      }
      //Kiểm tra xem nếu chọn lượng hàng trung chuyển cảng, và nhà máy thì phải có thông tin cảng và nhà máy
      const trungChuyenChecks = [
        {
          luongHang: this.entity.luonghangTrungchuyenCang,
          id1: this.entity.cang1Id,
          id2: this.entity.cang2Id,
          km: this.entity.kmTrungchuyenCang,
        },
        {
          luongHang: this.entity.luonghangTrungchuyenNhamay,
          id1: this.entity.nhamay1,
          id2: this.entity.nhamay2,
          km: this.entity.kmTrungchuyenNhamay,
        },
        {
          luongHang: this.entity.luonghangTrungchuyenCangVe,
          km: this.entity.kmTrungchuyenCangVe,
          id1: this.entity.cang1IdVe,
          id2: this.entity.cang2IdVe,
        },
        {
          luongHang: this.entity.luonghangTrungchuyenNhamayVe,
          km: this.entity.kmTrungchuyenNhamayVe,
          id1: this.entity.nhamay1Ve,
          id2: this.entity.nhamay2Ve,
        },
      ];
      const invalidCheck = trungChuyenChecks.find(
        ({ luongHang, km, id1, id2 }) => {
          luongHang !== undefined &&
            luongHang > 0 &&
            (!km || km < 0 || !id1 || !id2);
        }
      );
      if (invalidCheck) {
        this.notificationService.printErrorMessage(
          MessageContstants.PORT_REQUIRED_ERROR
        );
        return;
      }
      if (Number(this.entity.oilCompensation) > 0) {
        if (this.entity.reasonOilCompensation != null && this.entity.reasonOilCompensation?.length < 1) {
          this.notificationService.printErrorMessage(
            "Vui lòng nhập lý do bù dầu!"
          );
          return;
        }
      }

      this.entity.shortWay = this.orderType == 1;
      this.flagSave = true;
      if (this.flagNew) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.dispatchOrderService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalDispatchOrderFcl.hide();
              form.resetForm();
              this.notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
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
        //Kiểm tra xem phụ phí có không, nếu có thì phải có mã phụ phí và tiền

        this.dispatchOrderService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalDispatchOrderFcl.hide();
              form.resetForm();
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
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

  selectedNgaybatdau(event) {
    this.entity.inquiryTimeToTheFactory = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedNgaybatdau(event) {
    if (this.entity.inquiryTimeToTheFactory == null)
      this.entity.inquiryTimeToTheFactory = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }
  selectedNgayhoanthanh(event) {
    this.entity.inquiryTimeToThePorts = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedNgayhoanthanh(event) {
    if (this.entity.inquiryTimeToThePorts == null)
      this.entity.inquiryTimeToThePorts = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }
  loadSupplierInfo(id: number) {
    this.busy = this.suppliertSerive
      .getById(id)
      .subscribe((res: ResponseValue<Supplier>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          //Lấy thông tin của nhà cung cấp để có danh mục xe, lái xe
          this.selectedSupplier = res.data;
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
    this.loadTollRoute();
    this.loadQuotationDetailed();
  }
  changeSupplier(event: Supplier) {
    this.entity.driverId = null;
    this.entity.vehicleId = null;
    this.supplierId = event?.id;
    this.loadSupplierInfo(this.supplierId);
  }
  changeTollRouteCode(event: Tollroute) {
    this.flagManualChange = true;
    this.entity.subcontractorsQuoteRouteCode = event?.tollRouteCode;
    this.loadQuotationDetailed();
  }
  viewRoutes = false;

  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "FCL",
      functionName: "FCL",
      refNo: this.entity.refNo,
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }
  newTicket() {
    this.viewTicket = true;
    setTimeout(() => {
      this.modalTicket.add();
    }, 50);
  }

  updateTicket(item: DispatchOrderTicket, index: number) {
    let nItem: DispatchOrderTicket = {
      index: index,
      cost: item.cost,
      flagNew: false,
      vat: item.vat,
      patternNumber: item.patternNumber,
      note: item.note,
      symbol: item.symbol,
      number: item.number,
      refNo: item.refNo,
      tollStationId: item.tollStationId,
      tollStationName: item.tollStationName,
      feeId: item.feeId,
    };
    this.viewTicket = true;
    setTimeout(() => {
      this.modalTicket.edit(nItem);
    }, 50);
  }
  newEtc() {
    let item: DispatchOrderEtc = {
      cost: 0,
      vat: 0,
      feeId: environment.tollFeeId,
    };
    this.entity.listEtc.push(item);
  }

  deleteEtc(index: number) {
    this.entity.listEtc.splice(index, 1);
  }

  onFileChanged(event) {
    // if (event.target.files.length > 0) {
    //   let p: DispatchOrderAttachfiles = {
    //     refNo: this.entity.refNo,
    //     isPod: true
    //   }
    //   const file = event.target.files[0];
    //   this.busy = this.dispatchOrderService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
    //     if (res.code == '200' || res.code == '201') {
    //       this.listPod = res.data;
    //     } else {
    //       this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
    //     }
    //   });
    // }
  }
  deleteAttachFile(item: DispatchOrderAttachfiles) {
    // this.busy = this.dispatchOrderService.deleteAttachFile(item).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
    //   if (res.code == '200' || res.code == '201') {
    //     this.loadAttackFiles();
    //   } else {
    //     this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
    //   }
    // });
  }
  onAttachFileChanged(event) {
    // if (event.target.files.length > 0) {
    //   let p: DispatchOrderAttachfiles = {
    //     refNo: this.entity.refNo,
    //     isPod: false
    //   }
    //   const file = event.target.files[0];
    //   this.busy = this.dispatchOrderService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
    //     if (res.code == '200' || res.code == '201') {
    //       this.listAttachFile = res.data;
    //     } else {
    //       this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
    //     }
    //   });
    // }
  }

  updateTotalCost(item: any) {
    // Kiểm tra giá trị nhập vào để tránh lỗi NaN
    const cost = item.cost ? parseFloat(item.cost) : 0;
    const vat = item.vat ? parseFloat(item.vat) : 0;

    // Tính tổng tiền = cost + vat
    item.totalCost = cost + vat;
  }

  vihicleTypeChanged(event: OtherCategories) {
    this.vihicleTypeId = event?.id;
    if (this.entity.isSubcontractors) {
      this.loadQuotationDetailed();
    }
  }
  changedSurcharge(item: DispatchOrderSurcharge, event: OtherCategories) {
    item.surchargeName = event?.categoryName;
  }
  updateState(type: number) {
    var item = Object.assign({}, this.entity);
    item.status = type;

    this.busy = this.dispatchOrderService
      .updateState(item, false, 0)
      .subscribe((res: ResponseValue<DispatchOrderFcl>) => {
        if (res.code == "200" || res.code == "201") {
          this.notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
          this.SaveSuccess.emit(res.data);
          this.modalDispatchOrderFcl.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }

  updateEtcFee() {
    var item = Object.assign({}, this.entity);
    this.busy = this.dispatchOrderService
      .updateEtcFee(item)
      .subscribe((res: ResponseValue<Dispatchorder>) => {
        if (res.code == "200" || res.code == "201") {
          this.notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }
  duyetB1() {
    var item = Object.assign({}, this.entity);
    this.notificationService.printConfirmationYesNo(
      "Chốt duyệt B1 lệnh vận chuyển hay không?",
      () => {
        //Trước khi duyệt B1 sẽ cập nhật toàn bộ thông tin có trên lệnh đã điều chỉnh
        this.dispatchOrderService.update(item).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.updateState(3);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => { }
        );
      },
      () => { }
    );
  }
  duyetB2() {
    this.notificationService.printConfirmationYesNo(
      "Duyệt B2 lệnh vận chuyển hay không?",
      () => {
        this.updateState(4);
      },
      () => { }
    );
  }
  tuchoiB1() {
    let copy = Object.assign({}, this.entity);
    let _ok = false;
    let retVal = prompt("Lý do từ chối duyệt B2", "");
    if (retVal && retVal.length > 0) {
      _ok = true;
    }
    copy.feedback = retVal ?? "";
    if (_ok) {
      //Chuyển trạng thái lệnh về là đã nhận lệnh để điều vận điều chỉnh lại thông tin
      copy.status = 2;
      this.dispatchOrderService.updateState(copy, true, 0).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.notificationService.printSuccessMessage(
              MessageContstants.UPDATED_OK_MSG
            );
            this.SaveSuccess.emit(res.data);
            this.modalDispatchOrderFcl.hide();
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
  tuchoiChot() {
    let copy = Object.assign({}, this.entity);
    let _ok = false;
    let retVal = prompt("Lý do từ chối chốt lệnh", "");
    if (retVal && retVal.length > 0) {
      _ok = true;
    }
    copy.feedback = retVal ?? "";
    if (_ok) {
      //Chuyển trạng thái lệnh về là đã nhận lệnh để điều vận điều chỉnh lại thông tin
      copy.status = 3;
      this.dispatchOrderService.updateState(copy, true, 0).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.notificationService.printSuccessMessage(
              MessageContstants.UPDATED_OK_MSG
            );
            this.SaveSuccess.emit(res.data);
            this.modalDispatchOrderFcl.hide();
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
  chotlenh() {
    this.notificationService.printConfirmationYesNo(
      "Chốt lệnh vận chuyển FCL này hay không?",
      () => {
        this.updateState(6);
      },
      () => { }
    );
  }

  newFee() {
    let item: DispatchOrderFee = {
      cost: 0,
      vat: 0,
      totalCost: 0,
      quantity: 1,
    };
    this.entity.listFee.push(item);
  }
  clickRowEtc(item: DispatchOrderEtc) {
    item.isPassed = !item.isPassed;
  }

  changeCost(item: DispatchOrderFee) {
    item.totalCost = item.cost! + item.vat!;
  }
  changeQuantity(item: DispatchOrderFee) {
    //Kiểm tra xem loại phí có phải chi phí đổ dầu hay không, nếu đúng thì ghi nhận thêm dầu vào tổng dầu
    item.totalCost = item.cost! * item.quantity!;
  }

  deleteFee(item: DispatchOrderFee) {
    let index = this.entity.listFee.indexOf(item);
    if (index !== -1) {
      this.entity.listFee.splice(index, 1);
    }
  }
  //Đoạn code này thêm mới các locations, nhóm cảng cho lệnh

  luonghangLuotdiChanged(event: VehicleOilQuota) {
    this.entity.luonghangIdLuotDi = event?.id;
    this.entity.dinhmucDauLuotDi =
      this.orderType == 0 ? event?.value : event?.shortWayValue;
    this.calulateOil();
  }

  luonghangLuotveChanged(event: VehicleOilQuota) {
    this.entity.luonghangIdLuotVe = event?.id;
    this.entity.dinhmucDauLuotVe =
      this.orderType == 0 ? event?.value : event?.shortWayValue;
    this.calulateOil();
  }
  luonghangTrungchuyenCangChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenCang = event?.id;
    this.entity.dinhmucDauTrungchuyenCang =
      this.orderType == 0 ? event?.value : event?.shortWayValue;
    this.calulateOil();
  }
  luonghangTrungchuyenCangVeChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenCangVe = event?.id;
    this.entity.dinhmucDauTrungchuyenCangVe =
      this.orderType == 0 ? event?.value : event?.shortWayValue;

    this.calulateOil();
  }
  luonghangTrungchuyenNhamayChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenNhamay = event?.id;
    this.entity.dinhmucDauTrungchuyenNhamay =
      this.orderType == 0 ? event?.value : event?.shortWayValue;
    this.calulateOil();
  }
  luonghangTrungchuyenNhamayVeChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenNhamayVe = event?.id;
    this.entity.dinhmucDauTrungchuyenNhamayVe =
      this.orderType == 0 ? event?.value : event?.shortWayValue;
    this.calulateOil();
  }

  chang1DiXuatChanged(event: CustomerLocations) {
    this.entity.chang1IdLuotDi = event?.id;
    this.entity.chang1KmLuotDi = event?.distanceToWB;
    if (this.branchId == '5') this.kmluotveSG();
    this.calulateOil();
  }
  chang1DiNhapChanged(event: Ports) {
    this.entity.chang1IdLuotDi = event?.id;
    this.entity.chang1KmLuotDi = event?.km;
    if (this.branchId == '5') this.kmluotdiSG();
    this.calulateOil();
  }
  kmluotdiSG() {
    if (this.entity.chang1IdLuotDi > 0 && this.entity.chang2IdLuotDi > 0) {
      let item = this.listCustomerRoutes.find(x =>
        +x.locationsId === +this.entity.chang2IdLuotDi &&
        +x.portsId === +this.entity.chang1IdLuotDi
      );
      if (item) {
        this.entity.chang2KmLuotDi = this.entity.luotdiQuabai
          ? item.distanceThrough
          : item.distance;
      }

      console.log('Tìm thấy item:', item); // kiểm tra kết quả
      debugger;
    }

  }
  luotdiQuabaiChanged() {
    if (this.entity.chang1IdLuotDi > 0 && this.entity.chang2IdLuotDi > 0) {
      this.kmluotdiSG();
      this.calulateOil();
    }
  }
  luotveQuabaiChanged() {
    if (this.entity.chang1IdLuotVe > 0 && this.entity.chang2IdLuotVe > 0) {
      this.kmluotveSG();
      this.calulateOil();
    }
  }
  kmluotveSG() {
    if (this.entity.chang1IdLuotDi > 0 && this.entity.chang2IdLuotDi > 0) {
      let item = this.listCustomerRoutes.find(x =>
        +x.locationsId === +this.entity.chang2IdLuotVe &&
        +x.portsId === +this.entity.chang1IdLuotVe
      );

      if (item) {
        this.entity.chang2KmLuotVe = this.entity.luotveQuabai
          ? item.distanceThrough
          : item.distance;
      }
      console.log('Tìm thấy item lượt về:', item);
      debugger;
    }

  }
  chang2DiXuatChanged(event: Ports) {
    this.entity.chang2IdLuotDi = event?.id;
    this.entity.chang2KmLuotDi = event?.km;
    this.calulateOil();
  }
  chang2DiNhapChanged(event: CustomerLocations) {
    this.entity.chang2IdLuotDi = event?.id;
    this.entity.chang2KmLuotDi = event?.distanceToWB;
    if (this.branchId == '5') this.kmluotdiSG();
    this.calulateOil();
  }

  chang1VeXuatChanged(event: Ports) {
    this.entity.chang1IdLuotVe = event?.id;
    this.entity.chang1KmLuotVe = event?.km;
    this.calulateOil();
  }
  chang1VeNhapChanged(event: CustomerLocations) {
    this.entity.chang1IdLuotVe = event?.id;
    this.entity.chang1KmLuotVe = event?.distanceToWB;
    this.calulateOil();
  }
  kmcang1 = 0;
  kmcang2 = 0;
  kmcang1Ve = 0;
  kmcang2Ve = 0;
  trungchuyenCangSG() {
    if (this.entity.cang1Id > 0 && this.entity.cang2Id > 0) {
      let item = this.listTransitPorts.find(x =>
        (+x.fromPortsId === +this.entity.cang2Id && +x.toPortsId === +this.entity.cang1Id) ||
        (+x.fromPortsId === +this.entity.cang1Id && +x.toPortsId === +this.entity.cang2Id)
      );

      if (item) {
        this.entity.kmTrungchuyenCang = item.km;
      }
      console.log('Tìm thấy item trung chuyển cảng lượt về:', item);
    }

    this.calulateOil();
  }
  trungchuyenCangveSG() {
    if (this.entity.cang1IdVe > 0 && this.entity.cang2IdVe > 0) {
      let item = this.listTransitPorts.find(x =>
        (+x.fromPortsId === +this.entity.cang2IdVe && +x.toPortsId === +this.entity.cang1IdVe) ||
        (+x.fromPortsId === +this.entity.cang1IdVe && +x.toPortsId === +this.entity.cang2IdVe)
      );

      if (item) {
        this.entity.kmTrungchuyenCangVe = item.km;
      }
      console.log('Tìm thấy item trung chuyển cảng lượt về:', item);
    }
    this.calulateOil();
  }
  trungChuyenChanged1(event: Ports) {
    this.kmcang1 = event?.km;
    this.entity.kmTrungchuyenCang = Math.abs(this.kmcang1 - this.kmcang2);
    if (this.branchId == '5') this.trungchuyenCangSG();
    this.calulateOil();
  }
  trungChuyenChanged2(event: Ports) {
    this.kmcang2 = event?.km;
    this.entity.kmTrungchuyenCang = Math.abs(this.kmcang1 - this.kmcang2);
    if (this.branchId == '5') this.trungchuyenCangSG();
    this.calulateOil();
  }
  trungChuyenVeChanged1(event: Ports) {
    this.kmcang1Ve = event?.km;
    this.entity.kmTrungchuyenCangVe = Math.abs(this.kmcang1Ve - this.kmcang2Ve);
    if (this.branchId == '5') this.trungchuyenCangveSG();
    this.calulateOil();
  }
  trungChuyenVeChanged2(event: Ports) {
    this.kmcang2Ve = event?.km;
    this.entity.kmTrungchuyenCangVe = Math.abs(this.kmcang1Ve - this.kmcang2Ve);
    if (this.branchId == '5') this.trungchuyenCangveSG();
    this.calulateOil();
  }
  chang2VeXuatChanged(event: CustomerLocations) {
    this.entity.chang2IdLuotVe = event?.id;
    this.entity.chang2KmLuotVe = event?.distanceToWB;
    if (this.branchId == '5') this.kmluotveSG();
    this.calulateOil();
  }
  chang2VeNhapChanged(event: Ports) {
    this.entity.chang2IdLuotVe = event?.id;
    this.entity.chang2KmLuotVe = event?.km;
    if (this.branchId == '5') this.kmluotveSG();
    this.calulateOil();
  }

  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }

  closeModalAttachDriverFiles(): void {
    this.viewAttackDriver = false;
  }
  closeModalTicket() {
    this.viewTicket = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
  closeModal() {
    this.viewModal = false;
  }
  closeModalShippingTask() {
    this.viewModalShippingTask = false;
  }

  saveSuccess(event: ShippingTask[]) {
    if (event?.length > 0) {
      event.forEach((item) => {
        if (this.entity.listDetailed.some((x) => x.shippingTaskId == item.id)) {
          return;
        } else {
          let value: DispatchOrderFclDetail = {
            refNo: this.entity.refNo,
            shippingTaskId: item.id,
            shippingTaskItem: item,
          };
          this.entity.listDetailed.push(value);
        }
      });
    }
  }
}
