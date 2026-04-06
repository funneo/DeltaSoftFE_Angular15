import { GarageDeltaServiceService } from './../../../services/customer-communicate/app-garage-delta/garage-delta-service.service';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { DispatchOrderEtc, DispatchOrderMonthlyticket, DispatchOrderTicket, Employee, Fee, OtherCategories, Profile, ResponseValue, Route, Workflow } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { Supplier } from '@app/shared/models/supplier';
import { Vihicle } from '@app/shared/models/vihicle';
import { AuthService, EmployeeService, FeeService, NotificationService, OtherCategoriesService, UtilityService, WorkflowsService } from '@app/shared/services';
import { RouteService } from '@app/shared/services/route.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Tollroute } from '@app/shared/models/tollroute.model';
import { Quotationsubcontractors } from '@app/shared/models/transports/quotationsubcontractors.model';
import { Dispatchorderdetailed } from '@app/shared/models/transports/dispatchorders/dispatchorderdetailed';
import { Dispatchorderroutes } from '@app/shared/models/transports/dispatchorders/dispatchorderroutes';
import { QuotationsubcontractorsService } from '@app/shared/services/quotationsubcontractors.service';
import { ModalDispatchorderWorkflowComponent } from '../modal-dispatchorder-workflow/modal-dispatchorder-workflow.component';
import { ModalDispatchorderRouteComponent } from '../modal-dispatchorder-route/modal-dispatchorder-route.component';
import { TollrouteService } from '@app/shared/services/tollroute.service';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { Quotationsubcontractorsdetailed } from '@app/shared/models/transports/quotationsubcontractorsdetailed.model';
import { DispatchOrderPurchasePrice } from '@app/shared/models/transports/dispatchorders/dispatch-order-purchase-price';
import { DispatchOrderFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-fee';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalDispatchorderTicketComponent } from '../modal-dispatchorder-ticket/modal-dispatchorder-ticket.component';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { TollStation } from '@app/shared/models/toll-station.model';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { DispatchOrderAttachfiles } from '@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles';
import { environment } from '@environments/environment';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ModalViewWorkflowsComponent } from '../../workflows/modal-view-workflows/modal-view-workflows.component';
import { DispatchOrderSurcharge } from '@app/shared/models/transports/dispatchorders/dispatch-order-surcharge.model';
import { DispatchOrderParkingticket } from '@app/shared/models/transports/dispatchorders/dispatch-order-parkingticket.model';
import Permissions from "@app/shared/models/permissions.model";
import { GasManagementService } from '@app/shared/services/transports/gas-management.service';
import { GasManagement } from '@app/shared/models/transports/gas-management.model';
import { Router } from '@angular/router';
import { ModalShipmentComponent } from '../../shipments/modal-shipment/modal-shipment.component';
import { HandOver } from '@app/shared/models/customer-communicate/app-garage-delta/hand-over.model';
type AOA = any[][];
import * as XLSX from "xlsx";
import { Ports } from '@app/shared/models/danhmuc/ports.model';
import { PortsService } from '@app/shared/services/danhmuc/ports.service';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'modal-dispatchorder',
  templateUrl: './modal-dispatchorder.component.html',
  styleUrls: ['./modal-dispatchorder.component.css']
})
export class ModalDispatchorderComponent implements OnInit {
  public entity: Dispatchorder;
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
  public listFee: Fee[]
  public listQuotation: Quotationsubcontractors[] = [];
  public selectedItem: Dispatchorderdetailed = {};
  public listParking: DispatchOrderParkingticket[] = [];
  public flagOk: boolean = false;
  public selectdTicketIndex?: number;
  public selectdEtcIndex?: number;
  public selectdMonthlyTicketIndex?: number;
  public quotationDetailed: Quotationsubcontractorsdetailed;
  closing_permission: boolean = false;
  accept_permission: boolean = false;
  account_permission: boolean = false;
  job_locked: boolean = false;
  admin_permission = false;
  permission: Permissions;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
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
  public tollRouteCode?: string = '';
  maskNumber = UtilityService.maskNumber;
  public _gradeDriver = 0;
  public _evaluationDriver = '';

  gasValue: GasManagement;
  public busy: Subscription;
  km: number = 0;
  public listTollStation: TollStation[] = [];
  totalEtc = 0;
  listHandover: HandOver[];
  public listDieuchinh = Array.from({ length: 81 }, (_, i) => ({ id: 20 - i * 0.5 }));
  @Input() appFuncion: any;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalDispatchOrderAddEdit', { static: false }) modalDispatchOrderAddEdit: ModalDirective;
  @ViewChild(ModalShipmentComponent, { static: false }) modalJob: ModalShipmentComponent;
  @ViewChild('staticTabs', { static: false }) staticTabs?: TabsetComponent;
  @ViewChild(ModalViewWorkflowsComponent, { static: false }) modalViewWorkflows: ModalViewWorkflowsComponent
  @ViewChild(ModalDispatchorderWorkflowComponent, { static: false }) modalWorkflow: ModalDispatchorderWorkflowComponent
  @ViewChild(ModalDispatchorderRouteComponent, { static: false }) modalRoute: ModalDispatchorderRouteComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalDispatchorderTicketComponent, { static: false }) modalTicket: ModalDispatchorderTicketComponent
  constructor(private notificationService: NotificationService, private vihicleService: VihicleService
    , private employeeService: EmployeeService, private routeService: RouteService
    , private suppliertSerive: SupplierService, private workflowService: WorkflowsService
    , private _authService: AuthService
    , private otherCategoryService: OtherCategoriesService
    , private _utilityService: UtilityService
    , private otherService: OtherCategoriesService
    , private quotationsubService: QuotationsubcontractorsService
    , private tollRouteService: TollrouteService
    , private dispatchOrderService: DispatchordersService
    , private feeService: FeeService, private cdr: ChangeDetectorRef
    , private tollStationService: TollStationService, private garaService: GarageDeltaServiceService
    , private gasManagementService: GasManagementService, private router: Router, private exportExcelService: ExportService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    const permiss: string[] = typeof (this.userLoged.permissions) == "string" ? JSON.parse(this.userLoged.permissions) : this.userLoged.permissions;
    this.closing_permission = permiss.findIndex(x => x === 'DISPATCHORDER_CLOSING') != -1;
    this.accept_permission = permiss.findIndex(x => x === 'DISPATCHORDER_ACCEPT') != -1;
    this.account_permission = permiss.findIndex(x => x === 'DISPATCHORDER_ACCOUNT') != -1;
    this.admin_permission = this.userLoged.isAdmin;
    this.loadSupplier();
    this.loadEmployee();
    this.loadVihicleType();
    //this.loadTollRoute();
    this.loadContType();
    this.loadFee();
    this.loadMooc();
    this.loadSurcharge();
    this.loadTollStation();
    //this.loadHandover();
  }
  //Nếu thay đổi loại lệnh từ xe nhà qua xe ngoài hoặc ngược lại thì xóa hết dữ liệu của cái cũ đi
  changeSub() {
    if (!this.entity.isSubcontractors) {//Nếu là xe nhà thì xóa hết thông tin về NCC, xóa chi phí thuê ngoài
      this.entity.shippingUnitId = null;
      this.entity.shippingUnitCode = '';
      this.entity.shippingUnitName = '';
      this.entity.listDispatchOrderPurchasePrice = [];
    } else {
      //Xóa cung đường, xóa chi phí dầu
      this.entity.listDispatchOrderRoutes = [];
      var id = this.entity.listDispatchOrderFee.findIndex(item => item.feeId == 666);
      if (id >= 0) this.entity.listDispatchOrderFee.splice(id, 1);
      this.entity.driverId = null;
      this.entity.fuelDriverId = null;
    }
  }

  loadTollStation() {
    this.tollStationService.getAll().subscribe((res: ResponseValue<TollStation[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTollStation = res.data;
      }
    });
  }
  export() {
    this.exportExcelService.exportExcel(this.entity.listDispatchOrderRoutes, "cung-duong-lenh-vanchuyen");
  }
  calculateSum(): number {
    return this.entity.listDispatchOrderEtc.reduce((sum, currentObj) => sum + currentObj.totalCost, 0);
  }

  //Đoạn này lấy danh sách bàn giao phương tiện từ pm xưởng

  posts: ResponseValue<HandOver[]>;
  loadHandover() {
    this.garaService.getHandover().then(data => {
      this.posts = data;
      this.listHandover = this.posts.data;
    });
  }
  loadFee() {
    const params = new HttpParams()
      .set('groupFeeId', 'CP01')
    this.busy = this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      if (res.code == '200' || res.code == '201') {
        const filtered = res.data?.filter(_ => _.groupCode == 'CP01' || _.groupCode == 'CP02' || _.groupCode == 'CP03') || [];
        // Create completely new objects to prevent cache mutation
        this.listFee = filtered.map(fee => {
          const newFee: Fee = {
            id: fee.id,
            feeCode: fee.feeCode,
            feeName: fee.feeCode + '-' + fee.feeName,
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
      }
    });
  }

  loadSurcharge() {
    const params = new HttpParams()
      .set('type', 'SURCHARGE')
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<DispatchOrderSurcharge[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSurcharge = res.data
      }
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
    if (this.userLoged.branchId != '5') {
      this.entity.fuelDriverId = event?.id;
    }
    this.entity.driverName = event?.employeeFullName;
    this.entity.driverTel = event?.telephone;
  }
  driver2Change(event: Employee) {
    this.entity.secondDriverId = event?.id;
    this.entity.secondDriverName = event?.employeeFullName;
    this.entity.secondDriverTel = event?.telephone;
  }
  driver3Change(event: Employee) {
    this.entity.fuelDriverNae = event?.employeeFullName;
  }

  loadVihicleType() {
    const params = new HttpParams()
      .set('type', 'VIHITYPE')
    this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVihicleType = res.data
      }
    });
  }
  loadContType() {
    const params = new HttpParams()
      .set('type', 'CONTTYPE')
    this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listcontType = res.data
      }
    });
  }
  loadMooc() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
    this.busy = this.vihicleService.getAllMooc(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listMooc = res.data
      } else {
        if (res.code == "204") {
          this.listMooc = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadTollRoute(): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId)
      .set('supplierid', this.supplierId.toString())
    this.busy = this.tollRouteService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTollRoute = res.data;
      }
      else {
        if (res.code == "204") {
          this.listTollRoute = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
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

        //debugger;
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
              this.entity.listDispatchOrderEtc.push(item);
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
      .set('branchId', this.userLoged.branchId.toString())
    this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listEmployee = res.data;
        this.listDriver = this.listEmployee.filter(x => x.departmentId == 1147);
      }
      else {
        if (res.code == "204") {
          this.listEmployee = [];
          this.listDriver = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }
  loadQuotationDetailed() {
    if (this.supplierId > 0 && this.vihicleTypeId > 0 && this.tollRouteCode.length > 0) {
      const params = new HttpParams()
        .set('supplierid', this.supplierId.toString())
        .set('tollroutecode', this.tollRouteCode)
        .set('vihicletypeid', this.vihicleTypeId.toString())
      this.busy = this.quotationsubService.getQuotation(params).subscribe((res: ResponseValue<Quotationsubcontractorsdetailed>) => {
        if (res.code == '200' || res.code == '201') {
          this.quotationDetailed = res.data;
          this.entity.listDispatchOrderPurchasePrice = [];
          let item: DispatchOrderPurchasePrice = {
            contents: '',
            feeId: environment.subContractFee,
            cost: this.quotationDetailed.price,
            vat: this.quotationDetailed.vat,
            totalCost: this.quotationDetailed.totalPrice
          }
          this.entity.listDispatchOrderPurchasePrice.push(item);
        }
        else {
          if (res.code == "204") {
            this.notificationService.printErrorMessage("Không tìm thấy báo giá tương ứng!");
            this.entity.subcontractorsQuoteRouteCode = null;
            this.tollRouteCode = null;
            this.entity.listDispatchOrderPurchasePrice = [];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
          }
        }
      });
    }

  }
  loadVihicle(vihicletype: number): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', vihicletype.toString());
    this.busy = this.vihicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVihicle = res.data
      } else {
        if (res.code == "204") {
          this.listVihicle = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadDocumentType() {
    const params = new HttpParams()
      .set('includeProcedure', "0")
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listdocumentType = res.data
      } else {
        if (res.code == "204") {
          this.listdocumentType = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadPod() {
    let p: DispatchOrderAttachfiles = {
      refNo: this.entity.refNo,
      isPod: true
    }
    this.dispatchOrderService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPod = res.data;
      }
      else {
        this.listPod = [];
      }
    });
  }
  loadAttackFiles() {
    let p: DispatchOrderAttachfiles = {
      refNo: this.entity.refNo,
      isPod: false
    }
    this.dispatchOrderService.getAttachFile(p).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        this.listAttachFile = res.data;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  clickLink(item: DispatchOrderAttachfiles) {
    let url = environment.apiUrl + item.pathFile.replace('~', '');
    window.open(url, "_blank");
  }

  vihicleTypeChanged(event: OtherCategories) {
    this.vihicleTypeId = event?.id;
    if (!this.entity.isSubcontractors) this.loadVihicle(this.vihicleTypeId);
    if (this.entity.isSubcontractors) this.loadQuotationDetailed();
  }
  vihicleTypeChargeChanged(event: OtherCategories) {
    this.entity.vehicleTypeCharge = event?.id;
  }

  changeVihicle(event: Vihicle) {
    this.entity.oilQuota = event?.oilQuota;
    this.entity.vihiclelLicensePlates = event?.licensePlates;
    this.entity.driverId = event?.employeeId;
    let item = this.listDriver.find(it => it.id == event?.employeeId);
    this.entity.driverName = item?.employeeFullName;
    this.changedKmQuota();
    // let index=this.listHandover?.findIndex(it=>{
    //   Number.parseInt(it.vehicle_id_delta_erp)==event.id;
    // })

  }
  changeMooc(event: Vihicle) {
    this.entity.moocLicensePlates = event?.licensePlates;
  }
  changedKmQuota() {

    this.entity.listDispatchOrderFee.forEach(item => {
      if (item.feeId == environment.fuelFeeId && this.entity.oilQuota > 0) {
        item.quantity = Math.round((this.entity.kmQuota * 100 * (this.entity.oilQuota + this.entity.quotaAdjusted))) / 10000;
        item.vat = Math.round((this.entity.oilPrice / 11) * item.quantity);
        item.totalCost = item.quantity * (this.entity.oilPrice);
        item.cost = item.totalCost - item.vat;
      }
    });
  }

  add() {
    this.gasManagementService.getOldValue(this.userLoged.branchId).subscribe((res: ResponseValue<GasManagement>) => {
      if (res.code == '200' || res.code == '201') {
        this.gasValue = res.data;
        this.entity = {
          checked: false,
          oilQuota: 0,
          quotaAdjusted: 0,
          status: 0, oilPrice: this.gasValue.cost,
          kmQuota: 0, startVehicleOdor: 0, startEupOdor: 0, finishVehicleOdor: 0, finishEupOdor: 0,
          weight: 0, volume: 0, numberOfCont: 0, numberOfPackage: 0, numberOfPallet: 0, numberOfVihicle: 0,
          listDispatchOrderDetailed: [],
          listDispatchOrderRoutes: [],
          listDispatchOrderPurchasePrice: [],
          listDispatchOrderFee: [],
          listDispatchOrderSurcharge: [],
          fuelDriverId: (this.userLoged.branchId == '5' ? Number.parseInt(this.userLoged.employeeId) : 0),
        };
        // this.entity.listDispatchOrderFee.push(feeItem);
        this.flagNew = true;
        this.flagXem = false;
        this.flagSave = false;
        this.modalDispatchOrderAddEdit.show();
      }
      else {
        if (res.code == '204') {
          this.notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR)
        } else {
          this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
        }
      }
    });
  }

  changedKm() {
    if (this.entity.startVehicleOdor >= this.entity.finishVehicleOdor) return;
    this.dispatchOrderService.updateOdor(this.entity).subscribe((res: ResponseValue<Dispatchorder>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalDispatchOrderAddEdit.hide();
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  changedKmConfirm(): void {
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_UPDATE_ODOR_MSG, () => this.changedKm());
  }

  edit(id: string, flag: boolean) {
    this.dispatchOrderService.getDetail(id).subscribe((res: ResponseValue<Dispatchorder>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.entity.listDispatchOrderDetailed.forEach(item => {
          if (item.jobLocked) this.job_locked = true;
        })
        this.vihicleTypeId = this.entity.vihicleType;
        if (this.entity.isSubcontractors) {
          this.supplierId = this.entity.shippingUnitId
          this.tollRouteCode = this.entity.subcontractorsQuoteRouteCode
          this.loadTollRoute();
        };
        this.totalEtc = this.calculateSum();
        this._gradeDriver = this.entity.gradeDriver;
        this._evaluationDriver = this.entity.evaluationDriver;
        this.loadVihicle(this.vihicleTypeId);
        this.loadAttackFiles();
        this.loadPod();
        this.flagXem = flag;
        this.flagSave = false;
        //Kiểm tra nếu là edit thì check tiếp quyền có quyền duyệt hay không?, nếu có quyền duyệt thì cho edit hết, ko thì kiểm tra xem có phải là người tạo không
        if (!this.flagXem) {
          if (!this.userLoged.isAdmin && !this.accept_permission && this.userLoged.id != this.entity.createdBy) this.flagXem = true;
        }
        this.checkOk();
        if (this.entity.inquiryTimeToTheFactory) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.inquiryTimeToTheFactory = moment(this.entity.inquiryTimeToTheFactory, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.inquiryTimeToThePorts) {
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.inquiryTimeToThePorts = moment(this.entity.inquiryTimeToThePorts, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        this.modalDispatchOrderAddEdit.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveAndNew(form: NgForm) {
    if (form.valid) {
      if (this.endTime < this.startTime) {
        this.notificationService.printErrorMessage(MessageContstants.ENDTIME_NOT_LARGER_THAN_STARTTIME);
        return;
      }
      //Kiểm tra nếu có thông tin phí thuê ngoài và chi phí thì phải có thông tin về mã phí, tiền>0
      if (this.entity.listDispatchOrderPurchasePrice.length > 0) {
        if (this.entity.listDispatchOrderPurchasePrice[0].feeId < 1) {
          this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
          return;
        }
      }
      if (this.entity.listDispatchOrderFee.some(fee => fee.cost < 1)) {
        this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
        return;
      }
      //Kiểm tra nếu là lệnh thì phải có giá dầu
      if (!this.entity.isSubcontractors && this.entity.oilPrice < 1) {
        this.notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR);
        return;
      }
      //Kiểm tra xem định mức xe có chưa, nếu =0 thì báo lỗi
      if (!this.entity.isSubcontractors && this.entity.oilQuota < 1) {
        this.notificationService.printErrorMessage(MessageContstants.FUEL_QUOTA_ERROR);
        return;
      }
      //Kiểm tra xem phụ phí có không, nếu có thì phải có mã phụ phí và tiền
      if (this.entity.listDispatchOrderSurcharge.some(surcharge => surcharge.cost < 1)) {
        this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
        return;
      }
      this.flagSave = true;
      if (this.flagNew) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.dispatchOrderService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Xóa hết dữ liệu entity trừ giá dầu
            this.entity = {
              id: undefined,
              checked: false,
              oilQuota: 0,
              quotaAdjusted: 0,
              status: 0, oilPrice: this.gasValue.cost,
              kmQuota: 0, startVehicleOdor: 0, startEupOdor: 0, finishVehicleOdor: 0, finishEupOdor: 0,
              weight: 0, volume: 0, numberOfCont: 0, numberOfPackage: 0, numberOfPallet: 0, numberOfVihicle: 0,
              listDispatchOrderDetailed: [],
              listDispatchOrderRoutes: [],
              listDispatchOrderPurchasePrice: [],
              listDispatchOrderFee: [],
              listDispatchOrderSurcharge: [],
              listDispatchOrderTicket: [],
              listDispatchOrderEtc: [],
              listDispatchOrderMonthlyTicket: [],
              listDispatchOrderParkingTicket: []
            };
            this.flagOk = false;
            // this.entity.listDispatchOrderFee.push(feeItem);
            this.flagNew = true;
            this.flagXem = false;
            this.flagSave = false;
            this.cdr.detectChanges(); // Force Angular to update view
            this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.dispatchOrderService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Xóa hết dữ liệu entity trừ giá dầu
            this.entity = {
              id: undefined,
              checked: false,
              oilQuota: 0,
              quotaAdjusted: 0,
              status: 0, oilPrice: this.gasValue.cost,
              kmQuota: 0, startVehicleOdor: 0, startEupOdor: 0, finishVehicleOdor: 0, finishEupOdor: 0,
              weight: 0, volume: 0, numberOfCont: 0, numberOfPackage: 0, numberOfPallet: 0, numberOfVihicle: 0,
              listDispatchOrderDetailed: [],
              listDispatchOrderRoutes: [],
              listDispatchOrderPurchasePrice: [],
              listDispatchOrderFee: [],
              listDispatchOrderSurcharge: [],
              listDispatchOrderTicket: [],
              listDispatchOrderEtc: [],
              listDispatchOrderMonthlyTicket: [],
              listDispatchOrderParkingTicket: []
            };
            // this.entity.listDispatchOrderFee.push(feeItem);
            this.flagOk = false;
            this.flagNew = true;
            this.flagXem = false;
            this.flagSave = false;
            this.cdr.detectChanges(); // Force Angular to update view
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      if (this.endTime < this.startTime) {
        this.notificationService.printErrorMessage(MessageContstants.ENDTIME_NOT_LARGER_THAN_STARTTIME);
        return;
      }
      //Kiểm tra nếu có thông tin phí thuê ngoài và chi phí thì phải có thông tin về mã phí, tiền>0
      if (this.entity.listDispatchOrderPurchasePrice.length > 0) {
        if (this.entity.listDispatchOrderPurchasePrice[0].feeId < 1) {
          this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
          return;
        }
      }
      if (this.entity.listDispatchOrderFee.length > 0) {
        for (let i = 0; i < this.entity.listDispatchOrderFee.length; i++)
          if (this.entity.listDispatchOrderFee[i].cost < 1) {
            this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
            return;
          }
      }
      //Kiểm tra nếu là lệnh thì phải có giá dầu
      if (!this.entity.isSubcontractors && this.entity.oilPrice < 1) {
        this.notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR);
        return;
      }
      //Kiểm tra xem định mức xe có chưa, nếu =0 thì báo lỗi
      if (!this.entity.isSubcontractors && this.entity.oilQuota < 1) {
        this.notificationService.printErrorMessage(MessageContstants.FUEL_QUOTA_ERROR);
        return;
      }
      this.flagSave = true;
      if (this.flagNew) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.dispatchOrderService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalDispatchOrderAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        //Kiểm tra xem phụ phí có không, nếu có thì phải có mã phụ phí và tiền
        if (this.entity.listDispatchOrderSurcharge.length > 0) {
          for (let i = 0; i < this.entity.listDispatchOrderSurcharge.length; i++)
            if (this.entity.listDispatchOrderSurcharge[i].cost < 1) {
              this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
              return;
            }
        }
        this.dispatchOrderService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalDispatchOrderAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  evaluation() {
    let item = Object.assign({}, this.entity);
    item.gradeDriver = this._gradeDriver;
    item.evaluationDriver = this._evaluationDriver;
    this.dispatchOrderService.evaluationDriver(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalDispatchOrderAddEdit.hide();
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
        this.flagSave = false;
      }
    }, () => {
      this.flagSave = false;
    });
  }

  onChangeFee(event: any, item: any): void {
    if (event && !event.status) {
      this.notificationService.printAlert("Lỗi nhập liệu", "Mã phí đã bị khóa, không được sử dụng")
      setTimeout(() => {
        item.feeId = null;
      });
      this.cdr.detectChanges();
    } else {
      item.feeId = event?.id;
    }
  }

  selectedNgaybatdau(event) {
    this.entity.inquiryTimeToTheFactory = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdau(event) {
    if (this.entity.inquiryTimeToTheFactory == null)
      this.entity.inquiryTimeToTheFactory = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selectedNgayhoanthanh(event) {
    this.entity.inquiryTimeToThePorts = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgayhoanthanh(event) {
    if (this.entity.inquiryTimeToThePorts == null)
      this.entity.inquiryTimeToThePorts = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  changeSupplier(event: Supplier) {
    this.supplierId = event?.id;
    this.loadTollRoute();
    this.loadQuotationDetailed();
  }
  changeTollRouteCode(event: Tollroute) {
    this.tollRouteCode = event?.tollRouteCode;
    this.loadQuotationDetailed();
  }
  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'DISPATCHORDERS',
      functionName: 'DISPATCHORDERS',
      refNo: this.entity.refNo
    }
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
      feeId: item.feeId
    };
    this.viewTicket = true;
    setTimeout(() => {
      this.modalTicket.edit(nItem);
    }, 50);
  }
  newEtc() {
    let item: DispatchOrderEtc = {
      cost: 0,
      vat: 0, feeId: environment.tollFeeId
    }
    this.entity.listDispatchOrderEtc.push(item);
  }
  newParking() {
    let item: DispatchOrderParkingticket = {
      cost: 0,
      vat: 0, feeId: environment.parkingFeeId
    }
    this.entity.listDispatchOrderParkingTicket.push(item);
  }
  newSurcharge() {
    let item: DispatchOrderSurcharge = {
      cost: 0,
    }
    this.entity.listDispatchOrderSurcharge.push(item);
  }
  newMonthlyTicket() {
    let item: DispatchOrderMonthlyticket = {
      feeId: environment.tollFeeId
    }
    this.entity.listDispatchOrderMonthlyTicket.push(item);
  }
  deleteMonthlyTicket(index: number) {
    this.entity.listDispatchOrderMonthlyTicket.splice(index, 1);
  }

  deleteParkingTicket(index: number) {
    this.entity.listDispatchOrderParkingTicket.splice(index, 1);
  }

  deleteEtc(index: number) {
    this.entity.listDispatchOrderEtc.splice(index, 1);
  }
  deleteTicket(index: number) {
    this.entity.listDispatchOrderTicket.splice(index, 1);
  }

  deleteSurcharge(index: number) {
    this.entity.listDispatchOrderSurcharge.splice(index, 1);
  }
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      let p: DispatchOrderAttachfiles = {
        refNo: this.entity.refNo,
        isPod: true
      }
      const file = event.target.files[0];
      this.busy = this.dispatchOrderService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPod = res.data;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
        }
      });
    }
  }
  deleteAttachFile(item: DispatchOrderAttachfiles) {
    this.busy = this.dispatchOrderService.deleteAttachFile(item).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadAttackFiles();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
      }
    });
  }
  onAttachFileChanged(event) {
    if (event.target.files.length > 0) {
      let p: DispatchOrderAttachfiles = {
        refNo: this.entity.refNo,
        isPod: false
      }
      const file = event.target.files[0];
      this.busy = this.dispatchOrderService.addAttachFile(p, file).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listAttachFile = res.data;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
        }
      });
    }
  }
  changedSurcharge(item: DispatchOrderSurcharge, event: OtherCategories) {
    item.surchargeName = event?.categoryName;
  }
  updateState(type: number) {
    var item = Object.assign({}, this.entity)
    item.status = type

    this.busy = this.dispatchOrderService.updateState(item).subscribe((res: ResponseValue<Dispatchorder>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
        this.modalDispatchOrderAddEdit.hide();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }
  chotlenh() {
    this.notificationService.printConfirmationYesNo("Chốt lệnh vận chuyển hay không?", () => {
      //Kiểm tra nếu có thông tin phí thuê ngoài và chi phí thì phải có thông tin về mã phí, tiền>0
      if (this.entity.listDispatchOrderPurchasePrice.length > 0) {
        if (this.entity.listDispatchOrderPurchasePrice[0].feeId < 1) {
          this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
          return;
        }
      }
      if (this.entity.listDispatchOrderFee.length > 0) {
        for (let i = 0; i < this.entity.listDispatchOrderFee.length; i++)
          if (this.entity.listDispatchOrderFee[i].cost < 1) {
            this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
            return;
          }
      }
      //Kiểm tra nếu là lệnh thì phải có giá dầu
      if (!this.entity.isSubcontractors && this.entity.oilPrice < 1) {
        this.notificationService.printErrorMessage(MessageContstants.FUEL_REQUIED_ERROR);
        return;
      }
      if (this.entity.listDispatchOrderSurcharge.length > 0) {
        for (let i = 0; i < this.entity.listDispatchOrderSurcharge.length; i++)
          if (this.entity.listDispatchOrderSurcharge[i].cost < 1) {
            this.notificationService.printErrorMessage(MessageContstants.INPUT_DATA_NOT_VALID);
            return;
          }
      }
      //Nếu là dịch vụ thuê ngoài thì phải có chi phí
      if (this.entity.isSubcontractors && this.entity.listDispatchOrderPurchasePrice.length < 1) return;

      this.dispatchOrderService.update(this.entity).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.updateState(7);
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
          this.flagSave = false;
        }
      }, () => { });
    }, () => { });
  }
  duyetchotlenh() {
    this.notificationService.printConfirmationYesNo("Duyệt chốt lệnh vận chuyển hay không?", () => {
      this.updateState(8);
    }, () => { });
  }
  huychotlenh() {
    this.notificationService.printConfirmationYesNo("Hủy chốt lệnh?", () => {
      this.updateState(9);
    }, () => { });
  }
  newWorkflow() {
    this.viewWorkflow = true;
    setTimeout(() => {
      this.modalWorkflow.add();
    }, 50);
  }
  newRoute() {
    this.viewRoute = true;
    setTimeout(() => {
      this.modalRoute.add();
    }, 50);
  }
  newFee() {
    let item: DispatchOrderFee = {
      cost: 0,
      vat: 0, totalCost: 0
    }
    this.entity.listDispatchOrderFee.push(item);
  }
  checkOk() {
    if (this.entity.listDispatchOrderDetailed.length < 1 || (this.entity.listDispatchOrderRoutes.length < 1 && !this.entity.isSubcontractors)) {
      this.flagOk = false;
    } else { this.flagOk = true }
  }

  viewNhanviec(id: number): void {
    this.viewModalWorkflows = true;
    setTimeout(() => {
      this.modalViewWorkflows.edit(id.toString());
    }, 0);
  }
  viewJob(id: number): void {
    this.viewJobModal = true;
    setTimeout(() => {
      this.modalJob.edit(id.toString(), true);
    }, 0);
  }

  editWorkflow(item: Dispatchorderdetailed) {
    //Không dùng trực tiếp set giá trị = index của list vì khi update item sẽ update ngược lại list
    this.selectedItem = {
      workflowId: item.workflowId,
      jobId: item.jobId,
      contSeal: item.contSeal,
      note: item.note
    }
    this.viewWorkflow = true;
    setTimeout(() => {
      this.modalWorkflow.edit();
    }, 50);
  }
  deleteWorkflow(item: Dispatchorderdetailed) {
    let index = this.entity.listDispatchOrderDetailed.indexOf(item);
    if (index !== -1) {
      this.entity.listDispatchOrderDetailed.splice(index, 1);
    }
    this.checkOk();
    if (this.staticTabs?.tabs[0]) {
      this.staticTabs.tabs[0].active = true;
    }
  }

  deleteRoute(item: Dispatchorderroutes) {
    let index = this.entity.listDispatchOrderRoutes.indexOf(item);
    if (index !== -1) {
      this.entity.listDispatchOrderRoutes.splice(index, 1);
      if (this.entity.listDispatchOrderRoutes.length > 0) {
        this.entity.kmQuota = 0;
        this.entity.listDispatchOrderRoutes.forEach(item => {
          this.entity.kmQuota += item.distance;
        })
        this.changedKmQuota();
      }
    }
    this.checkOk();
  }
  deleteFee(item: DispatchOrderFee) {
    let index = this.entity.listDispatchOrderFee.indexOf(item);
    if (index !== -1) {
      this.entity.listDispatchOrderFee.splice(index, 1);
    }
    this.checkOk();
  }
  changeCost(item: DispatchOrderFee) {
    item.totalCost = item.cost! + item.vat;
  }

  saveSuccess(value): void {
    let index = this.entity.listDispatchOrderDetailed.findIndex(x => x.workflowId == value.workflowId);
    if (index >= 0) {
      this.entity.listDispatchOrderDetailed[index] = value;
    } else {
      this.entity.listDispatchOrderDetailed.push(value);
    }
    this.checkOk();
    if (this.staticTabs?.tabs[0]) {
      this.staticTabs.tabs[0].active = true;
    }
  }
  saveSuccessRoute(value): void {
    value.forEach(item => {
      if (this.entity.listDispatchOrderRoutes.findIndex(x => x.routeCode == item.routeCode) < 0) {
        this.entity.listDispatchOrderRoutes.push(item);
      }
    })
    if (this.entity.listDispatchOrderRoutes.length > 0) {
      this.entity.kmQuota = 0;
      this.entity.listDispatchOrderRoutes.forEach(item => {
        this.entity.kmQuota += item.distance;
      })
      this.changedKmQuota();
    }
    this.checkOk();
  }
  saveSuccessTicket(value): void {
    if (value.flagNew) {
      this.entity.listDispatchOrderTicket.push(value);
    } else {
      this.entity.listDispatchOrderTicket[value.index] = value;
    }
  }
  closeModal(): void {
    this.viewWorkflow = false;
  }
  closeModalRoute(): void {
    this.viewRoute = false;
  }
  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }
  closeModalTicket() {
    this.viewTicket = false;
  }
  closeModalWorkflows() {
    this.viewModalWorkflows = false;
  }
  closeModalJob() {
    this.viewJobModal = false;
  }
  OnHidden() {
    this.CloseModal.emit();
  }

}
