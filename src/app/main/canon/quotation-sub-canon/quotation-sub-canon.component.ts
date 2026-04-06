import { Component, OnInit, ViewChild } from '@angular/core';
import { ResponseValue, Supplier, Branch } from '@app/shared/models';
import { CanonQuotationsubcontractors } from '@app/shared/models/transports/canon-quotationsubcontractors.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { SupplierService } from '@app/shared/services/supplier.service';
import { BranchService } from '@app/shared/services/branch.service';
import { CanonQuotationsubcontractorsService } from '@app/shared/services/canon-quotationsubcontractors.service';
import { HttpParams } from '@angular/common/http';
import { ModalCanonQuotationsubcontractorsComponent } from '@app/shared/components/canon/modal-canon-quotationsubcontractors/modal-canon-quotationsubcontractors.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'app-quotation-sub-canon',
  templateUrl: './quotation-sub-canon.component.html',
  styleUrls: ['./quotation-sub-canon.component.css']
})
export class QuotationSubCanonComponent implements OnInit {
  keyword: string = '';
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRow: number = 0;
  totalPage: number = 0;
  listEntity: any[] = [];
  listFilter: any[] = [];
  
  listSupplier: Supplier[] = [];
  listBranch: Branch[] = [];
  branchId: number;
  supplierId?: number = 0;
  adminPermission: boolean = false;
  viewModal = false;
  permission: any = {};
  
  extendQuoteId: number;
  extendValidUntil: string;
  ngaybatdauOption = this.utilityService.dateTimeOptionDays(new Date(), false);

  // Filter columns
  quotationCodeSearch: string = '';
  supplierSearch: string = '';
  vihicleSearch: string = '';
  noteSearch: string = '';

  flagEdit = false;
  flagDelete = false;

  @ViewChild(ModalCanonQuotationsubcontractorsComponent, { static: false }) modalQuotationsub: ModalCanonQuotationsubcontractorsComponent;
  @ViewChild('modalExtend', { static: false }) modalExtend: ModalDirective;

  constructor(
    private quotationService: CanonQuotationsubcontractorsService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private utilityService: UtilityService,
    private supplierService: SupplierService,
    private branchService: BranchService
  ) {
    let user = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(user.branchId);
    this.adminPermission = user.roles.indexOf('Admin') > -1;
    this.permission.CREATE = this.authService.hasPermission('CANON_QUOTATION_SUB_CREATE');
    this.permission.UPDATE = this.authService.hasPermission('CANON_QUOTATION_SUB_UPDATE');
    this.permission.DELETE = this.authService.hasPermission('CANON_QUOTATION_SUB_DELETE');
    this.permission.VIEW = this.authService.hasPermission('CANON_QUOTATION_SUB_VIEW');
    this.permission.APPROVED = this.authService.hasPermission('QUOTATIONSUB_ACCEPT');
  }

  ngOnInit(): void {
    this.loadBranch();
    this.loadSupplier();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadSupplier(): void {
    const params = new HttpParams().set('branchid', this.branchId.toString());
    this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data;
      }
    });
  }

  changedBranch(event: any) {
    this.branchId = event?.id;
    this.loadSupplier();
    this.loadData();
  }

  loadData() {
    let params = new HttpParams()
      .set('keyword', this.keyword)
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid', this.branchId.toString());

    if (this.supplierId) {
      params = params.set('supplierId', this.supplierId.toString());
    }

    this.quotationService.getPaging(params).subscribe((res: any) => {
      if (res.code == '200') {
        this.listEntity = res.data.items;
        this.listEntity.forEach(x => { x.checked = false; });
        this.listFilter = this.listEntity;
        this.totalRow = res.data.totalRows;
        this.totalPage = Math.ceil(this.totalRow / this.pageSize);
        this.filterLocal();
        this.icheck();
      } else {
        this.listEntity = [];
        this.listFilter = [];
        this.totalRow = 0;
        this.icheck();
      }
    });
  }

  filterLocal() {
    this.listFilter = this.listEntity.filter(item => {
      const qCodeMatch = !this.quotationCodeSearch || (item.quotationCode || '').toLowerCase().includes(this.quotationCodeSearch.toLowerCase());
      const supMatch = !this.supplierSearch || (item.supplierName || '').toLowerCase().includes(this.supplierSearch.toLowerCase());
      const vihMatch = !this.vihicleSearch || (item.vihicleTypeName || '').toLowerCase().includes(this.vihicleSearch.toLowerCase());
      const noteMatch = !this.noteSearch || (item.note || '').toLowerCase().includes(this.noteSearch.toLowerCase());
      return qCodeMatch && supMatch && vihMatch && noteMatch;
    });
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  search() {
    this.pageIndex = 1;
    this.loadData();
  }

  refresh() {
    this.keyword = '';
    this.supplierId = null;
    this.quotationCodeSearch = '';
    this.supplierSearch = '';
    this.vihicleSearch = '';
    this.noteSearch = '';
    this.search();
  }

  clickRow(item: any): void {
    item.checked = !item.checked;
    this.listFilter.forEach(it => {
      if (it !== item) it.checked = false;
    });
    this.icheck();
  }

  icheck() {
    let checks = this.listFilter.filter((x: any) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    } else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  add() {
    this.viewModal = true;
    setTimeout(() => {
      this.modalQuotationsub.add();
    }, 50);
  }

  edit(flag: boolean) {
    const item = this.listFilter.find((x: any) => x.checked);
    if(item) {
      this.viewModal = true;
      setTimeout(() => {
        this.modalQuotationsub.edit(item.id, flag, this.permission.APPROVED);
      }, 50);
    }
  }

  deleteConfirm(): void {
    let item = this.listFilter.find((x: any) => x.checked);
    if (!item) return;
    if (item.status > 0) return;
    this.notificationService.printConfirmationDialog('Bạn có chắc chắn muốn xóa bản ghi này?', () => this.delete(item.id));
  }

  delete(id: number) {
    this.quotationService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200') {
        this.notificationService.printSuccessMessage('Xóa bản ghi thành công');
        this.loadData();
      } else {
        this.notificationService.printErrorMessage('Có lỗi xảy ra trong quá trình xóa bản ghi');
      }
    });
  }

  saveSuccess(event: any) {
    this.loadData();
  }

  closeModal() {
    this.viewModal = false;
  }
}
