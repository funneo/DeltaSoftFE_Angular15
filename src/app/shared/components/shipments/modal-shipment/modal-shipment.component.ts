import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Shipment, Branch, User, Customer, ResponseValue, OtherCategories, ContractCustomer, QuotationCustomer, ShipmentContSeal, ShipmentPackage, QuotationCustomerDetail, ShipmentServiceDetail } from '@app/shared/models';
import { NotificationService, ShipmentService, UserService, BranchService, CustomerService, AuthService, UtilityService, OtherCategoriesService, ContractCustomerService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { QuotationCustomerService } from '@app/shared/services/sales-marketing/quotation-customer.service';
import { ModalContractCustomerComponent } from '../../sales-marketing/modal-contract-customer/modal-contract-customer.component';
import { ModalQuotationCustomerComponent } from '../../sales-marketing/modal-quotation-customer/modal-quotation-customer.component';
import { ModalAllAttachFileComponent } from '../../workflows/modal-all-attach-file/modal-all-attach-file.component';
import { ModalAllDocumentsComponent } from '../../systems/modal-all-documents/modal-all-documents.component';

@Component({
  selector: 'modal-shipment',
  templateUrl: './modal-shipment.component.html',
  styleUrls: ['./modal-shipment.component.css']
})
export class ModalShipmentComponent implements OnInit {
  public entity: Shipment;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew:boolean=false;
  // Chế độ xem nháp (draft.DraftEntries) — read-only, nền vàng, nút Duyệt/Hủy. KHÔNG ảnh hưởng luồng add/edit thật.
  public _isDraftView: boolean = false;
  public _draftId: number;
  public busy: Subscription;
  listBranch: Branch[];
  // listUser: User[];
  userName:string;
  listChinhanhthamgia: number[];
  listCustomer: Customer[];
  branchId: number;
  listJobTypes = [{ id: 0, text: 'Dịch vụ' }, { id: 1, text: 'Hành chính' }];
  listShipmentType: OtherCategories[];
  listImportExports: OtherCategories[];
  listContract: ContractCustomer[];
  listQuotation: QuotationCustomer[];
  listContTypes:OtherCategories[];
  listJobPrices = [{ id: 0, text: 'Theo hợp đồng' }, { id: 1, text: 'Theo báo giá' }];
  _typePrice = 0;
  listShippingType = [{id:0,text:'FCL'},{id:1,text:'LCL'}]
   _cdsDate: string;
  ngayToKhaiOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );

  _jobDate: string = moment(new Date()).format('DD/MM/YYYY');
  ngayJobOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );

  _ngayLayHang:string;
  ngayLayHangOptions=this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  _ngayGiaoHang:string;
  ngayGiaoHangOptions=this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  _ngayTraRong:string;
  ngayTraRongOptions=this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  _ngayCutOff:string;
  ngayCutOffOptions=this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  _customerId: number;
  viewAttachFiles: boolean;
  viewAllAttachFiles:boolean=false;
  listConts:ShipmentContSeal[];
  _flagContSeal:boolean=false;
  listPakages:ShipmentPackage[];
  maskNumber = UtilityService.maskNumber;

  _isBaoGiaSoHoa=false;
  listDichVuSoHoa: ShipmentServiceDetail[];
  _hasPermissionContract=false;

  listLoaiDichVus:OtherCategories[];
  listDVTs:OtherCategories[];
  listTienTes:OtherCategories[];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @Output() ApproveDraft: EventEmitter<number> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalAllDocumentsComponent, { static: false }) modalAllAttackFiles: ModalAllDocumentsComponent;
  constructor(private _notificationService: NotificationService, private shipmentService: ShipmentService,
    private branchService: BranchService, private customerService: CustomerService, private authService: AuthService,
    private _utilityService: UtilityService, private otherCategoriesService: OtherCategoriesService,
    private contractCustomerService: ContractCustomerService, private quotationCustomerService: QuotationCustomerService) {
    let user = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(user.branchId);
    this.userName=user.userName;
    this._hasPermissionContract = this.authService.hasPermission('CONTRACTCUSTOMER_VIEW');
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadCustomer();
    this.loadOtherCategory();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data.filter(x => x.locked === false);
    });
  }

  loadHopDong(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId.toString())
      .set('branchId', this.branchId.toString());
    this.contractCustomerService.getAll(params).subscribe((res: ResponseValue<ContractCustomer[]>) => {
      this.listContract = res.data;
    });
  }

  loadBaoGia(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId.toString())
      .set('branchId', this.branchId.toString());
    this.quotationCustomerService.getAll(params).subscribe((res: ResponseValue<QuotationCustomer[]>) => {
      this.listQuotation = res.data;
    });
  }

  changedCustomer(item: Customer) {
    this._customerId = item.id;
    this.entity.contractId=null;
    this.entity.quotationId=null;
    if(this.entity?.jobType==0){
      this.loadHopDong();
      this.loadBaoGia();
    }
  }

  changedBaoGia(item:QuotationCustomer){
    if(item?.type==1){
      this._isBaoGiaSoHoa=true;
      this.quotationCustomerService.getDetail(item.id.toString()).subscribe((res: ResponseValue<QuotationCustomer>) => {
        this.listDichVuSoHoa = res.data.quotationCustomerDetails;
        if (this.listDichVuSoHoa && this.listDichVuSoHoa.length != 0) {
          this.listDichVuSoHoa.every(_ => _.tempId = _.id);
          this.listDichVuSoHoa.every(_ => _.isOk = false);
          this.listDichVuSoHoa.every(_ => _.num = 0);
        }
      });
    }
    else{
      this._isBaoGiaSoHoa=false;
      this.listDichVuSoHoa=[];
    }
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listContTypes = res.data.filter(x => x.type === 'SHIPMENT_T04');
      this.listShipmentType = res.data.filter(x => x.type === 'SHIPMENT_T02');
      this.listImportExports = res.data.filter(x => x.type === 'SHIPMENT_T03');
      this.listLoaiDichVus = res.data.filter(x => x.type === 'SERVICE');
      this.listDVTs = res.data.filter(x => x.type === 'UNIT');
      this.listTienTes = res.data.filter(x => x.type === 'CURRENCY');
    });
  }


  selectedNgayToKhai(event) {
    this._cdsDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayToKhai(event) {
    if (this._cdsDate == null)
      this._cdsDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  selectedNgayJob(event) {
    this._jobDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedNgayJob(event) {
    if (this._jobDate == null)
      this._jobDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  selectedCutOff(event) {
    this._ngayCutOff = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }

  closedCutOff(event) {
    if (this._ngayCutOff == null)
      this._ngayCutOff = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedGiaoHang(event) {
    this._ngayGiaoHang = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }

  closedGiaoHang(event) {
    if (this._ngayGiaoHang == null)
      this._ngayGiaoHang = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedLayHang(event) {
    this._ngayLayHang = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }

  closedLayHang(event) {
    if (this._ngayLayHang == null)
      this._ngayLayHang = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  selectedTraRong(event) {
    this._ngayTraRong = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }

  closedTraRong(event) {
    if (this._ngayTraRong == null)
      this._ngayTraRong = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  add() {
    this.entity = {
      status: true,
      branchId: this.branchId,
      jobDate: moment(new Date()).format('DD/MM/YYYY'),
      jobType:0
    };
    this.listConts=[];
    this.listPakages=[];
    this.inputTen();
    this.inputTen2();
    this.listChinhanhthamgia = [];
    this.listChinhanhthamgia.push(this.branchId);
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew=true;
    this._isDraftView = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this._isDraftView = false;
    this.shipmentService.getDetail(id).subscribe((res: ResponseValue<Shipment>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.listChinhanhthamgia = [];
        this.entity.shipmentBranches?.forEach(x => {
          this.listChinhanhthamgia.push(x.branchId);
        });
        this.listConts = this.entity.shipmentContSeals ?? [];
        if (this.listConts && this.listConts.length != 0) {
          this.listConts.every(_ => _.tempId = _.id);
        }

        this.listPakages = this.entity.shipmentPackages ?? [];
        if (this.listPakages && this.listPakages.length != 0) {
          this.listPakages.every(_ => _.tempId = _.id);
        }

        this.listDichVuSoHoa = this.entity.shipmentServiceDetails ?? [];
        if (this.listDichVuSoHoa && this.listDichVuSoHoa.length != 0) {
          this.listDichVuSoHoa.every(_ => _.tempId = _.id);
        }

        if (this.entity.jobDate) {
          this.ngayJobOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.jobDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._jobDate = moment(this.entity.jobDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.cdsDate) {
          this.ngayToKhaiOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.cdsDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._cdsDate = moment(this.entity.cdsDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }

        if (this.entity.cutoffTime) {
          this.ngayCutOffOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.cutoffTime, FormatContstants.DATEEN).format(FormatContstants.DATEEN)),
            true
          );
          this._ngayCutOff = moment(this.entity.cutoffTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }

        if (this.entity.pickupTime) {
          this.ngayLayHangOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.pickupTime, FormatContstants.DATEEN).format(FormatContstants.DATEEN)),
            true
          );
          this._ngayLayHang = moment(this.entity.pickupTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }

        if (this.entity.deliveryTime) {
          this.ngayGiaoHangOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.deliveryTime, FormatContstants.DATEEN).format(FormatContstants.DATEEN)),
            true
          );
          this._ngayGiaoHang = moment(this.entity.deliveryTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }

        if (this.entity.emptyContDeadline) {
          this.ngayTraRongOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.emptyContDeadline, FormatContstants.DATEEN).format(FormatContstants.DATEEN)),
            true
          );
          this._ngayTraRong = moment(this.entity.emptyContDeadline, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        this._isBaoGiaSoHoa=this.entity.jobDig;
        this._customerId = this.entity.customerId;
        this._typePrice = this.entity.contractId? 0 : 1;

        if(this.entity.jobType==0){
          this.loadHopDong();
          this.loadBaoGia();
        }
        if (!this.flagXem){
          this.inputTen();
          this.inputTen2();
        }

        if(this.listCustomer && this.listCustomer?.length==0 || this.listCustomer?.findIndex(x=>x.id==this.entity.customerId)==-1){
          this.listCustomer.push({id:this.entity.customerId,customerName:this.entity.customerName});
        }

        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  /**
   * Xem chi tiết 1 lô hàng NHÁP (draft.DraftEntries.Payload) ở chế độ read-only.
   * Reuse y nguyên form modal-shipment (flagXem=true) + nền vàng + nút Duyệt/Hủy.
   * Payload là DTO tạo-thật do site nháp gửi → shape giống Shipment. KHÔNG gọi BE lưu.
   */
  viewDraft(payload: any, draftId: number) {
    let p: any = payload;
    if (typeof payload === 'string') {
      try { p = JSON.parse(payload || '{}'); } catch { p = {}; }
    }
    this.entity = p || {};
    this._draftId = draftId;
    this._isDraftView = true;
    this.flagXem = true;
    this.flagNew = false;
    this.flagSave = false;

    this._customerId = this.entity.customerId;
    if (this.entity.customerId && (this.listCustomer == null ||
        this.listCustomer.findIndex(x => x.id == this.entity.customerId) == -1)) {
      this.listCustomer = this.listCustomer || [];
      this.listCustomer.push({ id: this.entity.customerId, customerName: this.entity.customerName });
    }

    this.listChinhanhthamgia = [];
    this.entity.shipmentBranches?.forEach(x => this.listChinhanhthamgia.push(x.branchId));
    this.listConts = this.entity.shipmentContSeals ?? [];
    this.listPakages = this.entity.shipmentPackages ?? [];
    this.listDichVuSoHoa = this.entity.shipmentServiceDetails ?? [];

    // Ngày trong payload có thể là 'YYYYMMDD'/'MM/DD/YYYY'/ISO → format VN để hiển thị
    this._jobDate = this._draftDate(this.entity.jobDate, false);
    this._cdsDate = this._draftDate(this.entity.cdsDate, false);
    this._ngayCutOff = this._draftDate(this.entity.cutoffTime, true);
    this._ngayLayHang = this._draftDate(this.entity.pickupTime, true);
    this._ngayGiaoHang = this._draftDate(this.entity.deliveryTime, true);
    this._ngayTraRong = this._draftDate(this.entity.emptyContDeadline, true);

    this._typePrice = this.entity.contractId ? 0 : 1;
    this._isBaoGiaSoHoa = !!this.entity.jobDig;
    if (this.entity.jobType == 0 && this._customerId) {
      this.loadHopDong();
      this.loadBaoGia();
    }
    this.modalAddEdit.show();
  }

  private _draftDate(v: any, withTime: boolean): string {
    if (!v) return null;
    const m = moment(v, [
      'YYYYMMDD HH:mm:ss', 'YYYYMMDDHHmmss', 'YYYYMMDD',
      'MM/DD/YYYY HH:mm:ss', 'MM/DD/YYYY',
      'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD', moment.ISO_8601
    ], false);
    if (!m.isValid()) return null;
    return m.format(withTime ? FormatContstants.DATETIMEVN : FormatContstants.DATEVN);
  }

  /**
   * Nút "Duyệt" — Phase 4 (promote): biến nháp thành Lô hàng THẬT.
   * Dựng lại entity y như saveChange (entity đã map sẵn ở viewDraft) rồi gọi
   * addFromDraft — BE tạo job + ghi ngược draft (shipmentId/jobId). Reload list.
   */
  approveDraft() {
    if (this.flagSave) return;
    if (!this.entity?.customerId) {
      this._notificationService.printAlert(MessageContstants.TITLE_ERROR_INFO,
        'Nháp thiếu khách hàng — không thể duyệt.');
      return;
    }
    this._notificationService.printConfirmationDialog(
      'Duyệt nháp này thành Lô hàng thật?', () => this._doApproveDraft());
  }

  private _doApproveDraft() {
    // Dựng entity giống saveChange (KHÔNG đụng saveChange để tránh ảnh hưởng luồng thật)
    this.entity.shipmentBranches = [];
    this.listChinhanhthamgia?.forEach(x => this.entity.shipmentBranches.push({ branchId: x }));
    if (this._cdsDate)
      this.entity.cdsDate = moment(this._cdsDate, FormatContstants.DATEVN).format(FormatContstants.CLIENTDATE);
    if (this._jobDate)
      this.entity.jobDate = moment(this._jobDate, FormatContstants.DATEVN).format(FormatContstants.CLIENTDATE);
    if (this._ngayCutOff)
      this.entity.cutoffTime = moment(this._ngayCutOff, FormatContstants.DATETIMEVN).format('YYYYMMDD HH:mm:ss');
    if (this._ngayLayHang)
      this.entity.pickupTime = moment(this._ngayLayHang, FormatContstants.DATETIMEVN).format('YYYYMMDD HH:mm:ss');
    if (this._ngayGiaoHang)
      this.entity.deliveryTime = moment(this._ngayGiaoHang, FormatContstants.DATETIMEVN).format('YYYYMMDD HH:mm:ss');
    if (this._ngayTraRong)
      this.entity.emptyContDeadline = moment(this._ngayTraRong, FormatContstants.DATETIMEVN).format('YYYYMMDD HH:mm:ss');
    if (this._typePrice == 0) this.entity.quotationId = null; else this.entity.contractId = null;
    this.entity.shipmentContSeals = this.listConts?.filter(_ => _.contType != null && _.contType != '');
    this.entity.shipmentPackages = this.listPakages?.filter(_ => _.packageCode != null && _.packageCode != '');
    this.entity.shipmentServiceDetails = this.listDichVuSoHoa?.filter(z => z.serviceId);
    this.entity.id = undefined;        // ép tạo mới
    this.entity.jobStaff = this.userName;

    this.flagSave = true;
    this.shipmentService.addFromDraft(this.entity, this._draftId).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        const jobId = res.data?.jobId;
        this._notificationService.printSuccessMessage(
          res.data?.alreadyPromoted
            ? ('Nháp đã được duyệt trước đó (Job ' + (jobId || '') + ')')
            : ('Đã duyệt thành Lô hàng ' + (jobId || '')));
        this.modalAddEdit.hide();
        this.ApproveDraft.emit(this._draftId);
      } else {
        this._notificationService.printErrorMessage(res.message || MessageContstants.CREATED_ERR_MSG);
        this.flagSave = false;
      }
    }, () => { this.flagSave = false; });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.entity.shipmentBranches = [];
      this.listChinhanhthamgia?.forEach(x => {
        this.entity.shipmentBranches.push({ branchId: x })
      })
      if (this._cdsDate)
        this.entity.cdsDate = moment(this._cdsDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this._jobDate)
        this.entity.jobDate = moment(this._jobDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );

        if (this._ngayCutOff)
        this.entity.cutoffTime = moment(this._ngayCutOff, FormatContstants.DATETIMEVN).format(
          "YYYYMMDD HH:mm:ss"
        );

        if (this._ngayLayHang)
        this.entity.pickupTime = moment(this._ngayLayHang, FormatContstants.DATETIMEVN).format(
          "YYYYMMDD HH:mm:ss"
        );

        if (this._ngayGiaoHang)
        this.entity.deliveryTime = moment(this._ngayGiaoHang, FormatContstants.DATETIMEVN).format(
          "YYYYMMDD HH:mm:ss"
        );

        if (this._ngayTraRong)
        this.entity.emptyContDeadline = moment(this._ngayTraRong, FormatContstants.DATETIMEVN).format(
          "YYYYMMDD HH:mm:ss"
        );

      if(this._typePrice==0){
        this.entity.quotationId=null;
      }
      else{
        this.entity.contractId=null;
      }
      this.entity.shipmentContSeals=this.listConts?.filter(_=>_.contType!=null && _.contType!='');
      this.entity.shipmentPackages=this.listPakages?.filter(_=>_.packageCode!=null && _.packageCode!='');
      this.entity.shipmentServiceDetails=this.listDichVuSoHoa?.filter(z=>z.serviceId);
      //Kiểm tra nếu là hàng sea import và fcl mà chưa có thông tin của container thì ko cho tạo job
      if(this.entity.shipmentType==1175 && this.entity.shippingType==0){
        if(this.entity.shipmentContSeals?.length<1){
          this._notificationService.printAlert(MessageContstants.TITLE_ERROR_INFO,"Chưa nhập thông tin Container với hàng nhập khẩu FCL, kiểm tra lại!")
          return;
        }
      }
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.entity.jobStaff=this.userName;
        this.shipmentService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            let item: Shipment = res.data;
            this.entity.id = item.id;
            this.entity.jobId = item.jobId;
            this.SaveSuccess.emit(res.data.id);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.shipmentService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data.id);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  //Bổ sung phần lưu và thêm mới ở đây
  addAndNew(form:NgForm){
    if (form.valid) {
          this.entity.shipmentBranches = [];
          this.listChinhanhthamgia?.forEach(x => {
            this.entity.shipmentBranches.push({ branchId: x })
          })
          if (this._cdsDate)
            this.entity.cdsDate = moment(this._cdsDate, FormatContstants.DATEVN).format(
              FormatContstants.CLIENTDATE
            );
          if (this._jobDate)
            this.entity.jobDate = moment(this._jobDate, FormatContstants.DATEVN).format(
              FormatContstants.CLIENTDATE
            );

            if (this._ngayCutOff)
            this.entity.cutoffTime = moment(this._ngayCutOff, FormatContstants.DATETIMEVN).format(
              "YYYYMMDD HH:mm:ss"
            );

            if (this._ngayLayHang)
            this.entity.pickupTime = moment(this._ngayLayHang, FormatContstants.DATETIMEVN).format(
              "YYYYMMDD HH:mm:ss"
            );

            if (this._ngayGiaoHang)
            this.entity.deliveryTime = moment(this._ngayGiaoHang, FormatContstants.DATETIMEVN).format(
              "YYYYMMDD HH:mm:ss"
            );

            if (this._ngayTraRong)
            this.entity.emptyContDeadline = moment(this._ngayTraRong, FormatContstants.DATETIMEVN).format(
              "YYYYMMDD HH:mm:ss"
            );

          if(this._typePrice==0){
            this.entity.quotationId=null;
          }
          else{
            this.entity.contractId=null;
          }
          this.entity.shipmentContSeals=this.listConts?.filter(_=>_.contType!=null && _.contType!='');
          this.entity.shipmentPackages=this.listPakages?.filter(_=>_.packageCode!=null && _.packageCode!='');
          this.entity.shipmentServiceDetails=this.listDichVuSoHoa?.filter(z=>z.serviceId);
          if (this.entity.id == undefined) {
            this.entity.jobStaff=this.userName;
            this.shipmentService.add(this.entity).subscribe((res: ResponseValue<any>) => {
              if (res.code == '200' || res.code == '201') {
                this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
                this.entity.id=undefined;
                this.entity.jobId=null;
                this.entity.shipmentBranches=[];
                this.entity.shipmentType=null;
                this.listChinhanhthamgia=[];
              }
              else {
                this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
                this.flagSave = false;
              }
            }, () => {
              this.flagSave = false;
            });
          }
          else {
            this.shipmentService.update(this.entity).subscribe((res: ResponseValue<any>) => {
              if (res.code == '200' || res.code == '201') {
                this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
                this.entity={};
                this.entity = {
                  status: true,
                  branchId: this.branchId,
                  jobDate: moment(new Date()).format('DD/MM/YYYY'),
                  jobType:0
                };
              }
              else {
                this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
                this.flagSave = false;
              }
            }, () => {
              this.flagSave = false;
            });
          }
        }
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'SHIPMENT',
      functionName: 'SHIPMENT',
      refNo: this.entity.id.toString(),
      jobId:this.entity.jobId
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }
  showAllFiles() {
    this.viewAllAttachFiles = true;

    setTimeout(() => {
      this.modalAllAttackFiles.edit(this.entity.id);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
  closeModalAllFile() {
    this.viewAllAttachFiles = false;
  }
  showContSealDetail(){
    this._flagContSeal=!this._flagContSeal;
  }

  inputTen() {
    if (this.listConts?.length == 0) {
      let item: ShipmentContSeal = {
        tempId: 1,
        contNo: ''
      };
      this.listConts.push(item);
    } else {
      let i = this.listConts?.length;
      let arrayId = this.listConts?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });

      let item = this.listConts.find((x) => x.tempId == maxId);
      if (item && (item.contNo != '' || item.contType != null)) {
        let item: ShipmentContSeal = {
          tempId: maxId + 1,
          contNo: '',
        };
        this.listConts.push(item);
      }
    }
  }

  removeItem(i: number) {
    this.listConts.splice(i, 1);
    this.listConts=[...this.listConts]
  }


  inputTen2() {
    if (this.listPakages?.length == 0) {
      let item: ShipmentPackage = {
        tempId: 1,
        packageCode: ''
      };
      this.listPakages.push(item);
    } else {
      let i = this.listPakages?.length;
      let arrayId = this.listPakages?.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });

      let item = this.listPakages.find((x) => x.tempId == maxId);
      if (item && (item.packageCode != '')) {
        let item: ShipmentPackage = {
          tempId: maxId + 1,
          packageCode: '',
        };
        this.listPakages.push(item);
      }
    }
  }

  removeItem2(i: number) {
    this.listPakages.splice(i, 1);
    this.listPakages=[...this.listPakages]
  }

  clickRow(item: ShipmentServiceDetail) {
    item.isOk = !item.isOk;
    let index = this.listDichVuSoHoa.findIndex((x) => x == item);
    if (index == -1) return;
    this.listDichVuSoHoa[index].isOk = item.isOk;
    // if (item.isOk)
    //   this.listDichVuSoHoa[index].checked = true;
  }

  viewModalContract = false;
  @ViewChild(ModalContractCustomerComponent, { static: false }) modalContract: ModalContractCustomerComponent;
  showContract(): void {
    if (this.entity.contractId) {
      this.viewModalContract = true;
      setTimeout(() => {
        this.modalContract.edit(this.entity?.contractId?.toString(), true);
      }, 50);
    }
  }

  @ViewChild(ModalQuotationCustomerComponent, { static: false }) modalQuotation: ModalQuotationCustomerComponent;
  showQuotation(): void {
    if (this.entity.quotationId) {
      this.viewModalContract = true;
      setTimeout(() => {
        this.modalQuotation.edit(this.entity?.quotationId?.toString(), true);
      }, 50);
    }
  }

  closeModalContract() {
    this.viewModalContract = false;
  }

}
