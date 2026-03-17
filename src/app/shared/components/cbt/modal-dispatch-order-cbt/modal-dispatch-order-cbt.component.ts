import { DispatchOrderCbtRoutes } from "./../../../models/cbt/dispatch-order-cbt-routes.model";
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
import { MessageContstants } from "@app/shared/constants";
import {
  Customer,
  DispatchOrderEtc,
  Employee,
  Fee,
  OtherCategories,
  Profile,
  ResponseValue,
  Route,
  Shipment,
  Supplier,
  Vihicle,
} from "@app/shared/models";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { DispatchOrderCbt } from "@app/shared/models/cbt/dispatch-order-cbt.model";
import { TollStation } from "@app/shared/models/toll-station.model";
import { Tollroute } from "@app/shared/models/tollroute.model";
import { DispatchOrderSurcharge } from "@app/shared/models/transports/dispatchorders/dispatch-order-surcharge.model";
import { Dispatchorder } from "@app/shared/models/transports/dispatchorders/dispatchorder";
import { Dispatchorderroutes } from "@app/shared/models/transports/dispatchorders/dispatchorderroutes";
import { GasManagement } from "@app/shared/models/transports/gas-management.model";
import {
  AuthService,
  CustomerService,
  EmployeeService,
  FeeService,
  NotificationService,
  OtherCategoriesService,
  ShipmentService,
  UtilityService,
} from "@app/shared/services";
import { CbtService } from "@app/shared/services/cbt/cbt.service";
import { RouteService } from "@app/shared/services/route.service";
import { TollStationService } from "@app/shared/services/toll-station.service";
import { GasManagementService } from "@app/shared/services/transports/gas-management.service";
import { VihicleService } from "@app/shared/services/vihicle.service";
import { environment } from "@environments/environment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { Subscription } from "rxjs";
import { ModalShipmentComponent } from "../../shipments/modal-shipment/modal-shipment.component";
import { ModalAttachfileComponent } from "../../systems/modal-attachfile/modal-attachfile.component";
import { ModalDispatchorderRouteComponent } from "../../transports/modal-dispatchorder-route/modal-dispatchorder-route.component";
import { ModalShipmentViewSearchComponent } from "../../shipments/modal-shipment-view-search/modal-shipment-view-search.component";
import * as moment from "moment";
import { AdvancesCbt } from "@app/shared/models/cbt/advances-cbt.model";
import { ModalAdvanceCbtComponent } from "../modal-advance-cbt/modal-advance-cbt.component";
import { ModalPaymentCbtComponent } from "../modal-payment-cbt/modal-payment-cbt.component";
import { PaymentCbt } from "@app/shared/models/cbt/payment-cbt.model";
import { DriverFuelApproval } from "@app/shared/models/transports/driver-fuel-approval.model";
import { ModalDriverFuelApprovalComponent } from "../../transports/modal-driver-fuel-approval/modal-driver-fuel-approval.component";
import { ModalExternalOilPurchasedComponent } from "../../transports/modal-external-oil-purchased/modal-external-oil-purchased.component";
import { ExternalOilPurchased } from "@app/shared/models/transports/external-oil-purchased.model";
type AOA = any[][];
import * as XLSX from "xlsx";
import { DispatchOrderCbtEtc } from "@app/shared/models/cbt/dispatch-order-cbt-etc.model";
import { FormatContstants } from "@app/shared/constants/format.constants";
import { CustomerLocations } from "@app/shared/models/danhmuc/customer-locations.model";
import { CustomerRoutes } from "@app/shared/models/danhmuc/customer-routes.model";
import { CustomerLocationsService } from "@app/shared/services/danhmuc/customer-locations.service";
import { CustomerRoutesService } from "@app/shared/services/danhmuc/customer-routes.service";

@Component({
  selector: "modal-dispatch-order-cbt",
  templateUrl: "./modal-dispatch-order-cbt.component.html",
  styleUrls: ["./modal-dispatch-order-cbt.component.css"],
})
export class ModalDispatchOrderCbtComponent implements OnInit {
  public entity: DispatchOrderCbt;
  public flagNew?: boolean = false;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public viewWorkflow: boolean = false;
  public viewRoute: boolean = false;
  public viewAttachFiles: boolean = false;
  public viewJobModal: boolean = false;
  public viewAdvanceModal: boolean = false;
  public viewPaymentModal: boolean = false;
  public viewDriverFuel = false;
  public viewExternal = false;
  public userLoged: Profile;
  public customerId?: number = 0;
  public listTollRoute: Tollroute[] = [];
  public listFee: Fee[];
  public flagOk: boolean = false;
  public selectdTicketIndex?: number;
  public selectdEtcIndex?: number;
  public selectdMonthlyTicketIndex?: number;
  public _shipmentId?: number;
  public _branchId?: number;
  public _customerId?: number;
  closing_permission: boolean = false;
  accept_permission: boolean = false;
  admin_permission = false;
  permission: Permissions;
  isDriver=false;
  listLocations:CustomerLocations[]=[];
  listRoutesCustomer:CustomerRoutes[]=[];
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), true);
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  datetimeUp = this._utilityService.dateTimeOptionDaysUp(new Date(), true);
  public listCustomer: Customer[];
  public listVihicle: Vihicle[];
  public listMooc: Vihicle[];
  public listEmployee: Employee[];
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
  mask3Number=UtilityService.mask3Number;
  mask0 = UtilityService.mask0;
  public _gradeDriver = 0;
  public _evaluationDriver = "";
  listShipments: Shipment[];
  gasValue: GasManagement;
  public busy: Subscription;
  km: number = 0;
  public listTollStation: TollStation[] = [];
  generatorOil = 0;
  totalEtc = 0;
  customerCode?: string;
  customerName?: string;
  viewSearchJobId = false;
  isAccepted=false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false })
  modalDispatchOrderAddEdit: ModalDirective;
  @ViewChild(ModalShipmentComponent, { static: false })
  modalJob: ModalShipmentComponent;
  @ViewChild("staticTabs", { static: false }) staticTabs?: TabsetComponent;

  @ViewChild(ModalAdvanceCbtComponent, { static: false })
  modalAdvance: ModalAdvanceCbtComponent;
  @ViewChild(ModalPaymentCbtComponent, { static: false })
  modalPayment: ModalPaymentCbtComponent;
  @ViewChild(ModalDriverFuelApprovalComponent, { static: false })
  modalDriverFuel: ModalDriverFuelApprovalComponent;
  @ViewChild(ModalExternalOilPurchasedComponent, { static: false })
  modalExternal: ModalExternalOilPurchasedComponent;
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent;
  @ViewChild(ModalDispatchorderRouteComponent, { static: false })
  modalRoute: ModalDispatchorderRouteComponent;
  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  constructor(
    private notificationService: NotificationService,
    private vihicleService: VihicleService,
    private employeeService: EmployeeService,
    private routeService: RouteService,
    private customertSerive: CustomerService,
    private _authService: AuthService,
    private otherCategoryService: OtherCategoriesService,
    private _utilityService: UtilityService,
    private feeService: FeeService,
    private tollStationService: TollStationService,
    private gasManagementService: GasManagementService,
    private service: CbtService,
    private shipmentService: ShipmentService,private _customerLocationService:CustomerLocationsService,
    private _customerRouteService:CustomerRoutesService

  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    
    const permiss: string[] =
      typeof this.userLoged.permissions == "string"
        ? JSON.parse(this.userLoged.permissions)
        : this.userLoged.permissions;
    this.closing_permission =
      permiss.findIndex((x) => x === "F003_CLOSING") != -1 || this.userLoged.isAdmin; 
    this.accept_permission =
      permiss.findIndex((x) => x === "F003_ACCEPT") != -1  || this.userLoged.isAdmin;
    this.isDriver=(this.userLoged.employeeId==this.entity?.driverId.toString() || this.userLoged.isAdmin || this.accept_permission)
    this.admin_permission = this.userLoged.isAdmin;
    if(!this.flagNew)this.isAccepted=(this.userLoged.isAdmin ||  Number.parseInt(this.userLoged.employeeId)==this.entity?.driverId);
    this.loadCustomer();
    this.loadEmployee();
    this.loadVihicleType();
    this.loadRoute();
    this.loadContType();
    this.loadFee();
    this.loadMooc();
    this.loadSurcharge();
    this.loadTollStation();
  }
  loadLocations(customerId:number){
    this.busy = this._customerLocationService.getAll(customerId,true).subscribe((res: ResponseValue<CustomerLocations[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listLocations = res.data
      }else this.listLocations=[];
    });
  }
  loadRoutes(customerId:number){
    this.busy = this._customerRouteService.getAll(customerId,true).subscribe((res: ResponseValue<CustomerLocations[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listRoutesCustomer = res.data
      }else this.listRoutesCustomer=[];
    });
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

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.customerCode = event.customerCode;
    this.customerName = event.customerName;
    this.entity.routeId=null;
    this.entity.pickupLocationId=null;
    this.entity.deliveryLocationId=null;
    this.loadLocations(this.customerId);
    this.loadRoutes(this.customerId);
  }
  searchCustomer() {
    let value = this.listCustomer.findIndex(
      (item) => item.customerCode.indexOf(this.customerCode) !== -1
    );
    if (value !== -1) {
      this.entity.customerId = this.listCustomer[value].id;
      this.customerId = this.listCustomer[value].id;
      this.customerCode = this.listCustomer[value].customerCode;
      this.customerName = this.listCustomer[value].customerName;
    } else {
      this.entity.customerId = 0;
      this.customerCode = "";
      this.customerId = 0;
      this.customerName = "";
    }
  }

  loadRoute() {
    const params = new HttpParams().set(
      "branchid",
      this.userLoged.branchId.toString()
    );
    this.routeService
      .getAll(params)
      .subscribe((res: ResponseValue<Route[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listRoute = res.data;
          this.listRoute.forEach((it) => {
            it.routeFullName = it.routeCode + " - " + it.routeName;
          });
        } else {
          this.listRoute = [];
        }
      });
  }
  routeChanged(item: DispatchOrderCbtRoutes, event: Route) {
    item.routeId = event?.id;
    item.routeCode = event?.routeCode;
    item.distance = event?.distance;
    this.calculateKm();
    this.calculateOil();
  }

  calculateKm(): void {
    this.entity.kmQuotaRoute = this.entity.listRoutes.reduce(
      (sum, currentObj) => sum + currentObj.distance,
      0
    );
    this.entity.kmQuota = this.entity.listRoutes.reduce(
      (sum, currentObj) => sum + currentObj.distance,
      0
    );
  }

  calculateOil(): void {
    this.entity.oilQuota = this.entity.listRoutes.reduce(
      (sum, currentObj) =>
        sum +
        this._utilityService.round2(
          (currentObj.distance * currentObj.oilQuota) / 100
        ),
      0
    );
  }

  calculateSum(): number {
    return this.entity.listEtcs.reduce(
      (sum, currentObj) => sum + currentObj.totalCost,
      0
    );
  }
  changeGenerator() {
    if (this.entity.generatorHours == null) this.entity.generatorHours = 0;
    if (this.entity.generatorOilQuota == null)
      this.entity.generatorOilQuota = 0;
    this.generatorOil =
      this.entity.generatorHours * this.entity.generatorOilQuota;
  }
  loadFee() {
    const params = new HttpParams().set("groupFeeId", "CP01");
    this.busy = this.feeService
      .getAll(params)
      .subscribe((res: ResponseValue<Fee[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listFee = res.data;
        }
      });
  }

  loadSurcharge() {
    const params = new HttpParams().set("type", "SURCHARGE");
    this.busy = this.otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<DispatchOrderSurcharge[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listSurcharge = res.data;
        }
      });
  }

  feeCodeEtcChanged(item: DispatchOrderEtc, event: Fee) {
    item.feeId = event?.id;
    item.feeCode = event?.feeCode;
    item.feeName = event?.feeName;
  }

  driver1Change(event: Employee) {
    this.entity.driverId = event?.id;
    this.entity.driverName = event?.employeeFullName;
    this.entity.driverTel = event?.telephone;
  }
  driver2Change(event: Employee) {
    this.entity.secondDriverId = event?.id;
    this.entity.secondDriverName = event?.employeeFullName;
    this.entity.secondDriverTel = event?.telephone;
  }

  loadVihicleType() {
    const params = new HttpParams().set("type", "VIHITYPE");
    this.busy = this.otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listVihicleType = res.data;
        }
      });
  }

  loadContType() {
    const params = new HttpParams().set("type", "CONTTYPE");
    this.busy = this.otherCategoryService
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

  loadCustomer(): void {
    const params = new HttpParams();
    this.busy = this.customertSerive
      .getAll(params)
      .subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.listCustomer = res.data;
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }

  getJobId() {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalListShipment.view(
        this.entity.customerId,
        Number.parseInt(this.userLoged.branchId),0
      );
    }, 50);
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

  loadDocumentType() {
    const params = new HttpParams().set("includeProcedure", "0");
    this.busy = this.otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listdocumentType = res.data;
        } else {
          if (res.code == "204") {
            this.listdocumentType = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  vihicleTypeChanged(event: OtherCategories) {
    this.vihicleTypeId = event?.id;
    this.loadVihicle(this.vihicleTypeId);
  }
  vihicleTypeChargeChanged(event: OtherCategories) {
    this.entity.vehicleTypeCharge = event?.id;
  }

  changeMooc(event: Vihicle) {
    this.entity.moocLicensePlates = event?.licensePlates;
  }

  add() {
    this.gasManagementService
      .getOldValue(this.userLoged.branchId)
      .subscribe((res: ResponseValue<GasManagement>) => {
        if (res.code == "200" || res.code == "201") {
          this.gasValue = res.data;
          this.entity = {
            checked: false,
            oilQuota: 0,
            status: 0,
            oilPrice: this.gasValue.cost,
            kmQuota: 0,
            startVehicleOdor: 0,
            finishVehicleOdor: 0,
            volume: 0,
            generatorHours: 0,
            generatorOilQuota: 0,
            oilCompensation: 0,
            totalAdvance: 0,
            totalDriverFuelApproval: 0,
            totalExternalOilPurchased: 0,
            totalEtc: 0,
            totalPayment: 0,
            listRoutes: [],
            listEtcs: [],
            kmQuotaRoute:0
          };
          // this.entity.listDispatchOrderFee.push(feeItem);
          this.flagNew = true;
          this.flagXem = false;
          this.flagSave = false;
          this.modalDispatchOrderAddEdit.show();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }


  //Đoạn này dùng để import excel file ETC
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

        //debugger;
        for (var i = 2; i < this.data1.length; i++) {
          let v1 = this.data1[i];
          if (v1) {
            let item: DispatchOrderCbtEtc = {
              refNo: this.entity.refNo,
              tollStationId: v1[0] != null ? Number.parseInt(v1[0]) : 0,
              feeId: 659,
              cost: v1[3] != null ? Number.parseInt(v1[3]) : 0,
              vat: v1[4] != null ? Number.parseInt(v1[4]) : 0,
              totalCost: v1[5] != null ? Number.parseInt(v1[5]) : 0,
              note: v1[6],
            };
            if (item.tollStationId != null) {
              this.entity.listEtcs.push(item);
              this.totalEtc += item.totalCost;
            }
          }
        }
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  showModalAdvance(item: AdvancesCbt) {
    this.viewAdvanceModal = true;
    setTimeout(() => {
      this.modalAdvance.edit(item.id.toString(), true);
    }, 50);
  }

  showModalPayemnt(item: PaymentCbt) {
    this.viewPaymentModal = true;
    setTimeout(() => {
      this.modalPayment.edit(item.id, true);
    }, 50);
  }

  showModalDriveFuel(item: DriverFuelApproval) {
    this.viewDriverFuel = true;
    setTimeout(() => {
      this.modalDriverFuel.edit(item.id, true, false);
    }, 50);
  }

  showModalExternal(item: ExternalOilPurchased) {
    this.viewExternal = true;
    setTimeout(() => {
      this.modalExternal.edit(item.id, true, false);
    }, 50);
  }
  
  totalMoney=0;

  calcutatorAll() {

    //Tính tổng tạm ứng đã được duyệt
    this.entity.totalAdvance = 0;
    this.entity.listAdvances.forEach((it) => {
      if (it.isPayment) this.entity.totalAdvance += it.amount;
    });
    //Tính tổng thanh toán đã được duyệt
    this.entity.totalPayment = 0;
    this.entity.listPayments.forEach((it) => {
      if (it.step == 2) this.entity.totalPayment += it.totalAmount;
    });
    //Tính tổng tiền mua dầu ngoài đã được duyệt
    this.entity.totalMoneyExternalOilPurchased = 0;
    this.entity.listExternalOilPurchased.forEach((it) => {
      if (it.status == 3)
        this.entity.totalMoneyExternalOilPurchased += it.amountAfterVat;
    });
    //Tính tổng dầu cấp phiếu đã được duyệt
    this.entity.totalDriverFuelApproval = 0;
    this.entity.listFuelApprovals.forEach((it) => {
      if (it.status == 2)
        this.entity.totalDriverFuelApproval += it.quantityIgas;
    });
    //Tính tổng dầu mua dầu ngoài tiền mặt đã được duyệt
    this.entity.totalExternalOilPurchased = 0;
    this.entity.listExternalOilPurchased.forEach((it) => {
      if (it.status == 3) this.entity.totalExternalOilPurchased += it.quantity;
    });
    this.totalMoney=this.entity.totalAdvance-this.entity.totalPayment -this.entity.totalMoneyExternalOilPurchased;
  }

  edit(id: string, flag: boolean) {
    this.service
      .getDetail(id)
      .subscribe((res: ResponseValue<DispatchOrderCbt>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.loadLocations(this.entity.customerId);
          this.loadRoutes(this.entity.customerId);
          this.vihicleTypeId = this.entity.vihicleType;
          this.customerCode = this.entity.customerCode;
          this.totalEtc = this.calculateSum();
          this.changeGenerator();
          this.calcutatorAll();
          this.loadVihicle(this.vihicleTypeId);
          this.flagXem = flag;
          this.flagSave = false;
          //Kiểm tra nếu là edit thì check tiếp quyền có quyền duyệt hay không?, nếu có quyền duyệt thì cho edit hết, ko thì kiểm tra xem có phải là người tạo không
          if (!this.flagXem) {
            if (
              !this.accept_permission &&
              this.userLoged.id != this.entity.createdBy
            )
              this.flagXem = true;
          }
          if (this.entity.departureTime) {
            this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.departureTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.departureTime = moment(this.entity.departureTime, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.timeTruckArrivesAtDeliveryPoint) {
            this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.timeTruckArrivesAtDeliveryPoint, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.timeTruckArrivesAtDeliveryPoint = moment(this.entity.timeTruckArrivesAtDeliveryPoint, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.timeTruckArrivesAtLoadingPoint) {
            this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.timeTruckArrivesAtLoadingPoint, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.timeTruckArrivesAtLoadingPoint = moment(this.entity.timeTruckArrivesAtLoadingPoint, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.timeTruckCompleteDelivery) {
            this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.timeTruckCompleteDelivery, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.timeTruckCompleteDelivery = moment(this.entity.timeTruckCompleteDelivery, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.timeTruckDepartsFromLoadingPoint) {
            this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.timeTruckDepartsFromLoadingPoint, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.timeTruckDepartsFromLoadingPoint = moment(this.entity.timeTruckDepartsFromLoadingPoint, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.timeTruckReturnToVietnam) {
            this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.timeTruckReturnToVietnam, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.timeTruckReturnToVietnam = moment(this.entity.timeTruckReturnToVietnam, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.timeTruckPassesThroughBorderGate) {
            this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.timeTruckArrivesAtLoadingPoint, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.timeTruckPassesThroughBorderGate = moment(this.entity.timeTruckPassesThroughBorderGate, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.startPluggingInTime) {
            this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.startPluggingInTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.startPluggingInTime = moment(this.entity.startPluggingInTime, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          if (this.entity.unpluggingTime) {
            this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
              new Date(moment(this.entity.unpluggingTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
            );
            this.entity.unpluggingTime = moment(this.entity.unpluggingTime, FormatContstants.DATETIMEEN).format(
              FormatContstants.DATETIMEVN
            );
          }
          this.modalDispatchOrderAddEdit.show();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  accept(flag:boolean):void{
    let copy = Object.assign({}, this.entity);
    let _ok = flag;
    if (!flag) {
      let retVal = prompt("Lý do từ chối", "");
      if (retVal) {
        _ok = true;
      }
      copy.feedback = retVal ?? "";
      copy.status = -1;
    } else {
      copy.status = 2;
    }
    if (_ok) {
    this.busy = this.service
      .updateState(copy)
      .subscribe((res: ResponseValue<Dispatchorder>) => {
        if (res.code == "200" || res.code == "201") {
          this.notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
          this.SaveSuccess.emit(res.data);
          this.modalDispatchOrderAddEdit.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
    }
  }
  

  checkValue(): boolean {
    //Kiểm tra xem các tạm ứng được duyệt/chi tiền hết chưa
    let reVal = true;
    let retMess='';
    this.entity.listAdvances.forEach((it) => {
      if (!it.isPayment) {
        reVal = false;
        retMess +='Tạm ứng chưa được chi tiền!' +'\n'
      }
    });
    //Kiểm tra xem còn thanh toán nào chưa duyệt không?
    this.entity.listPayments.forEach((it) => {
      if (it.step < 2) {
        reVal = false;
        retMess +='Thanh toán chưa được duyệt bước 2!' +'\n'
      }
    });
    //Kiểm tra xem còn phiếu cấp dầu xe nhà nào chưa duyệt không
    this.entity.listFuelApprovals.forEach((it) => {
      if (it.status < 2) {
        reVal = false;
        retMess +='Phiếu cấp dầu xe nhà chưa được chốt!' +'\n'
      }
    });
    //Kiểm tra xem còn phiếu mua dầu ngoài tiền mặt nào chưa duyệt bước 2 hay không
    this.entity.listExternalOilPurchased.forEach((it) => {
      if (it.status < 3) {
        reVal = false;
        retMess +='Phiếu mua dầu ngoài tiền mặt chưa được duyệt bước 2!\n'
      }
    });
    //Kiểm tra xem tổng tiền có khớp không
    if (
      this.entity.totalAdvance -
        this.entity.totalPayment -
        this.entity.totalMoneyExternalOilPurchased !=
      0
    )
      {
        reVal = false;
        retMess +='Tổng tiền tạm ứng/thanh toán chưa khớp!' +'\n'
      }
    //Kiểm tra xem tổng dầu có khớp không
    console.log(this.entity.totalDriverFuelApproval+this.entity.totalExternalOilPurchased);
    console.log(this.generatorOil + this.entity.oilQuota + this.entity.oilCompensation);
    debugger;
    if 
     (Math.round(((this.entity.totalDriverFuelApproval + this.entity.totalExternalOilPurchased) 
               - (this.generatorOil + this.entity.oilQuota + this.entity.oilCompensation)) * 1000) / 1000 !== 0) 
  // xử lý
      {
        reVal = false;
        retMess +='Tổng hợp dầu chưa khớp!' +'\n'
      }
    if(!reVal){
      this.notificationService.printAlert(MessageContstants.TITLE_INFO,retMess)
      return reVal;
    }else{
       return reVal;
    }
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      //Check xem phần định mức dầu có cái nào =0 không
        if(this.entity.listRoutes.length>0){
          this.entity.listRoutes.forEach(it=>{
            if(it.oilQuota<1){
              this.notificationService.printAlert(MessageContstants.TITLE_INFO,
                "Định mức dầu cho cung đường phải lớn hơn 0, kiểm tra lại!"
              );
              return;
            }
          })
        }
        this.flagSave = true;
        if (this.flagNew) {
          this.entity.branchId = Number.parseInt(this.userLoged.branchId);
          this.entity.createdBy = this.userLoged.id;
          this.service.add(this.entity).subscribe(
            (res: ResponseValue<any>) => {
              if (res.code == "200" || res.code == "201") {
                this.modalDispatchOrderAddEdit.hide();
                form.resetForm();
                this.notificationService.printSuccessMessage(
                  MessageContstants.CREATED_OK_MSG
                );
                this.SaveSuccess.emit(res.data);
              } else {
                this.notificationService.printErrorMessage(
                  MessageContstants.CREATED_ERR_MSG + res.code + '\n' + res.message
                );
                this.flagSave = false;
              }
            },
            () => {
              this.flagSave = false;
            }
          );
        } else {
          this.service.update(this.entity).subscribe(
            (res: ResponseValue<any>) => {
              if (res.code == "200" || res.code == "201") {
                this.modalDispatchOrderAddEdit.hide();
                form.resetForm();
                this.notificationService.printSuccessMessage(
                  MessageContstants.UPDATED_OK_MSG
                );
                this.SaveSuccess.emit(res.data);
              } else {
                this.notificationService.printErrorMessage(
                  MessageContstants.UPDATED_ERR_MSG + res.code+ '\n' + res.message
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

  changeVihicle(event: Vihicle) {
    this.entity.vihicleId = event?.id;
    this.entity.vihiclelLicensePlates = event?.licensePlates;
  }

  saveSuccessJobId(event: Shipment) {
    this.entity.shipmentId = event?.id;
    this.entity.jobId = event?.jobId;
  }

  selectedtimeTruckArrivesAtLoadingPoint(event) {
    this.entity.timeTruckArrivesAtLoadingPoint = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedtimeTruckArrivesAtLoadingPoint(event) {
    if (this.entity.timeTruckArrivesAtLoadingPoint == null)
      this.entity.timeTruckArrivesAtLoadingPoint = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY HH:mm:ss");
  }
  selectedtimeTruckPassesThroughBorderGate(event) {
    this.entity.timeTruckPassesThroughBorderGate = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedtimeTruckPassesThroughBorderGate(event) {
    if (this.entity.timeTruckPassesThroughBorderGate == null)
      this.entity.timeTruckPassesThroughBorderGate = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY HH:mm:ss");
  }
  selectedtimeTruckArrivesAtDeliveryPoint(event) {
    this.entity.timeTruckArrivesAtDeliveryPoint = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedtimeTruckArrivesAtDeliveryPoint(event) {
    if (this.entity.timeTruckArrivesAtDeliveryPoint == null)
      this.entity.timeTruckArrivesAtDeliveryPoint = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY HH:mm:ss");
  }
  selectedtimeTruckReturnToVietnam(event) {
    this.entity.timeTruckReturnToVietnam = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedtimeTruckReturnToVietnam(event) {
    if (this.entity.timeTruckReturnToVietnam == null)
      this.entity.timeTruckReturnToVietnam = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY HH:mm:ss");
  }

  selectedtimeTruckCompleteDelivery(event) {
    this.entity.timeTruckCompleteDelivery = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedtimeTruckCompleteDelivery(event) {
    if (this.entity.timeTruckCompleteDelivery == null)
      this.entity.timeTruckCompleteDelivery = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY HH:mm:ss");
  }
  selectedtimeTruckDepartsFromLoadingPoint(event) {
    this.entity.timeTruckDepartsFromLoadingPoint = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedtimeTruckDepartsFromLoadingPoint(event) {
    if (this.entity.timeTruckDepartsFromLoadingPoint == null)
      this.entity.timeTruckDepartsFromLoadingPoint = moment(
        event.oldStartDate
      ).format("DD/MM/YYYY HH:mm:ss");
  }
  selectedstartPluggingInTime(event) {
    this.entity.startPluggingInTime = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedstartPluggingInTime(event) {
    if (this.entity.startPluggingInTime == null)
      this.entity.startPluggingInTime = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }
  selectedunpluggingTime(event) {
    this.entity.unpluggingTime = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closedunpluggingTime(event) {
    if (this.entity.unpluggingTime == null)
      this.entity.unpluggingTime = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }
  selecteddepartureTime(event) {
    this.entity.departureTime = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }
  closeddepartureTime(event) {
    if (this.entity.deleted == null)
      this.entity.departureTime = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }


  changeCustomer(event: Supplier) {
    this.customerId = event?.id;
    this.loadShipment();
  }

  loadShipment(): void {
    if (this.customerId == null) return;
    if (
      this._shipmentId != undefined &&
      this._shipmentId != null &&
      this._shipmentId != 0
    ) {
      this.shipmentService
        .getDetail(this._shipmentId.toString())
        .subscribe((res: ResponseValue<Shipment>) => {
          let item: Shipment = res.data;
          this.listShipments = [];
          this.listShipments.push({ id: item.id, jobId: item.jobId });
        });
    } else {
      const params = new HttpParams()
        .set("branchId", this._branchId?.toString())
        .set("customerId", this._customerId?.toString());
      this.shipmentService
        .getForDebitNotes(params)
        .subscribe((res: ResponseValue<Shipment[]>) => {
          this.listShipments = res.data;
        });
    }
  }

  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "CBT01",
      functionName: "CBT01",
      refNo: this.entity.refNo,
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  newEtc() {
    let item: DispatchOrderEtc = {
      cost: 0,
      vat: 0,
      feeId: environment.tollFeeId,
    };
    this.entity.listEtcs.push(item);
  }


  deleteEtc(index: number) {
    this.entity.listEtcs.splice(index, 1);
    this.totalEtc = this.calculateSum();
  }

  finishDispatchOrder(){
    if(!this.checkValue()){
      return;
    }else{
      this.updateState(1);
    }
  }

  updateState(type: number) {
    var item = Object.assign({}, this.entity);
    item.status = type;
    this.busy = this.service
      .updateState(item)
      .subscribe((res: ResponseValue<Dispatchorder>) => {
        if (res.code == "200" || res.code == "201") {
          this.notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
          this.SaveSuccess.emit(res.data);
          this.modalDispatchOrderAddEdit.hide();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
  }

  duyetchotlenh() {
    this.notificationService.printConfirmationYesNo(
      "Duyệt chốt lệnh vận chuyển hay không?",
      () => {
        this.updateState(3);
      },
      () => {}
    );
  }

  newRoute() {
    let item: DispatchOrderCbtRoutes = {
      oilQuota: 0,
    };
    this.entity.listRoutes.push(item);
  }


  viewJob(id: number): void {
    this.viewJobModal = true;
    setTimeout(() => {
      this.modalJob.edit(id.toString(), true);
    }, 0);
  }

  deleteRoute(item: Dispatchorderroutes) {
    let index = this.entity.listRoutes.indexOf(item);
    if (index !== -1) {
      this.entity.listRoutes.splice(index, 1);
      
    }
  }

  calculateRoute(){
    //tính toán lại tổng km
    if (this.entity.listRoutes.length > 0) {
      this.entity.kmQuota = 0;
      this.entity.oilQuota=0;
      this.entity.listRoutes.forEach((item) => {
        this.entity.kmQuota += item.distance;
        this.entity.oilQuota+= (item.distance * this._utilityService.round2(item.oilQuota/100))
      });
    }
  }
  calulateGenreatorOil(){//Tính toán lại dầu máy phát
    if(this.entity.generatorHours>0 && this.entity.generatorOilQuota>0){
      this.generatorOil=this.entity.generatorHours*this.entity.generatorOilQuota;
    }else this.generatorOil=0
  }
  calulateOil(){//Tính toán lại dầu máy phát
    if(this.entity.kmQuota>0){
      this.entity.oilQuota+= (this.entity.kmQuota * this._utilityService.round2(this.entity.kmQuota/100))
    }else this.entity.oilQuota=0
  }
  changeCost(item: DispatchOrderCbtEtc) {
    item.totalCost = item?.cost + item?.vat;
  }
  //Kiểm tra xem có tồn tại route nào của khách hàng có điểm giao và điểm nhận không, nếu ko thì cảnh báo
  checkCustomerRoute(){
    // this.entity.routeId=null;
    // if(this.entity.pickupLocationId>0 && this.entity.deliveryLocationId>0){
    //   this.listRoutesCustomer.forEach(it=>{
    //     if(it.startLocationId==this.entity.pickupLocationId && it.finishLocationId==this.entity.deliveryLocationId
    //       || it.finishLocationId==this.entity.pickupLocationId && it.startLocationId==this.entity.deliveryLocationId
    //     )
    //     {
    //       this.entity.routeId=it.id;
    //       this.entity.kmQuotaRoute=it.distance;
    //       this.entity.kmQuota=it.distance;
    //     }
    //   });
    //   if(this.entity.routeId==null){
    //   this.notificationService.printAlert("Thông báo","Không tìm thấy cung đường tương ứng với điểm nhận/trả hàng, kiểm tra lại!")
    //   return;
    // }
    // }
    
  }

  saveSuccessRoute(value): void {
    value.forEach((item) => {
      if (
        this.entity.listRoutes.findIndex((x) => x.routeId == item.routeId) < 0
      ) {
        this.entity.listRoutes.push(item);
      }
    });
    this.calculateRoute();
  }

  closeAdvanceModal(): void {
    this.viewAdvanceModal = false;
  }
  closePaymentModal(): void {
    this.viewPaymentModal = false;
  }
  closeDriverFuel(): void {
    this.viewDriverFuel = false;
  }
  closeExternall(): void {
    this.viewExternal = false;
  }
  closeModalRoute(): void {
    this.viewRoute = false;
  }
  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }

  closeModalJob() {
    this.viewJobModal = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
