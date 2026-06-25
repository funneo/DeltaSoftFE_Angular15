import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalSubcontractorDispatchOrderComponent } from '@app/shared/components/transports/modal-subcontractor-dispatch-order/modal-subcontractor-dispatch-order.component';
import { ModalPerformFclComponent } from '@app/shared/components/transports/modal-perform-fcl/modal-perform-fcl.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, Profile, ResponseValue, Supplier } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { DispatchOrderFcl } from '@app/shared/models/fcl/dispatch-order-fcl';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { DispatchOrderFclService } from '@app/shared/services/fcl/dispatch-order-fcl.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'subcontractors-dispatch-order',
  templateUrl: './subcontractors-dispatch-order.component.html',
  styleUrls: ['./subcontractors-dispatch-order.component.css']
})
export class SubcontractorsDispatchOrderComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listDispatchorder: Dispatchorder[];
  listFilter: Dispatchorder[];
  listBranch:Branch[]=[];
  listSupplier:Supplier[]=[];
  //listCustomer:Customer[];
  userLoged?:Profile;
  branchId?:number;
  supplierId?:number=0
  busy: Subscription;
  viewModal = false;
  adminPermission=false;

  refNoSearch?:String;
  ngaySearch?:String;
  nguoilapSearch?:String;
  nccSearch?:String;
  bksSearch?:String;
  toantuyenSearch?:String;
  sumSearch?:String;
  ghichuSearch?:String;
  tinhtrang?:number=0;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Khởi tạo" }, { "value": 2, "text": 'Chưa nhận'}, { "value": 3, "text": 'Đã nhận' },{ "value": 4, "text": 'Thực hiện' },{ "value": 5, "text": 'Hoàn thành'}, { "value": 6, "text": 'Duyệt B1'},{ "value": 7, "text": 'Chốt lệnh'}, { "value": 8, "text": 'Dừng lệnh'}];


  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);

  // ===== Tab "Lệnh FCL" thầu phụ (FCL legacy, IsSubcontractors=true) =====
  // Bộ lọc RIÊNG cho tab FCL (ngày/chi nhánh/NCC/từ khóa) — KHÔNG dùng chung với tab xe thường
  // vì mỗi tab kiểm tra 1 nhà cung cấp / điều kiện khác nhau.
  activeTab: 'normal' | 'fcl' = 'normal';
  keywordFcl = '';
  branchIdFcl?: number;
  supplierIdFcl?: number = 0;
  listSupplierFcl: Supplier[] = [];
  ngayBatDauFcl: Date = this._utilityService.ngayBanDau;
  ngayKetThucFcl: Date = this._utilityService.ngayKetThuc;
  dateOptionsFcl = this._utilityService.dateOptionMultis(this.ngayBatDauFcl, this.ngayKetThucFcl);
  fclLoaded = false;
  listFcl: DispatchOrderFcl[] = [];
  listFilterFcl: DispatchOrderFcl[] = [];
  totalRowsFcl = 0;
  pageIndexFcl = 1;
  statusSelectedFcl?: number = 0;
  filterColumnsFcl: { [key: string]: string } = {};
  dateTimeFieldsFcl: string[] = ['createdDate'];
  viewModalFcl = false;
  account_permission_fcl = false;
  arrayFcl = [
    { value: 0, text: 'Tất cả' },
    { value: 1, text: 'Khởi tạo' },
    { value: 2, text: 'Gửi lệnh' },
    { value: 3, text: 'Đã nhận' },
    { value: 4, text: 'Duyệt B1' },
    { value: 5, text: 'Duyệt B2' },
    { value: 6, text: 'Chờ Chốt' },
    { value: 7, text: 'CHỐT' },
    { value: 8, text: 'Từ chối' },
  ];

  @ViewChild(ModalSubcontractorDispatchOrderComponent, { static: false }) modalAddEdit: ModalSubcontractorDispatchOrderComponent
  @ViewChild(ModalPerformFclComponent, { static: false }) modalPerformFcl: ModalPerformFclComponent
  constructor(private dispatchOrderService: DispatchordersService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    ,private _authService:AuthService
    ,private branchService:BranchService
    ,private supplierService:SupplierService
    ,public datepipe: DatePipe
    ,private _fclService: DispatchOrderFclService
    ,private spinner: NgxSpinnerService
    ,private cdr: ChangeDetectorRef
    ) { }


  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.account_permission_fcl=this._authService.hasPermission('FCL_ACCOUNT')||this.adminPermission;
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    // Filter FCL khởi tạo độc lập (cùng mốc mặc định nhưng biến riêng)
    this.branchIdFcl = this.branchId;
    this.ngayBatDauFcl = new Date(this.ngayBatDau);
    this.ngayKetThucFcl = new Date(this.ngayKetThuc);
    this.dateOptionsFcl = this._utilityService.dateOptionMultis(this.ngayBatDauFcl, this.ngayKetThucFcl);
    //this.loadCustomer();
    this.loadBranch();
    this.loadSupplier();
    this.loadSupplierFcl();
    // Tab mặc định là "Lệnh xe thường" -> load ngay (tabset KHÔNG bắn (selectTab) cho tab đầu lúc render).
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  // ===== Handlers filter tab XE THƯỜNG =====
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadSupplier();
    this.loadData();
  }

  changedSupplier(event:Supplier){
    this.supplierId=event?.id;
    this.loadData();
  }

  loadSupplier(){
    const params = new HttpParams()
    .set('branchid', this.branchId.toString());
    this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
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
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  // ===== Handlers filter tab LỆNH FCL (độc lập) =====
  changedBranchFcl(event:Branch){
    this.branchIdFcl=event?.id;
    this.loadSupplierFcl();
    this.loadDataFcl();
  }

  changedSupplierFcl(event:Supplier){
    this.supplierIdFcl=event?.id;
    this.loadDataFcl();
  }

  loadSupplierFcl(){
    const params = new HttpParams()
    .set('branchid', (this.branchIdFcl ?? this.branchId).toString());
    this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplierFcl = res.data;
      } else if (res.code == '204') {
        this.listSupplierFcl = [];
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  selectedDateFcl(event) {
    this.ngayBatDauFcl = new Date(event.start);
    this.ngayKetThucFcl = new Date(event.end);
    this.loadDataFcl();
  }

  timKiemFcl(): void {
    this.pageIndexFcl = 1;
    this.loadDataFcl();
  }

  // Load tab đang mở (xe thường mặc định luôn load; FCL chỉ load khi đang xem tab FCL).
  loadActive(): void {
    if (this.activeTab === 'fcl') this.loadDataFcl();
    else this.loadData();
  }

  onTabSelect(tab: 'normal' | 'fcl'): void {
    this.activeTab = tab;
    // Load tab vừa chọn theo filter hiện tại (fresh mỗi lần chuyển — tránh dữ liệu cũ khi đã đổi ngày/chi nhánh/NCC).
    this.loadActive();
  }

  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }
  

  loadData(): void {
    this.pageIndex=1;
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId.toString())
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword',this.keyword)
      .set('type',"2")
      .set('supplierid',this.supplierId.toString())
     // .set('usergroupid')
      this.busy = this.dispatchOrderService.getPaging(params).subscribe((res: ResponseValue<Pagination<Dispatchorder>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDispatchorder = res.data?.items;
          this.filter();
        }
        else {
          if(res.code=='204'){
            this.listDispatchorder =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }
  filter(){
    this.listFilter = Object.assign([], this.listDispatchorder);
    if(this.tinhtrang>0){
      this.listFilter = this.listFilter.filter((data) => {
        return  this.tinhtrang==1? data.status==0:
                this.tinhtrang==2? data.status==1:
                this.tinhtrang==3? data.status==2:
                this.tinhtrang==4? data.status==3 && data.finished==false:
                this.tinhtrang==5? data.status==3 && data.finished==true:
                this.tinhtrang==6? data.status==5:
                this.tinhtrang==7? data.status==6:(data.status==4 || data.status==7)
                ;
      });
    }
    if(this.refNoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toString().toLowerCase().includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if(this.nguoilapSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoilapSearch.trim().toLocaleLowerCase());
    });
    if(this.nccSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.shippingUnitName?.toString().toLowerCase().includes(this.nccSearch.trim().toLocaleLowerCase());
    });
    if(this.ghichuSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    if(this.bksSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vihiclelLicensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });

    if(this.toantuyenSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.fullRoute?.toLowerCase().includes(this.toantuyenSearch.trim().toLocaleLowerCase());
    });

    if(this.sumSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.dispatchSummarize?.toLowerCase().includes(this.sumSearch.trim().toLocaleLowerCase());
    });
    this.totalRows=this.listFilter.length;
  }
  viewDetailed(item:Dispatchorder){
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.refNo);
    }, 50);
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  // ===================== Tab "Lệnh FCL" thầu phụ =====================
  get visibleDataFcl(): any[] {
    const startIndex = (this.pageIndexFcl - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilterFcl?.slice(startIndex, endIndex);
  }

  loadDataFcl(): void {
    this.pageIndexFcl = 1;
    let tuNgay = moment(this.ngayBatDauFcl).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThucFcl).format('YYYYMMDD');
    this.spinner.show();
    const params = new HttpParams()
      .set('branchid', (this.branchIdFcl ?? this.branchId).toString())
      .set('driverid', '0')
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('keyword', this.keywordFcl)
      .set('isLegacy', '1')               // lệnh FCL thường (legacy)
      .set('isSubcontractors', '1')       // chỉ lệnh thầu phụ -> SP lọc IsSubcontractors=1
      .set('supplierid', (this.supplierIdFcl ?? 0).toString());
    this.busy = this._fclService.getAll(params).subscribe((res: ResponseValue<DispatchOrderFcl[]>) => {
      this.fclLoaded = true;
      if (res.code == '200' || res.code == '201') {
        this.listFcl = (res.data || []).map((it) => ({
          ...it,
          containerList: it.containerNumbers?.split(/[;\n]+/).map((x) => x.trim()).filter(Boolean) || [],
          locationList: it.locations?.split(/\*\-|[\r\n]+/).map((x) => x.trim()).filter(Boolean) || [],
        }));
        this.filterDataFcl();
        this.spinner.hide();
      } else {
        if (res.code == '204') {
          this.listFcl = [];
          this.listFilterFcl = [];
          this.totalRowsFcl = 0;
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
        this.spinner.hide();
      }
    });
  }

  filterDataFcl(): void {
    this.listFilterFcl = Object.assign([], this.listFcl);
    this.cdr.detectChanges();
    if (this.statusSelectedFcl > 0) {
      this.listFilterFcl = this.listFilterFcl.filter((data) => {
        return this.statusSelectedFcl == 8 ? data.isDeny == true :
          this.statusSelectedFcl == 1 ? data.status == 0 :
            this.statusSelectedFcl == 2 ? data.status == 1 :
              this.statusSelectedFcl == 3 ? data.status == 2 && data.isDeny == false :
                this.statusSelectedFcl == 4 ? data.status == 3 && data.isDeny == false :
                  this.statusSelectedFcl == 5 ? data.status == 4 :
                    this.statusSelectedFcl == 6 ? data.status == 5 : data.status == 6;
      });
    }
    this.listFilterFcl = this.listFilterFcl.filter((item) => {
      return Object.keys(this.filterColumnsFcl).every((key) => {
        if (!this.filterColumnsFcl[key]) return true;
        const filterValue = this.filterColumnsFcl[key].toString().toLowerCase();
        const itemValue = this.dateTimeFieldsFcl.includes(key)
          ? this.datepipe.transform(item[key], 'dd/MM/yyyy').toLowerCase()
          : Array.isArray(item[key])
            ? item[key].join(', ').toLowerCase()
            : String(item[key] || '').toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
    this.totalRowsFcl = this.listFilterFcl.length;
  }

  pageChangedFcl(event: PageChangedEvent): void {
    this.pageIndexFcl = event.page;
  }

  viewDetailedFcl(item: DispatchOrderFcl): void {
    this.viewModalFcl = true;
    setTimeout(() => {
      this.modalPerformFcl.edit(item.refNo, true);
    }, 50);
  }

  saveSuccessFcl(): void {
    this.loadDataFcl();
  }

  closeModalFcl(): void {
    this.viewModalFcl = false;
  }

}
