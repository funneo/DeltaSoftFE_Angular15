import { TransportCategory } from './../../../models/danhmuc/transport-category.model';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Customer, Employee, Handlinggroup, OtherCategories, Profile, ResponseValue, Shipment, ShipmentContSeal } from '@app/shared/models';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalShipmentViewSearchComponent } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { AuthService, CustomerService, EmployeeService, HandlinggroupService, NotificationService, OtherCategoriesService, ShipmentService, UtilityService } from '@app/shared/services';
import { TransportTypeConstants } from '@app/shared/constants/transport-type.constants';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import { HttpParams } from '@angular/common/http';
import { MessageContstants } from '@app/shared/constants';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { NgForm } from '@angular/forms';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { TransportCategoryService } from '@app/shared/services/danhmuc/transport-category.service';
import { CustomerLocationsService } from '@app/shared/services/danhmuc/customer-locations.service';
import { CustomerLocations } from '@app/shared/models/danhmuc/customer-locations.model';
import { ModalListContSealComponent } from '../../shipments/modal-list-cont-seal/modal-list-cont-seal.component';
import { PortsService } from '@app/shared/services/danhmuc/ports.service';
import { Ports } from '@app/shared/models/danhmuc/ports.model';


@Component({
  selector: 'modal-shipping-task-cs',
  templateUrl: './modal-shipping-task-cs.component.html',
  styleUrls: ['./modal-shipping-task-cs.component.css']
})
export class ModalShippingTaskCsComponent implements OnInit {
  public entity: ShippingTask;
  public flagXem: boolean = false;
  public flagNew: boolean = false;
  public flagOpMan = false;
  public flagSave: boolean = false;
  public userLoged: Profile;
  public startTime?: string;
  public endTime?: string;
  public checked?: boolean = false;
  public viewAttackFiles?: boolean = false;
  listTypeOfLiffingOrder: any[] = [{ id: 0, value: 'Điện tử' }, { id: 1, value: 'Giấy' }];
  /** Loại vận chuyển: 1 FCL / 2 LCL / 3 CBT (bắt buộc). */
  listTaskType = TransportTypeConstants.TASK_TYPES;
  /** Job đã có Loại vận chuyển → công việc lấy theo Job và khóa. */
  lockTaskType = false;
  get isLCL(): boolean { return this.entity?.taskType === TransportTypeConstants.LCL; }
  get isCBT(): boolean { return this.entity?.taskType === TransportTypeConstants.CBT; }
  /** FCL hoặc chưa chọn (form giữ nguyên như hiện nay). */
  get isFCL(): boolean { return !this.isLCL && !this.isCBT; }
  /** Cut-off: FCL chỉ hàng xuất (như cũ); LCL luôn hiện (không phân biệt xuất/nhập); CBT ẩn. */
  get showCutOff(): boolean { return this.isLCL || (this.isFCL && this.isEport); }
  listShipmentType: OtherCategories[];
  listContTypes: OtherCategories[];
  listImportExports: OtherCategories[];
  listTransportCategoryType: TransportCategory[] = [];
  viewSearchJobId = false;
  shipmentSelected: Shipment = {};
  customerName = '';
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayCutOff = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  inquiryTimeToThePorts = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  inquiryTimeToTheFactory = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  public listToughness: OtherCategories[];
  public listCustomer: Customer[];
  public listHandlingGroup: Handlinggroup[];
  public listShipment: Shipment[];
  public handlingGroupId?: number;
  public listContype: OtherCategories[] = [];
  public customerId?: number;
  public customerCode?: string;
  public jobgroupId?: number;
  public busy: Subscription;
  public listShipBrand: OtherCategories[];
  public listCFS: Ports[] = [];
  listEmployee: Employee[] = [];
  listLocations: CustomerLocations[] = [];
  viewContSeals: boolean = false;
  maskNumber = UtilityService.maskNumber;
  isEport = false;
  public dateFields = [
    { field: 'estimatedStartTime', optionField: 'ngaybatdauOption' },
    { field: 'estimatedFinishTime', optionField: 'ngayhoanthanhOption' },
    { field: 'pickupTime', optionField: 'ngayhoanthanhOption' },
    { field: 'deliveryTime', optionField: 'ngayhoanthanhOption' },
    { field: 'demurageTime', optionField: 'ngaybatdauOption' },
    { field: 'detentionTime', optionField: 'ngaybatdauOption' },
    { field: 'cutOffTime', optionField: 'ngaybatdauOption' }
  ];
  // ===== Chế độ xem/sửa/duyệt NHÁP (draft.DraftEntries) =====
  public _isDraftView: boolean = false;
  public _draftId?: number;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @Output() ApproveDraft: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  // @ViewChild(ModalWorkflowAttackFilesComponent, { static: false }) modalAttachFiles: ModalWorkflowAttackFilesComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent
  @ViewChild(ModalListContSealComponent, { static: false }) modalListContSeals: ModalListContSealComponent
  constructor(private notificationService: NotificationService
    , private handlingGroupService: HandlinggroupService, private customerService: CustomerService
    , private service: ShippingTaskService, private _authService: AuthService
    , private otherCategoryService: OtherCategoriesService
    , private _utilityService: UtilityService
    , private _transportCategoryService: TransportCategoryService
    , private _employeeService: EmployeeService
    , private _customerLocationService: CustomerLocationsService
    , private _portsService: PortsService
    , private _shipmentService: ShipmentService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadCustomer();
    this.loadHandlingGroup();
    this.loadOtherCategory();
    this.loadEmployee()
    this.loadPorts();
    //List danh sách các trường ngày tháng trong form

  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this.userLoged.branchId?.toString());
    this._employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listContTypes = res.data.filter(x => x.type === 'SHIPMENT_T04');
      this.listShipmentType = res.data.filter(x => x.type === 'SHIPMENT_T02');
      this.listImportExports = res.data.filter(x => x.type === 'SHIPMENT_T03');
      this.listToughness = res.data.filter(x => x.type === 'TOUGH');
      this.listShipBrand = res.data.filter(x => x.type === 'HANGTAU');
    });

  }

  listPorts: Ports[] = [];
  loadPorts(): void {
    // Lấy TẤT CẢ cảng — KHÔNG lọc chi nhánh: công việc của chi nhánh này vẫn lấy/trả hàng
    // ở cảng của chi nhánh khác. Chi nhánh chỉ để phân loại trong Danh mục Cảng/Bãi.
    this.busy = this._portsService.getAll().subscribe((res: ResponseValue<Ports[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPorts = res.data;
      } else this.listPorts = [];
      this._rebuildLocationItems();
    });
  }

  loadLocations(customerId: number) {
    this.busy = this._customerLocationService.getAll(customerId, true).subscribe((res: ResponseValue<CustomerLocations[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listLocations = res.data
      } else this.listLocations = [];
      this._rebuildLocationItems();
    });
  }

  loadCustomer(): void {
    const params = new HttpParams()
    this.busy = this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data.filter(x => x.locked === false);
      }
    });
  }
  loadHandlingGroup(): void {
    this.busy = this.handlingGroupService.getAll().subscribe((res: ResponseValue<Handlinggroup[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listHandlingGroup = res.data;
      }
      else {
        if (res.code == "204") {
          this.listHandlingGroup = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }


  add(item: ShippingTask, flag: boolean) {
    this._isDraftView = false;
    this.entity = item;
    this.entity.status = 0;
    this.lockTaskType = false;
    if (!flag) {
      this.customerId = item.customerId;
      this.customerCode = item.customerCode;
      this.customerName = item.customerName;
      this.loadLocations(this.customerId);
      this.isEport = this.entity.shipmentType == 1174;
      this.checked = this.entity.status > 0;
      this.dateFields.forEach(({ field, optionField }) => {
        this._utilityService.formatAndSetDateTime(this.entity, field, optionField);
      });
      this.entity.taskType = TransportTypeConstants.normalize(this.entity.taskType);
      this._applyJobTransportType(this.entity.shipmentId);
    } else {
      this.entity.jobToughness = 3
      this.listLocations = [];
      this.isEport = false;
      this.entity.taskType = null;   // CS bắt buộc chọn (hoặc lấy theo Job khi chọn JobId)
    }
    this._initLocationKeys();
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this._isDraftView = false;
    this.service.getDetail(id).subscribe((res: ResponseValue<ShippingTask>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        //this.flagSave = this.entity.status === 1;
        this.customerId = this.entity.customerId;
        this.loadLocations(this.customerId);
        this.customerCode = this.entity.customerCode;
        this.isEport = this.entity.shipmentType == 1174;
        this.checked = this.entity.status > 0;
        //Nếu lập lệnh VC rồi thì ko cho sửa nữa
        if (this.entity.refNo?.length > 0) this.flagXem = true;
        this._initLocationKeys();
        // Công việc cũ (0/NULL) GIỮ FCL, không tự đổi theo Job: đổi sang LCL/CBT sẽ xóa Số cont, Loại cont… khi lưu.
        const chuaPhanLoai = !this.entity.taskType;
        this.entity.taskType = TransportTypeConstants.normalize(this.entity.taskType);
        this.lockTaskType = false;
        if (!this.flagXem && !chuaPhanLoai) this._applyJobTransportType(this.entity.shipmentId);
        this.dateFields.forEach(({ field, optionField }) => {
          this._utilityService.formatAndSetDateTime(this.entity, field, optionField);
        });
        this.modalAddEdit.show();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }


  // ===== NHÁP: mở nháp ở chế độ SỬA ĐƯỢC (CS chỉnh trước khi duyệt) — nền vàng =====
  // silent=true: dựng entity từ payload cho DUYỆT HÀNG LOẠT (không show modal, không load dropdown).
  viewDraft(payload: string, draftId: number, silent: boolean = false) {
    this._isDraftView = true;
    this._draftId = draftId;
    let p: any = {};
    try { p = JSON.parse(payload ?? '{}'); } catch { }
    this.entity = p as ShippingTask;
    this.entity.id = undefined;          // ép promote tạo mới (BE cũng set Id=0)
    if (this.entity.status == null) this.entity.status = 0;
    this.customerId = this.entity.customerId;
    this.customerCode = this.entity.customerCode;
    this.customerName = this.entity.customerName;
    this.isEport = this.entity.shipmentType == 1174;
    this.lockTaskType = false;
    if (!this.entity.taskType) this.entity.taskType = null;   // nháp chưa có loại → CS bắt buộc chọn khi duyệt lẻ
    if (!silent) this._applyJobTransportType(this.entity.shipmentId);
    this.checked = this.entity.status > 0; // "Chuyển việc cho Điều vận" — nháp mặc định chưa giao
    // ⚠ KHÔNG dùng formatAndSetDateTime (parse EN MM/DD) — payload nháp là VN DD/MM/YYYY HH:mm:ss.
    // Parse khoan dung, GIỮ chuỗi VN (đúng định dạng CreateAsync ParseExact) + dựng option picker.
    this.dateFields.forEach(({ field, optionField }) => this._setupDraftDate(field, optionField));
    this.flagNew = false;
    this.flagXem = false;   // cho sửa
    this.flagSave = false;
    this._initLocationKeys();
    if (!silent) {
      this._ensureDraftCustomer();
      if (this.customerId) this.loadLocations(this.customerId);
      this.modalAddEdit.show();
    }
  }

  /** Duyệt nháp KHÔNG confirm/toast — trả Observable cho DUYỆT HÀNG LOẠT. Bulk luôn status=0 (chưa giao Điều vận). */
  approveDraftSilent() {
    this.entity.status = this.checked ? 1 : 0;
    this._clearHiddenFields();
    return this.service.addFromDraft(this.entity, this._draftId, this.entity.jobId);
  }

  /**
   * Ngày nháp: parse khoan dung (ƯU TIÊN VN dd/MM/yyyy), chuẩn hóa về `DD/MM/YYYY HH:mm:ss`
   * (đúng định dạng BE `CreateAsync` ParseExact) + dựng option cho daterangepicker.
   * Thay cho `formatAndSetDateTime` (chỉ parse EN MM/DD → làm hỏng chuỗi VN của payload).
   */
  private _setupDraftDate(field: string, optionField: string) {
    const raw = (this.entity as any)[field];
    if (!raw) { (this.entity as any)[field] = null; return; }
    const m = moment(raw, ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY', moment.ISO_8601, 'MM/DD/YYYY HH:mm:ss'], true);
    if (!m.isValid()) { (this.entity as any)[field] = null; return; }
    (this.entity as any)[field] = m.format('DD/MM/YYYY HH:mm:ss');
    (this as any)[optionField] = this._utilityService.dateTimeOptionDays(m.toDate(), true);
  }

  /** Bơm KH của nháp vào listCustomer nếu ngoài phạm vi người duyệt (giống các modal draft khác). */
  private _ensureDraftCustomer() {
    if (!this.customerId) return;
    const exists = (this.listCustomer || []).some(c => c.id === this.customerId);
    if (!exists) {
      this.listCustomer = [
        { id: this.customerId, customerCode: this.customerCode, customerName: this.customerName || '(KH của nháp)', locked: false } as Customer,
        ...(this.listCustomer || [])
      ];
    }
  }

  /** Duyệt nháp → tạo chuyến thật. entity.status = checked?1:0 (CS tự quyết giao Điều vận). */
  approveDraft() {
    if (!this.entity?.shipmentId) {
      this.notificationService.printErrorMessage('Nháp thiếu Lô hàng — không thể duyệt.');
      return;
    }
    this.notificationService.printConfirmationDialog(
      'Xác nhận chuyển nháp này thành chuyến thật trên ERP?',
      () => {
        this.flagSave = true;
        this.approveDraftSilent().subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.notificationService.printSuccessMessage(
              res.data?.alreadyPromoted ? 'Nháp này đã được duyệt trước đó.' : MessageContstants.CREATED_OK_MSG
            );
            this.modalAddEdit.hide();
            this.ApproveDraft.emit(this._draftId);
          } else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code + '\n' + res.message);
            this.flagSave = false;
          }
        }, () => { this.flagSave = false; });
      }
    );
  }

  saveChange(form: NgForm) {
    if (this._isDraftView) return;   // xem/sửa nháp → dùng nút "Xác nhận chuyển sang ERP", chặn Enter tạo thật
    if (form.valid) {
      if (this.endTime < this.startTime) {
        this.notificationService.printErrorMessage(MessageContstants.ENDTIME_NOT_LARGER_THAN_STARTTIME);
        return;
      }
      this.entity.status = this.checked ? 1 : 0;
      this._clearHiddenFields();
      this.flagSave = true;
      //Nếu là tạo mới công việc thì id chưa khởi tạo
      if (this.entity.id == undefined) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code + '\n' + res.message);
            this.flagSave = false;
          }
        });
      }
      else {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.updatedBy = this.userLoged.id;
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
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

  saveAndNew(form: NgForm) {
    if (this._isDraftView) return;   // chặn Enter/lưu-thêm khi đang xem/sửa nháp
    if (form.valid) {
      if (this.endTime < this.startTime) {
        this.notificationService.printErrorMessage(MessageContstants.ENDTIME_NOT_LARGER_THAN_STARTTIME);
        return;
      }
      this.flagSave = true;
      this.entity.status = this.checked ? 1 : 0;
      this._clearHiddenFields();
      //Nếu là tạo mới công việc thì id chưa khởi tạo
      if (this.entity.id == undefined) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Đoạn này xóa hết các dữ liệu hiện có sau khi thêm mới thành công
            this.entity.id = undefined;
            this.entity.handlingGroupId = null;
            this.entity.estimatedStartTime = null;
            this.entity.estimatedFinishTime = null;
            this.notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.flagNew = true;
            this.flagSave = false;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code + '\n' + res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.updatedBy = this.userLoged.id;
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            //Update xong thì xóa hết entity đi để tạo mới
            this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.entity.id = undefined;
            this.entity.customerId = null;
            this.entity.jobId = null;
            this.entity.handlingGroupId = null;
            this.entity.jobToughness = null;
            this.entity.estimatedStartTime = null;
            this.entity.estimatedFinishTime = null;
            this.entity.taskType = null;
            this.lockTaskType = false;
            this.customerCode = null
            this.flagNew = true;
            this.flagSave = false;
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

  // ===== Điểm nhận/giao: 1 ô chọn gộp Cảng/bãi/CFS + Location KH (mọi loại, không đảo theo xuất/nhập) =====
  /** Id của Ports và CustomerLocations trùng số nhau → khóa chọn = "<loại>-<id>". */
  locationItems: { key: string, id: number, type: number, name: string, group: string }[] = [];
  pickupKey: string = null;
  deliveryKey: string = null;

  changePickupLocation(item: any) {
    this.entity.pickupLocationId = item?.id;
    this.entity.pickupLocationType = item?.type;
    this.entity.pickupLocation = item?.name;
  }
  changeDeliveryLocation(item: any) {
    this.entity.deliveryLocationId = item?.id;
    this.entity.deliveryLocationType = item?.type;
    this.entity.deliveryLocation = item?.name;
  }

  /** Công việc/nháp chưa lưu loại điểm → suy theo luật cũ (SE: nhận = Location KH, giao = Cảng), rồi dựng khóa chọn. */
  private _initLocationKeys() {
    const e = this.entity;
    if (e?.pickupLocationId && !e.pickupLocationType) e.pickupLocationType = this.isEport ? 1 : 2;
    if (e?.deliveryLocationId && !e.deliveryLocationType) e.deliveryLocationType = this.isEport ? 2 : 1;
    this.pickupKey = e?.pickupLocationId ? `${e.pickupLocationType}-${e.pickupLocationId}` : null;
    this.deliveryKey = e?.deliveryLocationId ? `${e.deliveryLocationType}-${e.deliveryLocationId}` : null;
    this._rebuildLocationItems();
  }

  private _rebuildLocationItems() {
    const PORT = 'Cảng/bãi/CFS', LOC = 'Địa điểm KH';
    const items = [
      ...(this.listPorts || []).map(p => ({ key: `2-${p.id}`, id: p.id, type: 2, name: p.name, group: PORT })),
      ...(this.listLocations || []).map(l => ({ key: `1-${l.id}`, id: l.id, type: 1, name: l.address, group: LOC }))
    ];
    // Điểm đang lưu không còn trong danh mục (khóa/chưa duyệt) → vẫn hiện tên đã lưu
    const keep = (key: string, id: number, type: number, name: string) => {
      if (key && !items.some(x => x.key === key)) items.push({ key, id, type, name, group: type === 2 ? PORT : LOC });
    };
    keep(this.pickupKey, this.entity?.pickupLocationId, this.entity?.pickupLocationType, this.entity?.pickupLocation);
    keep(this.deliveryKey, this.entity?.deliveryLocationId, this.entity?.deliveryLocationType, this.entity?.deliveryLocation);
    this.locationItems = items;
  }
  attack() {
    this.viewAttackFiles = true;
    let item: Attachfiles = {
      frmName: 'SHIPPINGTASK',
      functionName: 'SHIPPINGTASK',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, this.entity.createdBy != this.userLoged.id);
    }, 50);
  }

  closeAttackModal() {
    this.viewAttackFiles = false;
  }

  viewShipmentContSeal() {
    this.viewContSeals = true;
    setTimeout(() => {
      this.modalListContSeals.view(this.entity.shipmentId);
    }, 50);
  }
  saveSuccessContSeal(event: ShipmentContSeal) {
    this.entity.containerNumber = event?.contNo;
    this.entity.sealNumber = event?.sealNo;
    this.entity.contType = event?.contType;
    this.entity.weight = event?.gw?.toString();
  }
  closeShipmentContSealsModal() {
    this.viewContSeals = false;
  }

  selectedNgaybatdau(event) {
    this.entity.estimatedStartTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdau(event) {
    if (this.entity.estimatedStartTime == null)
      this.entity.estimatedStartTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');

  }
  selectedNgayhoanthanh(event) {
    this.entity.estimatedFinishTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgayhoanthanh(event) {
    if (this.entity.estimatedFinishTime == null)
      this.entity.estimatedFinishTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selectedpickupTime(event) {
    this.entity.pickupTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedpickupTime(event) {
    if (this.entity.pickupTime == null)
      this.entity.pickupTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selecteddeliveryTime(event) {
    this.entity.deliveryTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closeddeliveryTime(event) {
    if (this.entity.deliveryTime == null)
      this.entity.deliveryTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedcontainerStoragePeriod(event) {
    this.entity.demurageTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedcontainerStoragePeriod(event) {
    if (this.entity.demurageTime == null)
      this.entity.demurageTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }
  selecteddetentionTime(event) {
    this.entity.detentionTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closeddetentionTime(event) {
    if (this.entity.detentionTime == null)
      this.entity.detentionTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedcutOffTime(event) {
    this.entity.cutOffTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedcutOffTime(event) {
    if (this.entity.cutOffTime == null)
      this.entity.cutOffTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  toughessChanged(event: OtherCategories) {
    this.entity.jobToughnessName = event?.categoryName;
  }

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.customerCode = event.customerCode;
    this.customerName = event.customerName;
    this.entity.jobId = null;
    this.entity.weight = null;
    this.entity.shipmentType = null;
    this.entity.shipmentId = null;
    this.entity.billBooking = null;
    this.lockTaskType = false;   // bỏ Job → mở khóa Loại vận chuyển
    // Đổi KH → bỏ điểm thuộc KH cũ (Cảng/bãi/CFS dùng chung thì giữ)
    if (this.entity.pickupLocationType === 1) { this.pickupKey = null; this.changePickupLocation(null); }
    if (this.entity.deliveryLocationType === 1) { this.deliveryKey = null; this.changeDeliveryLocation(null); }
    this.loadLocations(this.customerId);
    this.entity.informationOfSurchargeInvoice = event?.informationOfSurchargeInvoice;
    this.entity.informationOnContainerLiffInvoice = event?.informationOnContainerLiffInvoice;
    this.entity.externalInformationOnContainerLiffInvoice = event?.externalInformationOnContainerLiffInvoice;
  }

  searchCustomer() {
    let value = this.listCustomer.findIndex(item => item.customerCode.indexOf(this.customerCode) !== -1);
    if (value !== -1) {
      this.entity.customerId = this.listCustomer[value].id;
      this.customerId = this.listCustomer[value].id;
      this.customerCode = this.listCustomer[value].customerCode;
      this.customerName = this.listCustomer[value].customerName;
    } else {
      this.entity.customerId = 0;
      this.customerCode = '';
      this.customerId = 0;
      this.customerName = '';
    }
  }

  /**
   * Loại vận chuyển của Job (Shipment.ShippingType) → TaskType. Job có loại: lấy theo + khóa.
   * Job chưa có loại: mở khóa, giữ lựa chọn hiện tại của CS. (Picker JobId không trả ShippingType → đọc chi tiết Job.)
   */
  private _applyJobTransportType(shipmentId?: number) {
    if (!shipmentId) { this.lockTaskType = false; return; }
    this._shipmentService.getDetail(shipmentId.toString()).subscribe((res: ResponseValue<Shipment>) => {
      if (this.entity?.shipmentId !== shipmentId) return;   // đã đổi Job trong lúc chờ
      const jobTaskType = (res.code == '200' || res.code == '201')
        ? TransportTypeConstants.fromJobType(res.data?.shippingType) : null;
      if (jobTaskType) {
        this.entity.taskType = jobTaskType;
        this.lockTaskType = true;
      } else {
        this.lockTaskType = false;
      }
    });
  }

  /** Trước khi lưu: xóa giá trị các trường bị ẩn theo loại (không lưu dữ liệu rác). */
  private _clearHiddenFields() {
    const e = this.entity;
    if (!e || this.isFCL) return;
    // Ẩn ở cả LCL và CBT
    e.detentionTime = null;
    e.typeOfLiffingOrder = null;
    e.typeOfLiftOffOrder = null;
    e.shipBrand = null;
    e.portOfLiffting = null;
    e.portOfLiftOff = null;
    e.billBooking = null;
    e.informationOnContainerLiffInvoice = null;
    e.externalInformationOnContainerLiffInvoice = null;
    e.informationOfSurchargeInvoice = null;
    if (this.isLCL) {
      e.containerNumber = null;
      e.contType = null;
    }
    if (this.isCBT) {
      e.cutOffTime = null;
      e.demurageTime = null;
      e.cfsWarehouse = null;
      e.operatorId = undefined;   // BE là int không null → bỏ khỏi payload thay vì gửi null
    }
  }

  selectedContNo(event: ShipmentContSeal) {
    this.entity.sealNumber = event?.sealNo;
    let contType = event?.contType;
    let index = this.listContype.find(it => {
      it.categoryName === contType;
    })
    if (index) this.entity.contType = index.categoryCode;
  }
  saveSuccessJobId(event: Shipment) {
    // 19/11/2026: mở cho MỌI loại hình Job (trước chỉ SE, SI, DS). FCL vẫn xét xuất/nhập theo SE (1174).
    this.shipmentSelected = event;
    this.entity.jobId = event.jobId;
    this.entity.weight = event.weight?.toString();
    this.entity.shipmentType = event.shipmentType;
    this.entity.shipmentId = event.id;
    this.entity.billBooking = event.bookingNo;
    this.isEport = this.shipmentSelected.shipmentType == 1174;
    this.lockTaskType = false;
    this._applyJobTransportType(event.id);
  }

  getJobId() {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalListShipment.view(this.entity.customerId, Number.parseInt(this.userLoged.branchId), 0);
    }, 50);
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
