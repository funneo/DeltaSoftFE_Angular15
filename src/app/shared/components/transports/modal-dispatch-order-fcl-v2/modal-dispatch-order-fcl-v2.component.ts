import { HttpClient, HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
// ===== TO refactor (2026-05-15): route builder imports =====
import {
  TransportOrderSegment, SegmentStation, UnifiedLocation, RouteSegmentDefault,
  TransportOrderExtraSegment, TransportOrderTotalsResult
} from "@app/shared/models/transports/dispatchorders/transport-order.model";
import { TransportOrderService } from "@app/shared/services/transports/transport-order.service";
import { ModalVietmapRoutesComponent } from "../../danhmuc/modal-vietmap-routes/modal-vietmap-routes.component";
import { ModalMapRoutesComponent } from "../../danhmuc/modal-map-routes/modal-map-routes.component";
import { ModalRouteCompareComponent, CompareRouteResult } from "../../danhmuc/modal-route-compare/modal-route-compare.component";
import { ModalAddExtraSegmentComponent, ExtraSegmentSavedResult } from "../modal-add-extra-segment/modal-add-extra-segment.component";
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

// ===== TO refactor (2026-05-15): LocationItem (copy từ modal-transport-order) =====
export interface LocationItem {
  locationId: number;
  locationType?: number; // 1=CustomerLocation, 2=Port
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  type: 'pickup' | 'delivery';
  taskId?: number;
  customerName?: string;
}

@Component({
  selector: "modal-dispatch-order-fcl-v2",
  templateUrl: "./modal-dispatch-order-fcl-v2.component.html",
  styleUrls: ["./modal-dispatch-order-fcl-v2.component.scss"],
})
export class ModalDispatchOrderFclV2Component implements OnInit, OnDestroy {
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
  // Tổng tiền trạm phí (ETC) = tổng totalCost các dòng listEtc (auto + nhập tay)
  get totalEtc(): number {
    return (this.entity?.listEtc || []).reduce((s, e) => s + (+e.totalCost || 0), 0);
  }
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

  // ===== TO refactor (2026-05-15): route builder state + ViewChild =====
  locations: LocationItem[] = [];
  // Cung đường vận tải (main): khóa NGAY khi khởi tạo lệnh xong (có refNo) → muốn
  // chỉnh route → dùng "Cung đường phát sinh".
  // status: 0 = mới, 1 = gửi lệnh, 2 = nhận lệnh, 3 = duyệt B1, 4 = duyệt B2, 5 = chốt
  get routeConfirmed(): boolean {
    return !!this.entity?.refNo || this.flagXem;
  }
  showPoolPanel = true;
  lastSegmentFinal = false;
  showAddCustomPoint = false;
  selectedCustomLocation: UnifiedLocation | null = null;
  listAllLocations: UnifiedLocation[] = [];
  locFilter = { address: '', type: '' };
  locSortCol: 'address' | 'locationType' = 'address';
  locSortDir: 'asc' | 'desc' = 'asc';
  private _currentMapSegmentIndex: number | null = null;
  isCalculating = false;
  segmentCalculating: boolean[] = [];
  private _vehicleBotTypeId: number | null = null;
  totalEtcCost = 0;

  // ===== Cung đường phát sinh (2026-05-19) =====
  // Sau khi tạo lệnh xong (có refNo + ToId), section "Cung đường phát sinh" hiện
  // dưới bảng "Thông tin cung đường". Mỗi action (add/update/delete) auto-save → BE
  // recompute totals → trả về FE cập nhật display.
  extraSegments: TransportOrderExtraSegment[] = [];
  private _extraDebounce: { [id: number]: any } = {};
  // Context cho route modals (của các CHẶNG ĐÃ CÓ — recalc/xem map). Việc THÊM mới
  // cung đường phát sinh đã tách sang modal-add-extra-segment riêng.
  // 'segment' = chặng chính | 'extra-view' = chỉ xem map của extra đã có | 'extra-existing' = recalc extra
  private _routeContext: 'segment' | 'extra-view' | 'extra-existing' = 'segment';
  private _extraExistingId: number | null = null;

  get showExtraSegmentsSection(): boolean {
    // Hiện luôn trong modal V2 (V2 = lệnh mới, không phải legacy). Trước khi save thì
    // hiện trạng thái disabled + hint "Lưu lệnh trước"; sau khi save hiện full controls.
    return this.entity?.isLegacy !== true;
  }
  get canAddExtraSegment(): boolean {
    return !!this.entity?.refNo && !!this.entity?.toId
      && (this.entity?.status ?? 0) < 3 && !this.flagXem;
  }
  extraSegmentLabel(seg: TransportOrderExtraSegment, index: number): string {
    if (this.extraSegments.length === 1) return 'Chặng đầu';
    if (index === 0) return 'Chặng đầu';
    if (index === this.extraSegments.length - 1) return 'Chặng cuối';
    return `Chặng ${index + 1}`;
  }
  // Hint chính xác theo state — cover hết case mutually exclusive
  get extraEmptyHint(): string {
    if (!this.entity?.refNo)
      return 'Cần lưu lệnh trước (chọn "Chặng cuối" ở cung đường vận tải) — sau khi có RefNo bạn mới thêm được cung đường phát sinh.';
    if (this.flagXem)
      return 'Chế độ xem — không thể thêm cung đường phát sinh.';
    if ((this.entity?.status ?? 0) >= 3)
      return 'Lệnh đã chốt B1 — không thể thêm cung đường phát sinh.';
    if (!this.entity?.toId)
      return 'Không lấy được ToId — BE chưa restart sau update? Đóng modal và mở lại.';
    return 'Chưa có cung đường phát sinh. Bấm "Thêm cung đường phát sinh" để bổ sung.';
  }

  get locationPool(): LocationItem[] {
    const pool: LocationItem[] = [];
    (this.entity.listDetailed || []).forEach((d: any) => {
      const t = d.shippingTaskItem;
      if (!t) return;
      if (t.pickupLocationId) {
        pool.push({
          locationId: t.pickupLocationId,
          locationName: t.pickupLocation || '',
          lat: t.pickupLatitude,
          lng: t.pickupLongitude,
          type: 'pickup',
          taskId: t.id,
          customerName: t.customerName
        });
      }
      if (t.deliveryLocationId) {
        pool.push({
          locationId: t.deliveryLocationId,
          locationName: t.deliveryLocation || '',
          lat: t.deliveryLatitude,
          lng: t.deliveryLongitude,
          type: 'delivery',
          taskId: t.id,
          customerName: t.customerName
        });
      }
    });
    return pool;
  }

  get allTollStations(): SegmentStation[] {
    const stations: SegmentStation[] = [];
    (this.entity.segments || []).forEach(s => (s.listStations || []).forEach(e => stations.push(e)));
    return stations.filter(e => (e.price || 0) > 0);
  }

  get filteredLocations(): UnifiedLocation[] {
    let list = this.listAllLocations;
    const addr = this.locFilter.address.trim().toLowerCase();
    const type = this.locFilter.type.trim();
    if (addr) list = list.filter(l => l.address?.toLowerCase().includes(addr)
      || l.name?.toLowerCase().includes(addr));
    if (type) list = list.filter(l => l.locationType?.toString() === type);
    list = [...list].sort((a, b) => {
      const va = this.locSortCol === 'locationType' ? (a.locationType || 0) : (a.address || '');
      const vb = this.locSortCol === 'locationType' ? (b.locationType || 0) : (b.address || '');
      if (va < vb) return this.locSortDir === 'asc' ? -1 : 1;
      if (va > vb) return this.locSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }

  @ViewChild(ModalVietmapRoutesComponent, { static: false }) modalVietmap: ModalVietmapRoutesComponent;
  @ViewChild(ModalMapRoutesComponent, { static: false }) modalGoogle: ModalMapRoutesComponent;
  @ViewChild(ModalRouteCompareComponent, { static: false }) modalCompare: ModalRouteCompareComponent;
  @ViewChild(ModalAddExtraSegmentComponent, { static: false }) modalAddExtra: ModalAddExtraSegmentComponent;

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
    // ===== TO refactor (2026-05-15): route builder deps =====
    private _transportService: TransportOrderService,
    private _http: HttpClient,
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
    if (!id) {
      this.listOilQuota = [];
      this._vehicleBotTypeId = null;
      this._applyTollPrices();
      return;
    }
    this.vehicleService
      .getDetail(id)
      .subscribe((res: ResponseValue<Vihicle>) => {
        if (res.code == "200" || res.code == "201") {
          this.listOilQuota = res.data?.listOilQuota || [];
          this._vehicleBotTypeId = (res.data as any)?.vihicleTypeBotId ?? null;
        } else {
          this.listOilQuota = [];
          this._vehicleBotTypeId = null;
        }
        this._applyTollPrices();
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
            // TO refactor (2026-05-15): khởi tạo segments rỗng cho route builder
            segments: [],
            isLegacy: false,
          };
          // Reset route builder state cho lệnh mới
          this.locations = [];
          this.extraSegments = [];
          // routeConfirmed là getter → tự suy ra từ entity.status (status=0 mới → false)
          this.lastSegmentFinal = false;
          this.showPoolPanel = true;
          this.showAddCustomPoint = false;
          this.selectedCustomLocation = null;
          this._loadAllLocations();
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
  // ===== Dầu MÁY PHÁT (2026-06-17) — tách riêng với dầu định mức (tongdau) =====
  // Dầu máy phát = số giờ × định mức (lít/giờ); chi phí = dầu × giá. Lưu qua SP riêng (cần có refNo).
  computeGenerator() {
    const hours = Number(this.entity.generatorRunningHours) || 0;
    const norm = Number(this.entity.generatorFuelNorm) || 0;
    const price = Number(this.entity.oilPrice) || 0;
    this.entity.generatorFuelAmount = this._utilityService.round2(hours * norm);
    this.entity.generatorFuelCost = Math.round((this.entity.generatorFuelAmount || 0) * price);
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

  edit(refNo: string, flag: boolean) {
    this.dispatchOrderService
      .getDetailWithTo(refNo)
      .subscribe((res: ResponseValue<DispatchOrderFcl>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          // Lệnh đã lưu → cung đường đã hoàn chỉnh, chặng cuối luôn là "Chặng cuối"
          // (đặc biệt khi chỉ có 1 chặng: chặng đó CHÍNH LÀ chặng cuối, không phải "Chặng đầu")
          this.lastSegmentFinal = true;
          // Hydrate cung đường phát sinh: parse stationsJson/waypointsJson → mảng
          this.extraSegments = (this.entity.extraSegments || []).map(e => ({
            ...e,
            listStations: e.stationsJson ? this._safeJsonParse<SegmentStation[]>(e.stationsJson, []) : [],
            listWaypoints: e.waypointsJson ? this._safeJsonParse<any[]>(e.waypointsJson, []) : []
          }));
          if (!this.entity.isSubcontractors) {
            this.loadListVihicles();
            const checksToDelete = this.entity.listDetailed.map(
              (item) => item.shippingTaskItem.customerId
            );
            this.orderType = this.entity.shortWay ? 1 : 0;
            this.loadLocations(checksToDelete.join(","));
            this.loadRoutes(checksToDelete.join(","));
            this.loadVehicle(this.entity.vehicleId);
            // TO refactor: rebuild locations từ segments + load all locations pool
            this.locations = this._segmentsToLocations(this.entity.segments || []);
            this.calculateTotal();
            this._loadAllLocations();
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
      // FCL mới: cung đường vận tải bắt buộc tối thiểu 2 chặng (chặng đầu + chặng cuối).
      // Chỉ kiểm khi tạo mới (chưa có refNo) để không chặn việc sửa các lệnh cũ.
      if (!this.entity.isSubcontractors && !this.entity.refNo && (this.entity.segments?.length ?? 0) < 2) {
        this.notificationService.printErrorMessage(
          'Cung đường vận tải phải có tối thiểu 2 chặng (chặng đầu và chặng cuối). Vui lòng thêm điểm để có ít nhất 2 chặng trước khi lập lệnh.'
        );
        return;
      }
      // Điều kiện tiên quyết lập lệnh FCL: MỌI chặng (cung đường vận tải) phải chọn
      // lượng hàng (payloadWeight) VÀ lượng hàng đó phải có định mức dầu > 0.
      if (!this.entity.isSubcontractors && (this.entity.segments?.length ?? 0) > 0) {
        const idx = (this.entity.segments || []).findIndex(
          s => !s.payloadWeight || !s.fuelNorm || s.fuelNorm <= 0
        );
        if (idx >= 0) {
          const seg = this.entity.segments[idx];
          const label = idx === 0 ? 'Chặng đầu' : (idx === this.entity.segments.length - 1 ? 'Chặng cuối' : `Chặng ${idx + 1}`);
          const reason = !seg.payloadWeight
            ? 'chưa chọn lượng hàng'
            : 'lượng hàng chưa có định mức dầu (> 0) — kiểm tra lại định mức dầu của xe';
          this.notificationService.printErrorMessage(
            `${label} (${seg.startLocationName || ''} → ${seg.endLocationName || ''}): ${reason}. Vui lòng chọn lượng hàng có định mức dầu cho toàn bộ các chặng trước khi lập lệnh.`
          );
          return;
        }
      }
      // Kiểm tra trạm phí (ETC): có TÊN trạm mà thiếu/không hợp lệ số tiền (<1) → cảnh báo + chặn
      if (!this.entity.isSubcontractors) {
        const badEtc = (this.entity.listEtc || []).find(
          e => (e.tollStationName || '').trim() && (!e.cost || +e.cost < 1)
        );
        if (badEtc) {
          this.notificationService.printErrorMessage(
            `Trạm phí "${badEtc.tollStationName}" chưa có số tiền hợp lệ (≥ 1). Vui lòng nhập số tiền hoặc xóa trạm trước khi lập lệnh.`
          );
          return;
        }
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
        this.dispatchOrderService.createWithTo(this.entity).subscribe(
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

        this.dispatchOrderService.updateWithTo(this.entity).subscribe(
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
    if (!this.entity.listEtc) this.entity.listEtc = [];
    const item: DispatchOrderEtc = {
      feeId: environment.tollFeeId,
      tollStationName: '',
      cost: 0,
      vat: 0,
      totalCost: 0,
      isPassed: false,
      note: '',
      _auto: false,
    };
    this.entity.listEtc.push(item);
  }

  deleteEtc(index: number) {
    this.entity.listEtc.splice(index, 1);
  }

  // ===== Trạm phí auto từ Vietmap (2026-05-20) =====
  // Đồng bộ các dòng ETC auto của 1 chặng: xóa dòng auto cũ của chặng đó rồi thêm
  // từ seg.listStations (đã áp giá theo loại xe). Giữ nguyên dòng user nhập tay.
  private _syncEtcFromSegment(segIndex: number) {
    if (!this.entity) return;
    if (!this.entity.listEtc) this.entity.listEtc = [];
    // Bỏ dòng auto cũ của chặng này
    this.entity.listEtc = this.entity.listEtc.filter(e => !(e._auto && e._segIndex === segIndex));
    const seg = this.entity.segments?.[segIndex];
    (seg?.listStations || []).forEach(st => {
      if (st.isAvoided) return; // tránh trạm → không tính phí
      const cost = +(st.price || 0);
      this.entity.listEtc.push({
        feeId: environment.tollFeeId,
        tollStationName: st.stationName,
        cost: cost,
        vat: 0,
        totalCost: cost,
        isPassed: false,
        note: '',
        _auto: true,
        _segIndex: segIndex,
        _allPrices: st.allPrices,
        _vietmapId: st.vietmapId,
      });
    });
  }

  // Đổi loại xe → tính lại Cost các dòng ETC auto theo allPrices (giữ vat/note/trốn vé user đã sửa).
  private _recomputeAutoEtcPrices() {
    const vietmapKey = this._vehicleBotTypeId ? (this._botTypeMap[this._vehicleBotTypeId] ?? null) : null;
    (this.entity?.listEtc || []).forEach(e => {
      if (!e._auto || !e._allPrices) return;
      try {
        const prices = JSON.parse(e._allPrices);
        e.cost = vietmapKey ? (+prices[vietmapKey] || 0) : 0;
        e.totalCost = (+e.cost || 0) + (+e.vat || 0);
      } catch { /* giữ nguyên */ }
    });
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
        this.dispatchOrderService.updateWithTo(item).subscribe(
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

  /**
   * Defensive cleanup khi modal cha bị host destroy đột ngột (vd *ngIf về false
   * khi modal con Vietmap/Compare/AddExtra vẫn đang shown). ngx-bootstrap KHÔNG
   * kịp gỡ .modal-backdrop + body.modal-open → kẹt xuyên route → cả app bị
   * overlay vô hình chặn click ("đơ phải F5"). Đây là root cause #1 đã xác định.
   */
  ngOnDestroy(): void {
    try { this.modalDispatchOrderFcl?.hide?.(); } catch { /* swallow */ }
    setTimeout(() => {
      // Chỉ scrub khi KHÔNG còn modal nào đang shown thật → tránh phá modal khác
      if (typeof document !== 'undefined'
          && document.querySelectorAll('.modal.in, .modal.show').length === 0) {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
      }
    }, 250);
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

  // =====================================================================
  // TO refactor (2026-05-15): route builder methods
  //   Copy nguyên từ modal-transport-order.component.ts
  //   Bỏ các method liên quan save BE TO standalone (createAsync/updateAsync).
  //   Save FCL+TO atomic giờ qua createWithTo/updateWithTo (đã wire ở save method cũ).
  // =====================================================================

  isLocInRoute(locationId: number, taskId?: number, type?: 'pickup' | 'delivery'): boolean {
    return this.locations.some(l =>
      l.locationId === locationId && l.taskId === taskId && l.type === type
    );
  }

  addToRoute(task: ShippingTask, type: 'pickup' | 'delivery') {
    if (this.lastSegmentFinal) return;
    const locationId = type === 'pickup' ? task.pickupLocationId : task.deliveryLocationId;
    if (this.isLocInRoute(locationId, task.id, type)) return;
    this.locations.push({
      locationId,
      locationName: type === 'pickup' ? task.pickupLocation : task.deliveryLocation,
      lat: type === 'pickup' ? task.pickupLatitude : task.deliveryLatitude,
      lng: type === 'pickup' ? task.pickupLongitude : task.deliveryLongitude,
      type,
      taskId: task.id,
      customerName: task.customerName
    });
    this._rebuildSegments();
  }

  onDropLocation(event: CdkDragDrop<LocationItem[]>) {
    moveItemInArray(this.locations, event.previousIndex, event.currentIndex);
    this._rebuildSegments();
  }

  removeLocation(index: number) {
    this.locations.splice(index, 1);
    this.lastSegmentFinal = false;
    this._rebuildSegments();
  }

  getSegment(index: number): TransportOrderSegment | null {
    return this.entity.segments?.[index] || null;
  }

  isSegmentCalculating(index: number): boolean {
    return !!this.segmentCalculating[index];
  }

  getIndexClass(index: number, total: number): string {
    if (index === 0) return 'index-start';
    if (index === total - 1) return 'index-end';
    return 'index-mid';
  }

  onSegmentQuotaChange(segIndex: number, event: VehicleOilQuota) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    seg.payloadWeight = event?.id;
    seg.fuelNorm = this.entity.shortWay ? event?.shortWayValue : event?.value;
    seg.fuelAmountCalculated = +(((seg.fuelNorm || 0) * (seg.distanceKm || 0)) / 100).toFixed(2);
    this.calculateTotal();
    this.calulateOilSegments();
  }

  onLastSegmentFinalChange() {
    if (this.lastSegmentFinal) this.showAddCustomPoint = false;
  }

  removeStation(segIndex: number, stationIndex: number) {
    this.entity.segments[segIndex].listStations.splice(stationIndex, 1);
    this.calculateTotal();
  }

  sortLoc(col: 'address' | 'locationType') {
    if (this.locSortCol === col) {
      this.locSortDir = this.locSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.locSortCol = col;
      this.locSortDir = 'asc';
    }
  }

  hasGeoCoord(loc: UnifiedLocation): boolean {
    return !!(loc.latitude && loc.longtitude
      && Math.abs(loc.latitude) > 0.0001
      && Math.abs(loc.longtitude) > 0.0001);
  }

  selectLocation(loc: UnifiedLocation) {
    if (!this.hasGeoCoord(loc)) return;
    this.selectedCustomLocation = loc;
  }

  locationTypeName(type: number): string {
    return type === 2 ? 'Cảng/Bãi' : 'Nhà máy';
  }
  /** Nhãn điểm: cảng/bãi có tên → "Tên - Địa chỉ"; nhà máy (không tên) → "Địa chỉ". */
  locationLabel(loc: UnifiedLocation): string {
    const name = (loc?.name || '').trim();
    return name ? `${name} - ${loc.address || ''}` : (loc?.address || '');
  }

  toggleAddCustomPoint() {
    this.showAddCustomPoint = !this.showAddCustomPoint;
    if (!this.showAddCustomPoint) {
      this.selectedCustomLocation = null;
    } else {
      this.locFilter = { address: '', type: '' };
      this.locSortCol = 'address';
      this.locSortDir = 'asc';
    }
  }

  confirmAddCustomPoint() {
    if (this.lastSegmentFinal) return;
    if (!this.selectedCustomLocation) {
      this.notificationService.printErrorMessage('Vui lòng chọn điểm');
      return;
    }
    const loc = this.selectedCustomLocation;
    if (this.locations.some(l => l.locationId === loc.id && l.locationType === loc.locationType)) {
      this.notificationService.printErrorMessage('Điểm này đã có trong lộ trình');
      return;
    }
    this.locations.push({
      locationId: loc.id,
      locationType: loc.locationType,
      locationName: this.locationLabel(loc),
      lat: loc.latitude,
      lng: loc.longtitude,
      type: 'delivery'
    });
    this._rebuildSegments();
    this.selectedCustomLocation = null;
    this.showAddCustomPoint = false;
  }

  calculateTotal() {
    let totalKm = 0;
    let totalEtc = 0;
    (this.entity.segments || []).forEach(s => {
      if (s.routePolyline) totalKm += (s.distanceKm || 0);
      let segEtc = 0;
      (s.listStations || []).forEach(e => segEtc += (e.price || 0));
      s.etcCost = segEtc;
      totalEtc += segEtc;
    });
    this.entity.tongKm = totalKm;
    this.totalEtcCost = totalEtc;
  }

  showFullRouteMap() {
    if (this.locations.length < 2) return;
    this._currentMapSegmentIndex = null;
    const segments = this.entity.segments || [];
    const combinedCoords: number[][] = [];
    segments.forEach(seg => {
      if (seg.routePolyline) {
        try { const coords: number[][] = JSON.parse(seg.routePolyline); combinedCoords.push(...coords); } catch { }
      } else {
        if (seg.startLng && seg.startLat) combinedCoords.push([seg.startLng, seg.startLat]);
        if (seg.endLng && seg.endLat) combinedCoords.push([seg.endLng, seg.endLat]);
      }
    });
    const combinedSteps: { lat: number; lng: number; name: string; distanceM: number }[] = [];
    segments.forEach(seg => {
      (seg.listWaypoints || []).forEach(w => combinedSteps.push({ lat: w.lat, lng: w.lng, name: w.name || '', distanceM: w.distanceM || 0 }));
    });
    if (!combinedSteps.length) {
      this.locations.forEach(l => combinedSteps.push({ lat: l.lat, lng: l.lng, name: l.locationName, distanceM: 0 }));
    }
    const combinedTolls: { stationName: string; price: number }[] = [];
    segments.forEach(seg => (seg.listStations || []).forEach(e => combinedTolls.push({ stationName: e.stationName || '', price: e.price || 0 })));
    const polylineJson = combinedCoords.length >= 2 ? JSON.stringify(combinedCoords) : null;
    this.modalVietmap.showSaved(combinedSteps, polylineJson, combinedTolls.length ? combinedTolls : undefined);
  }

  editSegmentRoute(segIndex: number) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    this._routeContext = 'segment';
    this._currentMapSegmentIndex = segIndex;
    this.modalVietmap.show([
      { lat: seg.startLat, lng: seg.startLng },
      { lat: seg.endLat, lng: seg.endLng }
    ]);
  }

  openCompareModal(segIndex: number) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    this._routeContext = 'segment';
    this._currentMapSegmentIndex = segIndex;
    this.modalCompare.show([
      { lat: seg.startLat, lng: seg.startLng },
      { lat: seg.endLat, lng: seg.endLng }
    ]);
  }

  onCompareRouteSelected(event: CompareRouteResult) {
    // ===== Cung đường phát sinh — recalculate existing row =====
    if (this._routeContext === 'extra-existing' && this._extraExistingId) {
      const item = this.extraSegments.find(x => x.id === this._extraExistingId);
      if (item) {
        this._applyRouteToExtra(item, { km: event.km, polyline: event.polyline, steps: event.steps || [] });
        if (event.note) {
          const cur = (item.note || '').trim();
          item.note = cur ? `${cur}\n${event.note}` : event.note;
        }
        this._sendUpdateExtra(item);
      }
      this._routeContext = 'segment';
      this._extraExistingId = null;
      return;
    }
    // ===== Segment chính (luồng cũ) =====
    const segIndex = this._currentMapSegmentIndex;
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    if (event.provider === 'google') {
      this.notificationService.printConfirmationDialog(
        'Nếu chọn Bản đồ Google Maps thì hiện tại chưa lấy được thông tin về Trạm thu phí. Bạn có tiếp tục không?',
        () => this._applyCompareRoute(event, segIndex, seg, false)
      );
    } else {
      this._applyCompareRoute(event, segIndex, seg, true);
    }
  }

  private _applyCompareRoute(event: CompareRouteResult, segIndex: number, seg: TransportOrderSegment, fetchToll: boolean) {
    seg.distanceKm = +(event.km).toFixed(1);
    seg.routePolyline = event.polyline;
    if (event.note) {
      seg.note = seg.note?.trim() ? `${seg.note.trim()}\n${event.note}` : event.note;
    }
    this._rebuildDispatchSummarize();
    seg.listWaypoints = event.steps.map((s, i) => ({
      orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM
    }));
    if (seg.payloadWeight) {
      const quota = this.listOilQuota.find(x => x.id === seg.payloadWeight);
      if (quota) {
        seg.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
        seg.fuelAmountCalculated = +(seg.fuelNorm * seg.distanceKm / 100).toFixed(2);
      }
    }
    this.calculateTotal();
    this.calulateOilSegments();
    if (fetchToll) {
      const pts = event.steps.filter(s => s.lat && s.lng).map(s => ({ lat: s.lat, lng: s.lng }));
      this._fetchTollForSegment(segIndex, pts.length >= 2 ? pts : undefined);
    } else {
      seg.listStations = [];
      seg.etcCost = 0;
    }
  }

  onGoogleRouteSelected(event: { summary: string; km: number; steps: { lat: number; lng: number; name: string; distanceM: number }[]; polyline: string }) {
    const seg = this.entity.segments?.[this._currentMapSegmentIndex];
    if (!seg) return;
    seg.distanceKm = +(event.km).toFixed(1);
    seg.routePolyline = event.polyline;
    seg.listWaypoints = event.steps.map((s, i) => ({
      orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM
    }));
    if (seg.payloadWeight) {
      const quota = this.listOilQuota.find(x => x.id === seg.payloadWeight);
      if (quota) {
        seg.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
        seg.fuelAmountCalculated = +(seg.fuelNorm * seg.distanceKm / 100).toFixed(2);
      }
    }
    this.calculateTotal();
    this.calulateOilSegments();
    this._fetchTollForSegment(this._currentMapSegmentIndex);
  }

  showMapForSegment(segIndex: number) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg) return;
    this._currentMapSegmentIndex = segIndex;
    if (seg.listWaypoints?.length >= 2) {
      this.modalVietmap.showSaved(
        seg.listWaypoints.map(w => ({ lat: w.lat, lng: w.lng, name: w.name || '', distanceM: w.distanceM || 0 })),
        seg.routePolyline
      );
    } else {
      this.modalVietmap.show([
        { lat: seg.startLat, lng: seg.startLng },
        { lat: seg.endLat, lng: seg.endLng }
      ]);
    }
  }

  onRouteSelected(event: { summary: string; km: number; waypoints: { lat: number; lng: number }[]; steps: { lat: number; lng: number; name: string; distanceM: number }[]; polyline: string; tollStations?: SegmentStation[] }) {
    // ===== Cung đường phát sinh — recalculate existing row =====
    if (this._routeContext === 'extra-existing' && this._extraExistingId) {
      const item = this.extraSegments.find(x => x.id === this._extraExistingId);
      if (item) {
        this._applyRouteToExtra(item, event);
        this._sendUpdateExtra(item);
      }
      this._routeContext = 'segment';
      this._extraExistingId = null;
      return;
    }
    // ===== Chế độ xem extra — không emit (showSaved mode) =====
    if (this._routeContext === 'extra-view') {
      this._routeContext = 'segment';
      return;
    }
    // ===== Segment chính (luồng cũ) =====
    if (this._currentMapSegmentIndex !== null) {
      const seg = this.entity.segments?.[this._currentMapSegmentIndex];
      if (seg) {
        seg.distanceKm = +(event.km).toFixed(1);
        seg.routePolyline = event.polyline;
        seg.listWaypoints = event.steps.map((s, i) => ({ orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM }));
        // LUÔN ghi đè listStations theo route mới — route khác không có trạm thì XÓA trạm cũ
        // (trước đây chỉ set khi event.tollStations có phần tử → giữ nguyên trạm default sai).
        seg.listStations = event.tollStations?.length ? event.tollStations : [];
        seg.etcCost = 0;
        if (seg.payloadWeight) {
          const quota = this.listOilQuota.find(x => x.id === seg.payloadWeight);
          if (quota) {
            seg.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
            seg.fuelAmountCalculated = +(seg.fuelNorm * seg.distanceKm / 100).toFixed(2);
          }
        }
        this._applyTollPrices();
        this.calulateOilSegments();
        this._syncEtcFromSegment(this._currentMapSegmentIndex);
      }
    }
    this._currentMapSegmentIndex = null;
  }

  saveSegmentDefault(index: number) {
    const seg = this.getSegment(index);
    if (!seg?.distanceKm || !seg.startLocationId || !seg.endLocationId) return;
    const payload: RouteSegmentDefault = {
      startLocationId: seg.startLocationId,
      startLocationType: seg.startLocationType ?? 1,
      endLocationId: seg.endLocationId,
      endLocationType: seg.endLocationType ?? 1,
      distanceKm: seg.distanceKm,
      fuelNorm: seg.fuelNorm,
      fuelAmountCalculated: seg.fuelAmountCalculated,
      etcCost: seg.etcCost,
      routePolyline: seg.routePolyline,
      waypointsJson: seg.listWaypoints?.length ? JSON.stringify(seg.listWaypoints) : null,
      listStations: seg.listStations ?? []
    };
    this._transportService.saveSegmentDefault(payload).subscribe({
      next: (res: any) => {
        if (res?.code === '200') this.notificationService.printSuccessMessage('Đã lưu làm mặc định cho cung đường này.');
      },
      error: () => this.notificationService.printErrorMessage('Lưu mặc định thất bại.')
    });
  }

  private _rebuildSegments() {
    const existing = this.entity.segments || [];
    this.entity.segments = this.locations.slice(0, -1).map((loc, i) => {
      const next = this.locations[i + 1];
      const prev = existing.find(s => s.startLocationId === loc.locationId && s.endLocationId === next.locationId);
      if (!prev && loc.locationId && next.locationId) {
        this._fetchSegmentHistory(i, loc.locationId, loc.locationType ?? 1, next.locationId, next.locationType ?? 1);
      }
      return {
        orderIndex: i,
        startLocationId: loc.locationId,
        startLocationType: loc.locationType ?? 1,
        startLocationName: loc.locationName,
        startLat: loc.lat,
        startLng: loc.lng,
        endLocationId: next.locationId,
        endLocationType: next.locationType ?? 1,
        endLocationName: next.locationName,
        endLat: next.lat,
        endLng: next.lng,
        distanceKm: prev?.distanceKm ?? 0,
        payloadWeight: prev?.payloadWeight,
        fuelNorm: prev?.fuelNorm,
        fuelAmountCalculated: prev?.fuelAmountCalculated,
        routePolyline: prev?.routePolyline,
        listWaypoints: prev?.listWaypoints ?? [],
        listStations: prev?.listStations ?? []
      };
    });
    this.segmentCalculating = new Array(this.entity.segments.length).fill(false);
    this.calculateTotal();
    this.calulateOilSegments();
    // Auto-mark "Chặng cuối" khi chỉ có 1 chặng — vì chặng duy nhất hiển nhiên là cuối.
    // User vẫn có thể toggle về "Chặng đầu" để thêm điểm khác nếu cần.
    if (this.entity.segments.length === 1 && !this.routeConfirmed) {
      this.lastSegmentFinal = true;
    }
  }

  private _fetchSegmentHistory(index: number, startId: number, startType: number, endId: number, endType: number) {
    this._transportService.getSegmentHistory(startId, startType, endId, endType).subscribe({
      next: (res: any) => {
        if (res?.code !== '200' || !res.data) return;
        const seg = this.entity.segments?.[index];
        if (!seg || seg.startLocationId !== startId || seg.endLocationId !== endId) return;
        const d = res.data;
        if (d.routePolyline) {
          seg.routePolyline = d.routePolyline;
          if (d.distanceKm) seg.distanceKm = d.distanceKm;
          if (d.fuelNorm) seg.fuelNorm = d.fuelNorm;
          if (d.fuelAmountCalculated) seg.fuelAmountCalculated = d.fuelAmountCalculated;
          if (d.etcCost) seg.etcCost = d.etcCost;
        }
        if (d.waypointsJson) {
          try { seg.listWaypoints = JSON.parse(d.waypointsJson); } catch { }
        }
        if (d.isDefault && d.listStations?.length) seg.listStations = d.listStations;
        this._applyTollPrices();
        this.calulateOilSegments();
        this._syncEtcFromSegment(index);
      }
    });
  }

  private _parseTollStations(tollData: any): SegmentStation[] {
    if (!tollData || !Array.isArray(tollData)) return [];
    const priceMap: { [id: number]: { [v: number]: number } } = {};
    tollData.forEach((entry: any) => {
      entry.data?.tolls?.forEach((t: any) => {
        if (!priceMap[t.id]) priceMap[t.id] = {};
        priceMap[t.id][entry.vehicle] = t.price || 0;
      });
    });
    const base = tollData.find((t: any) => t.vehicle === 1);
    if (!base?.data?.tolls) return [];
    return base.data.tolls.map((t: any) => ({
      vietmapId: t.id,
      stationName: t.name || 'Trạm thu phí',
      price: 0,
      allPrices: JSON.stringify(priceMap[t.id] || {})
    }));
  }

  private readonly _botTypeMap: Record<number, number> = { 1132: 1, 1133: 2, 1134: 3, 1135: 4, 1136: 5 };

  private _applyTollPrices() {
    const vietmapKey = this._vehicleBotTypeId ? (this._botTypeMap[this._vehicleBotTypeId] ?? null) : null;
    (this.entity.segments || []).forEach(seg => {
      (seg.listStations || []).forEach(station => {
        if (!station.allPrices) return;
        try {
          const prices = JSON.parse(station.allPrices);
          station.price = vietmapKey ? (prices[vietmapKey] || 0) : 0;
        } catch { station.price = 0; }
      });
    });
    this.calculateTotal();
    // Đổi loại xe / áp lại giá → cập nhật Cost các dòng ETC auto
    this._recomputeAutoEtcPrices();
  }

  private _fetchTollForSegment(segIndex: number, waypoints?: { lat: number; lng: number }[]) {
    const seg = this.entity.segments?.[segIndex];
    if (!seg?.startLat || !seg?.endLat) return;
    const points = (waypoints?.length >= 2)
      ? waypoints
      : [{ lat: seg.startLat, lng: seg.startLng }, { lat: seg.endLat, lng: seg.endLng }];
    this._http.post<any>(`${environment.apiUrl}/api/VietmapApi/GetRouteAndToll`, { points })
      .pipe(catchError(() => of(null))).subscribe(res => {
        // Route mới không có trạm → xóa trạm cũ (tránh giữ stale)
        seg.listStations = res?.toll ? this._parseTollStations(res.toll) : [];
        this._applyTollPrices();
        this._syncEtcFromSegment(segIndex);
      });
  }

  private _loadAllLocations() {
    this._transportService.getLocations().subscribe(data => {
      this.listAllLocations = data || [];
    });
  }

  private _segmentsToLocations(segments: TransportOrderSegment[]): LocationItem[] {
    if (!segments?.length) return [];
    const locs: LocationItem[] = [];
    segments.forEach((s, idx) => {
      if (idx === 0) {
        locs.push({ locationId: s.startLocationId, locationType: s.startLocationType, locationName: s.startLocationName, lat: s.startLat, lng: s.startLng, type: 'pickup' });
      }
      locs.push({ locationId: s.endLocationId, locationType: s.endLocationType, locationName: s.endLocationName, lat: s.endLat, lng: s.endLng, type: 'delivery' });
    });
    return locs;
  }

  // Tổng dầu theo segments (TO refactor) — không xung đột với hàm dầu cũ của FCL legacy.
  calulateOilSegments() {
    let total = 0;
    (this.entity.segments || []).forEach(s => {
      s.fuelAmountCalculated = +((s.fuelNorm || 0) * (s.distanceKm || 0) / 100).toFixed(2);
      total += s.fuelAmountCalculated;
    });
    // Tongdau ở FCL = tổng dầu segments + OilCompensation. Backend tự tính khi save.
    // Ở FE chỉ hiển thị tham khảo:
    this.entity.tongdau = +total.toFixed(2);
  }

  private _rebuildDispatchSummarize() {
    const lines = (this.entity.segments || [])
      .map((s, i) => s.note?.trim() ? `Chặng ${i + 1}: ${s.note.trim()}` : null)
      .filter(l => !!l);
    this.entity.dispatchSummarize = lines.join('\n');
  }

  // ============================================================
  // ===== Cung đường phát sinh (2026-05-19) ====================
  // ============================================================
  // Mở modal "Thêm cung đường phát sinh" (tách riêng — tự chứa Vietmap/So sánh).
  openExtraSegmentPopup() {
    if (!this.canAddExtraSegment) return;
    if (!this.entity.toId) {
      this.notificationService.printErrorMessage('Lệnh chưa link TO — không thể thêm cung đường phát sinh.');
      return;
    }
    this.modalAddExtra.open({
      transportOrderId: this.entity.toId,
      locations: this.listAllLocations,
      vehicleBotTypeId: this._vehicleBotTypeId,
      listOilQuota: this.listOilQuota,        // định mức dầu theo tải trọng của xe trên lệnh
      vehicleId: this.entity.vehicleId,       // fallback tự nạp nếu listOilQuota rỗng
      shortWay: this.entity.shortWay          // cung đường ngắn → dùng shortWayValue
    });
  }

  // Modal con lưu xong → gộp vào list + cập nhật totals.
  onExtraSegmentSaved(e: ExtraSegmentSavedResult) {
    if (!e?.newItem) return;
    this.extraSegments = [...this.extraSegments, e.newItem];
    this._applyTotals(e.totals);
  }

  onExtraPayloadChange(item: TransportOrderExtraSegment) {
    if (!this.canAddExtraSegment) return;
    const quota = this.listOilQuota.find(x => x.id === item.payloadWeight);
    if (quota) {
      item.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
      item.fuelAmountCalculated = +((item.fuelNorm || 0) * (item.distanceKm || 0) / 100).toFixed(2);
    } else {
      item.fuelNorm = 0;
      item.fuelAmountCalculated = 0;
    }
    this._debouncedUpdateExtra(item);
  }

  private _debouncedUpdateExtra(item: TransportOrderExtraSegment) {
    if (!item.id) return;
    clearTimeout(this._extraDebounce[item.id]);
    this._extraDebounce[item.id] = setTimeout(() => this._sendUpdateExtra(item), 400);
  }

  private _sendUpdateExtra(item: TransportOrderExtraSegment) {
    const payload: TransportOrderExtraSegment = {
      id: item.id,
      startLocationId: item.startLocationId,
      startLocationType: item.startLocationType,
      startLocationName: item.startLocationName,
      startLat: item.startLat,
      startLng: item.startLng,
      endLocationId: item.endLocationId,
      endLocationType: item.endLocationType,
      endLocationName: item.endLocationName,
      endLat: item.endLat,
      endLng: item.endLng,
      distanceKm: item.distanceKm,
      payloadWeight: item.payloadWeight,
      fuelNorm: item.fuelNorm,
      fuelAmountCalculated: item.fuelAmountCalculated,
      routePolyline: item.routePolyline,
      stationsJson: item.listStations?.length ? JSON.stringify(item.listStations) : null,
      waypointsJson: item.listWaypoints?.length ? JSON.stringify(item.listWaypoints) : null,
      note: item.note
    };
    this._transportService.updateExtraSegment(payload).subscribe({
      next: (res) => {
        if (res.code === '200') {
          this._applyTotals(res.data);
          this.notificationService.printSuccessMessage('Đã cập nhật cung đường phát sinh.');
        } else {
          this.notificationService.printErrorMessage(res.message || 'Cập nhật thất bại.');
        }
      },
      error: () => this.notificationService.printErrorMessage('Cập nhật thất bại.')
    });
  }

  deleteExtraSegment(item: TransportOrderExtraSegment) {
    if (!this.canAddExtraSegment || !item.id) return;
    const label = `${item.startLocationName || ''} → ${item.endLocationName || ''}`;
    this.notificationService.printConfirmationDialog(
      `Xóa cung đường phát sinh: ${label}?`,
      () => {
        this._transportService.deleteExtraSegment(item.id).subscribe({
          next: (res) => {
            if (res.code === '200') {
              this.extraSegments = this.extraSegments
                .filter(x => x.id !== item.id)
                .map((x, i) => ({ ...x, seqNo: i + 1 }));
              this._applyTotals(res.data);
              this.notificationService.printSuccessMessage('Đã xóa.');
            } else {
              this.notificationService.printErrorMessage(res.message || 'Xóa thất bại.');
            }
          },
          error: () => this.notificationService.printErrorMessage('Xóa thất bại.')
        });
      }
    );
  }

  viewExtraSegmentMap(item: TransportOrderExtraSegment) {
    if (!item.routePolyline && !item.listWaypoints?.length) {
      this.notificationService.printErrorMessage('Cung đường chưa được tính — bấm "Tính lại Vietmap" trước.');
      return;
    }
    this._routeContext = 'extra-view';
    const steps = (item.listWaypoints || []).map(w => ({
      lat: w.lat, lng: w.lng, name: w.name || '', distanceM: w.distanceM || 0
    }));
    const tolls = (item.listStations || []).map(s => ({ stationName: s.stationName || '', price: s.price || 0 }));
    this.modalVietmap.showSaved(steps, item.routePolyline, tolls.length ? tolls : undefined);
  }

  recalcExtraVietmap(item: TransportOrderExtraSegment) {
    if (!this.canAddExtraSegment || !item.id) return;
    if (!item.startLat || !item.endLat) {
      this.notificationService.printErrorMessage('Điểm chưa có tọa độ GPS.');
      return;
    }
    this._routeContext = 'extra-existing';
    this._extraExistingId = item.id;
    this.modalVietmap.show([
      { lat: item.startLat, lng: item.startLng },
      { lat: item.endLat, lng: item.endLng }
    ]);
  }

  compareExtraRoute(item: TransportOrderExtraSegment) {
    if (!this.canAddExtraSegment || !item.id) return;
    if (!item.startLat || !item.endLat) {
      this.notificationService.printErrorMessage('Điểm chưa có tọa độ GPS.');
      return;
    }
    this._routeContext = 'extra-existing';
    this._extraExistingId = item.id;
    this.modalCompare.show([
      { lat: item.startLat, lng: item.startLng },
      { lat: item.endLat, lng: item.endLng }
    ]);
  }

  private _applyTotals(t: TransportOrderTotalsResult) {
    if (!t) return;
    if (t.tongKm != null) this.entity.tongKm = t.tongKm as any;
    if (t.tongdau != null) this.entity.tongdau = t.tongdau as any;
    if (t.chiphidau != null) this.entity.chiphidau = t.chiphidau as any;
  }

  // Apply route result (từ Vietmap / Compare) vào draft hoặc extra existing
  private _applyRouteToExtra(target: TransportOrderExtraSegment, event: {
    km: number; polyline: string; tollStations?: SegmentStation[];
    steps?: { lat: number; lng: number; name: string; distanceM: number }[];
  }) {
    target.distanceKm = +(event.km).toFixed(1);
    target.routePolyline = event.polyline;
    if (event.steps?.length) {
      target.listWaypoints = event.steps.map((s, i) => ({
        orderIndex: i, lat: s.lat, lng: s.lng, name: s.name, distanceM: s.distanceM
      })) as any;
    }
    if (event.tollStations?.length) {
      target.listStations = event.tollStations;
      this._applyExtraTollPrices(target);
    } else {
      target.listStations = [];
    }
    if (target.payloadWeight) {
      const quota = this.listOilQuota.find(x => x.id === target.payloadWeight);
      if (quota) {
        target.fuelNorm = this.entity.shortWay ? quota.shortWayValue : quota.value;
        target.fuelAmountCalculated = +((target.fuelNorm || 0) * (target.distanceKm || 0) / 100).toFixed(2);
      }
    }
  }

  // Áp giá trạm BOT theo loại xe (giống _applyTollPrices nhưng cho 1 extra segment)
  private _applyExtraTollPrices(item: TransportOrderExtraSegment) {
    const vietmapKey = this._vehicleBotTypeId ? (this._botTypeMap[this._vehicleBotTypeId] ?? null) : null;
    (item.listStations || []).forEach(station => {
      if (!station.allPrices) return;
      try {
        const prices = JSON.parse(station.allPrices);
        station.price = vietmapKey ? (prices[vietmapKey] || 0) : 0;
      } catch { station.price = 0; }
    });
  }

  private _safeJsonParse<T>(s: string, fallback: T): T {
    try { return JSON.parse(s) as T; } catch { return fallback; }
  }
}
