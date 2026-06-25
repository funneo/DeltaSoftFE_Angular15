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
  OtherCategories,
  Supplier,
  Vihicle,
  Employee,
  ResponseValue,
  DispatchOrderTicket,
  DispatchOrderMonthlyticket,
  DispatchOrderEtc,
} from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { HandOver } from "@app/shared/models/customer-communicate/app-garage-delta/hand-over.model";
import { CustomerLocations } from "@app/shared/models/danhmuc/customer-locations.model";
import { CustomerRoutes } from "@app/shared/models/danhmuc/customer-routes.model";
import { GroupPorts } from "@app/shared/models/danhmuc/group-ports.model";
import { Ports } from "@app/shared/models/danhmuc/ports.model";
import { VehicleOilQuota } from "@app/shared/models/danhmuc/vehicle-oil-quota.model";
import {
  DispatchOrderFcl,
} from "@app/shared/models/fcl/dispatch-order-fcl";
import { TollStation } from "@app/shared/models/toll-station.model";
import { Tollroute } from "@app/shared/models/tollroute.model";
import { DispatchOrderAttachfiles } from "@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles";
import { DispatchOrderFee } from "@app/shared/models/transports/dispatchorders/dispatch-order-fee";
import { DispatchOrderParkingticket } from "@app/shared/models/transports/dispatchorders/dispatch-order-parkingticket.model";
import { DispatchOrderPurchasePrice } from "@app/shared/models/transports/dispatchorders/dispatch-order-purchase-price";
import { DispatchOrderStandardRoute } from "@app/shared/models/transports/dispatchorders/dispatch-order-standard-route.model";
import { Dispatchorder } from "@app/shared/models/transports/dispatchorders/dispatchorder";
import { Dispatchorderdetailed } from "@app/shared/models/transports/dispatchorders/dispatchorderdetailed";
import { GasManagement } from "@app/shared/models/transports/gas-management.model";
import { Quotationsubcontractors } from "@app/shared/models/transports/quotationsubcontractors.model";
import { Quotationsubcontractorsdetailed } from "@app/shared/models/transports/quotationsubcontractorsdetailed.model";
import { ShippingTask } from "@app/shared/models/transports/shipping-task.model";
import {
  UtilityService,
  NotificationService,
  EmployeeService,
  AuthService,
  OtherCategoriesService,
  FeeService,
} from "@app/shared/services";
import { CustomerLocationsService } from "@app/shared/services/danhmuc/customer-locations.service";
import { PortsService } from "@app/shared/services/danhmuc/ports.service";
import { SupplierDriversService } from "@app/shared/services/danhmuc/supplier-drivers.service";
import { SupplierVehiclesService } from "@app/shared/services/danhmuc/supplier-vehicles.service";
import { DispatchOrderFclService } from "@app/shared/services/fcl/dispatch-order-fcl.service";
import { QuotationsubcontractorsService } from "@app/shared/services/quotationsubcontractors.service";
import { SupplierService } from "@app/shared/services/supplier.service";
import { TollStationService } from "@app/shared/services/toll-station.service";
import { TollrouteService } from "@app/shared/services/tollroute.service";
import { VihicleService } from "@app/shared/services/vihicle.service";
import { environment } from "@environments/environment";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { ModalCustomerRoutesComponent } from "../../danhmuc/modal-customer-routes/modal-customer-routes.component";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { ModalConfirmDenyClosingFclComponent } from "../modal-confirm-deny-closing-fcl/modal-confirm-deny-closing-fcl.component";
import { ModalViewShippingTaskComponent } from "../modal-view-shipping-task/modal-view-shipping-task.component";

@Component({
  selector: "modal-perform-fcl",
  templateUrl: "./modal-perform-fcl.component.html",
  styleUrls: ["./modal-perform-fcl.component.css"],
})
export class ModalPerformFclComponent implements OnInit {
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
  public listParking: DispatchOrderParkingticket[] = [];
  public flagOk: boolean = false;
  public selectdTicketIndex?: number;
  public selectdEtcIndex?: number;
  public selectdMonthlyTicketIndex?: number;
  public quotationDetailed: Quotationsubcontractorsdetailed;
  public listEtcPassed: DispatchOrderEtc[] = [];
  public listPort: Ports[] = [];
  public listCFS: Ports[] = [];
  public listShipBrand: OtherCategories[] = [];
  closing_permission: boolean = false;
  accept_permission: boolean = false;
  account_permission: boolean = false;
  job_locked: boolean = false;
  admin_permission = false;
  permission: Permissions;
  viewConfirm: boolean = false;
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
  public vihicleTypeId?: number = 0;
  public driverId?: string;
  public secondDriverId?: string;
  public vihicleId?: number;
  public moocId?: number;
  public tollRouteCode?: string = "";
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
  @Input() appFuncion: any;
  // Chế độ thực hiện lệnh THẦU PHỤ: chỉ cho phép "Nhận lệnh" (status==1), ẩn mọi nút thao tác khác.
  // Mặc định false => tab thực hiện lệnh CÔNG TY giữ nguyên hành vi cũ.
  @Input() subcontractorMode: boolean = false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalDispatchOrderFcl", { static: false }) modalDispatchOrderFcl: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalConfirmDenyClosingFclComponent, { static: false }) modalConfirm: ModalConfirmDenyClosingFclComponent;
  @ViewChild(ModalCustomerRoutesComponent, { static: false }) modalCustomerRoutes: ModalCustomerRoutesComponent;
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
    private supplierVehicleService: SupplierVehiclesService,
    private quotationsubService: QuotationsubcontractorsService,
    private tollRouteService: TollrouteService,
    private vehicleService: VihicleService,
    private portsService: PortsService,
    private dispatchOrderService: DispatchOrderFclService,
    private _groupPortsService: PortsService,
    private feeService: FeeService,
    private _customerLocationsService: CustomerLocationsService,
    private tollStationService: TollStationService,

  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    const permiss: string[] =
      typeof this.userLoged.permissions == "string"
        ? JSON.parse(this.userLoged.permissions)
        : this.userLoged.permissions;
    this.closing_permission =
      permiss.findIndex((x) => x === "DISPATCHORDER_CLOSING") != -1;
    this.accept_permission =
      permiss.findIndex((x) => x === "DISPATCHORDER_ACCEPT") != -1;
    this.account_permission =
      permiss.findIndex((x) => x === "DISPATCHORDER_ACCOUNT") != -1;
    this.admin_permission = this.userLoged.isAdmin;
    this.loadSupplier();
    this.loadVihicleType();
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
        this.listContTypes = res.data.filter((x) => x.type === "CONTYPE");
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
      .subscribe((res: ResponseValue<CustomerRoutes[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listLocationsCustomer = res.data;
        } else this.listLocationsCustomer = [];
      });
  }
  //Nếu thay đổi loại lệnh từ xe nhà qua xe ngoài hoặc ngược lại thì xóa hết dữ liệu của cái cũ đi

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
      const filtered = res.data?.filter((fee) => ["CP01", "CP02", "CP03"].includes(fee.groupCode)) || [];
      // Create completely new objects to prevent cache mutation
      this.listFee = filtered.map(fee => {
        const newFee: Fee = {
          id: fee.id,
          feeCode: fee.feeCode,
          feeName: `${fee.feeCode}-${fee.feeName}`,
          feeNameEnglish: fee.feeNameEnglish,
          groupFeeId: fee.groupFeeId,
          paymentFeeGroupId: fee.paymentFeeGroupId,
          revenueFeeGroupId: fee.revenueFeeGroupId,
          debitAccount: fee.debitAccount,
          creditAccount: fee.creditAccount,
          notes: fee.notes,
          status: fee.status,
          checked: fee.checked,
          groupName: fee.groupName,
          groupCode: fee.groupCode,
          paymentGroupName: fee.paymentGroupName,
          revenueGroupName: fee.revenueGroupName,
          isDef: fee.isDef
        };
        return newFee;
      });
    });
  }

  feeCodeChanged(item: DispatchOrderPurchasePrice, event: Fee) {
    item.feeId = event?.id;
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

  loadQuotationDetailed() {
    if (
      this.supplierId > 0 &&
      this.vihicleTypeId > 0 &&
      this.tollRouteCode.length > 0
    ) {
      const params = new HttpParams()
        .set("supplierid", this.supplierId.toString())
        .set("tollroutecode", this.tollRouteCode)
        .set("vihicletypeid", this.vihicleTypeId.toString());
      this.busy = this.quotationsubService
        .getQuotation(params)
        .subscribe((res: ResponseValue<Quotationsubcontractorsdetailed>) => {
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
  loadVihicle(vihicletype: number): void {
    const params = new HttpParams()
      .set("branchid", this.userLoged.branchId.toString())
      .set("vihicletype", vihicletype.toString());
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

  kmDieuchinh: number = 0;
  noLoadingkmDieuchinh: number = 0;

  totalOil: number = 0;
  calulateOil() {
    // Calculate total fuel for round-trip operations
    this.entity.tongdauLuotDi = this._utilityService.round2(
      (((this.entity.chang1KmLuotDi ?? 0) +
        (this.entity.chang2KmLuotDi ?? 0) +
        (this.entity.dieuchinhKmLuotDi ?? 0)) /
        100) *
      (this.entity.dinhmucDauLuotDi ?? 0)
    );
    this.entity.tongdauLuotVe = this._utilityService.round2(
      (((this.entity.chang1KmLuotVe ?? 0) +
        (this.entity.chang2KmLuotVe ?? 0) +
        (this.entity.dieuchinhKmLuotVe ?? 0)) /
        100) *
      (this.entity.dinhmucDauLuotVe ?? 0)
    );

    // Calculate total fuel for transportation between port and destination
    this.entity.tongdauTrungchuyenCang = this._utilityService.round2(
      ((this.entity.kmTrungchuyenCang ?? 0) / 100) *
      (this.entity.dinhmucDauTrungchuyenCang ?? 0)
    );
    this.entity.tongdauTrungchuyenCangVe = this._utilityService.round2(
      ((this.entity.kmTrungchuyenCangVe ?? 0) / 100) *
      (this.entity.dinhmucDauTrungchuyenCangVe ?? 0)
    );

    // Calculate total fuel for factory transport
    this.entity.tongdauTrungchuyenNhamay = this._utilityService.round2(
      ((this.entity.kmTrungchuyenNhamay ?? 0) / 100) *
      (this.entity.dinhmucDauTrungchuyenNhamay ?? 0)
    );
    this.entity.tongdauTrungchuyenNhamayVe = this._utilityService.round2(
      ((this.entity.kmTrungchuyenNhamayVe ?? 0) / 100) *
      (this.entity.dinhmucDauTrungchuyenNhamayVe ?? 0)
    );

    // Calculate total fuel for all operations
    this.entity.tongdau =
      (this.entity.tongdauLuotDi ?? 0) +
      (this.entity.tongdauLuotVe ?? 0) +
      (this.entity.tongdauTrungchuyenCang ?? 0) +
      (this.entity.tongdauTrungchuyenCangVe ?? 0) +
      (this.entity.tongdauTrungchuyenNhamay ?? 0) +
      (this.entity.tongdauTrungchuyenNhamayVe ?? 0);
  }

  edit(refNo: string, flag: boolean) {
    this.dispatchOrderService
      .getDetail(refNo)
      .subscribe((res: ResponseValue<DispatchOrderFcl>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.listEtcPassed = this.entity.listEtc.filter(x => x.isPassed);
          this.loadVihicle(this.entity.vehicleType);
          const checksToDelete = this.entity.listDetailed.map(
            (item) => item.shippingTaskItem.customerId
          );
          this.loadLocations(checksToDelete.join(","));
          this.loadVehicle(this.entity.vehicleId);
          if (this.entity.cang1Id > 0 || this.entity.cang2Id > 0)
            this.cangExpanded = true;
          if (this.entity.nhamay1 > 0 || this.entity.nhamay2 > 0)
            this.nhaMayExpanded = true;
          if (this.entity.isSubcontractors) {
            this.supplierId = this.entity.shippingUnitId;
            this.tollRouteCode = this.entity.subcontractorsQuoteRouteCode;
            this.loadTollRoute();
          }
          //this.totalEtc=this.calculateSum();
          this._gradeDriver = this.entity.gradeDriver;
          this._evaluationDriver = this.entity.evaluationDriver;

          // this.loadAttackFiles();
          // this.loadPod();
          this.flagXem = flag;
          this.flagSave = false;
          //Kiểm tra nếu là edit thì check tiếp quyền có quyền duyệt hay không?, nếu có quyền duyệt thì cho edit hết, ko thì kiểm tra xem có phải là người tạo không
          if (!this.flagXem) {
            if (
              !this.userLoged.isAdmin &&
              !this.accept_permission &&
              this.userLoged.id != this.entity.createdBy
            )
              this.flagXem = true;
          }
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
            this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
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
          this.modalDispatchOrderFcl.show();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {

  }
  changeSupplier(event: Supplier) {
    this.entity.driverId = null;
    this.entity.vehicleId = null;
    this.supplierId = event?.id;
    this.busy = this.suppliertSerive
      .getDetail(event.supplierCode)
      .subscribe((res: ResponseValue<Supplier>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
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
  changeTollRouteCode(event: Tollroute) {
    this.tollRouteCode = event?.tollRouteCode;
    this.loadQuotationDetailed();
  }
  viewRoutes = false;

  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "DISPATCHORDERS",
      functionName: "DISPATCHORDERS",
      refNo: this.entity.refNo,
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
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
  updateState(type: number) {
    var item = Object.assign({}, this.entity);
    item.status = type;
    this.busy = this.dispatchOrderService
      .updateState(item, false, 0)
      .subscribe((res: ResponseValue<Dispatchorder>) => {
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
  nhanlenh() {
    this.updateState(2);
  }

  tuchoinhanlenh() {
    let copy = Object.assign({}, this.entity);
    let _ok = false;
    let retVal = prompt("Lý do từ chối nhận lệnh", "");
    if (retVal && retVal.length > 0) {
      _ok = true;
    }
    copy.feedback = retVal ?? "";
    if (_ok) {
      this.dispatchOrderService.updateState(copy, true, 0).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
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
  update(flag: boolean) {
    if (this.entity.startVehicleOdor !== null && this.entity.finishVehicleOdor !== null) {
      if (this.entity.startVehicleOdor >= this.entity.finishVehicleOdor) {
        this.notificationService.printErrorMessage(
          "Số km đầu vào không được lớn hơn hoặc bằng số km đầu ra!"
        );
        return;
      }
    }
    let copy = Object.assign({}, this.entity);
    copy.finished = flag;
    this.dispatchOrderService.driverUpdate(copy).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
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
  saveSuccess(event: any): void {
    let item = Object.assign({}, this.entity);
    item.feedback = event.feedback;
    this.dispatchOrderService.updateState(item, true, event.valueReturn).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
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
  checkChenhlech(): boolean {
    let isChenhlech = false;
    if (this.entity.listFee.length > 0) {
      this.entity.listFee.forEach((item) => {
        if (item.cost > 0 && item.feeId != environment.fuelFeeId) {
          isChenhlech = true;
        }
      });
    }
    if (this.entity.listEtc.length > 0) {
      this.entity.listEtc.forEach((item) => {
        if (item.isPassed && item.cost > 0) {
          isChenhlech = true;
        }
      });
    }
    if (
      (this.entity.dieuchinhKmLuotDi != null && this.entity.dieuchinhKmLuotDi > 0) ||
      (this.entity.dieuchinhKmLuotVe != null && this.entity.dieuchinhKmLuotVe > 0) ||
      (this.entity.luonghangTrungchuyenCang != null && this.entity.luonghangTrungchuyenCang > 0) ||
      (this.entity.luonghangTrungchuyenCangVe != null && this.entity.luonghangTrungchuyenCangVe > 0) ||
      (this.entity.luonghangTrungchuyenNhamay != null && this.entity.luonghangTrungchuyenNhamay > 0) ||
      (this.entity.luonghangTrungchuyenNhamayVe != null && this.entity.luonghangTrungchuyenNhamayVe > 0)) {
      isChenhlech = true;
    }
    return isChenhlech;
  }
  chotdulieu() {
    let isChenhlech = this.checkChenhlech();
    this.notificationService.printConfirmationDialog(MessageContstants.APPROVE_LENHVC_FCL, () => {
      //Đoạn này thì hệ thống sẽ so sánh dữ liệu mặc định và dữ liệu hiện có về ETC và chi phí
      //Nếu có chệnh lệch hoặc phát sinh thì sẽ chuyển sang trạng thái chờ duyệt từ cấp cao hơn nữa
      if (isChenhlech) {
        this.updateState(5);
      } else {
        this.updateState(6);
      }
    });
  }
  tuchoichotdulieu() {
    this.viewConfirm = true;
    setTimeout(() => {
      this.modalConfirm.edit();
    }, 50);
  }

  closeModalShippingTask() {
    this.viewModalShippingTask = false;
  }

  //@ViewChild(ModalShippingTaskCsComponent, { static: false })  modalAddShippingTask: ModalShippingTaskCsComponent;
  @ViewChild(ModalViewShippingTaskComponent, { static: false }) modalAddShippingTask: ModalViewShippingTaskComponent;
  viewModalShippingTask = false;
  viewCongviec(id: number) {
    this.viewModalShippingTask = true;
    setTimeout(() => {
      this.modalAddShippingTask.edit(id.toString(), true);
    }, 50);
  }

  viewAttackFiles = false;
  attack(id: number) {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'SHIPPINGTASK',
      functionName: 'SHIPPINGTASK',
      refNo: id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, this.entity.createdBy != this.userLoged.id);
    }, 50);
  }
  changeCost(item: DispatchOrderFee) {
    item.totalCost = item.cost! + item.vat!;
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
    this.entity.dinhmucDauLuotDi = event?.value;
    this.calulateOil();
  }

  luonghangLuotveChanged(event: VehicleOilQuota) {
    this.entity.luonghangIdLuotVe = event?.id;
    this.entity.dinhmucDauLuotVe = event?.value;
    this.calulateOil();
  }
  luonghangTrungchuyenCangChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenCang = event?.id;
    this.entity.dinhmucDauTrungchuyenCang = event?.value;
    this.calulateOil();
  }
  luonghangTrungchuyenCangVeChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenCangVe = event?.id;
    this.entity.dinhmucDauTrungchuyenCangVe = event?.value;
    this.calulateOil();
  }
  luonghangTrungchuyenNhamayChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenNhamay = event?.id;
    this.entity.dinhmucDauTrungchuyenNhamay = event?.value;
    this.calulateOil();
  }
  luonghangTrungchuyenNhamayVeChanged(event: VehicleOilQuota) {
    this.entity.luonghangTrungchuyenNhamayVe = event?.id;
    this.entity.dinhmucDauTrungchuyenNhamayVe = event?.value;
    this.calulateOil();
  }

  chang1DiXuatChanged(event: CustomerLocations) {
    this.entity.chang1IdLuotDi = event?.id;
    this.entity.chang1KmLuotDi = event?.distanceToWB;
    this.calulateOil();
  }
  chang1DiNhapChanged(event: GroupPorts) {
    this.entity.chang1IdLuotDi = event?.id;
    this.entity.chang1KmLuotDi = event?.distanceToWb;
    this.calulateOil();
  }
  chang2DiXuatChanged(event: GroupPorts) {
    this.entity.chang2IdLuotDi = event?.id;
    this.entity.chang2KmLuotDi = event?.distanceToWb;
    this.calulateOil();
  }
  chang2DiNhapChanged(event: CustomerLocations) {
    this.entity.chang2IdLuotDi = event?.id;
    this.entity.chang2KmLuotDi = event?.distanceToWB;
    this.calulateOil();
  }

  chang1VeXuatChanged(event: GroupPorts) {
    this.entity.chang1IdLuotVe = event?.id;
    this.entity.chang1KmLuotVe = event?.distanceToWb;
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
  trungChuyenChanged1(event: GroupPorts) {
    this.kmcang1 = event?.distanceToWb;
    this.entity.kmTrungchuyenCang = Math.abs(this.kmcang1 - this.kmcang2);
    this.calulateOil();
  }
  trungChuyenChanged2(event: GroupPorts) {
    this.kmcang2 = event?.distanceToWb;
    this.entity.kmTrungchuyenCang = Math.abs(this.kmcang1 - this.kmcang2);
    this.calulateOil();
  }
  trungChuyenVeChanged1(event: GroupPorts) {
    this.kmcang1Ve = event?.distanceToWb;
    this.entity.kmTrungchuyenCangVe = Math.abs(this.kmcang1Ve - this.kmcang2Ve);
    this.calulateOil();
  }
  trungChuyenVeChanged2(event: GroupPorts) {
    this.kmcang2Ve = event?.distanceToWb;
    this.entity.kmTrungchuyenCangVe = Math.abs(this.kmcang1Ve - this.kmcang2Ve);
    this.calulateOil();
  }
  chang2VeXuatChanged(event: CustomerLocations) {
    this.entity.chang2IdLuotVe = event?.id;
    this.entity.chang2KmLuotVe = event?.distanceToWB;
    this.calulateOil();
  }
  chang2VeNhapChanged(event: GroupPorts) {
    this.entity.chang2IdLuotVe = event?.id;
    this.entity.chang2KmLuotVe = event?.distanceToWb;
    this.calulateOil();
  }

  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }

  closeModalConfirm() {
    this.viewConfirm = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
