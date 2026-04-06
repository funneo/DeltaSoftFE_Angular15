import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalFeeComponent } from '@app/shared/components/danhmuc/modal-fee/modal-fee.component';
import { ModalFeeCodeComponent } from '@app/shared/components/danhmuc/modal-fee-code/modal-fee-code.component';
import { ModalFeeCodeLvl1Component } from '@app/shared/components/danhmuc/modal-fee-code/modal-fee-code-lvl1.component';
import { ModalFeeCodeLvl2Component } from '@app/shared/components/danhmuc/modal-fee-code/modal-fee-code-lvl2.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Fee, FeeCode, GroupFee, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, FeeService, FeeCodeService, GroupFeeService, AuthService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fee',
  templateUrl: './fee.component.html',
  styleUrls: ['./fee.component.css']
})
export class FeeComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listFee: Fee[];
  listGFees:GroupFee[];
  _gFeeId:number;
  busy: Subscription;
  viewModal = false;
  modalType = 1;
  _accept:boolean;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalFeeComponent, { static: false }) modalAddEdit: ModalFeeComponent
  @ViewChild(ModalFeeCodeComponent, { static: false }) modalCodeAddEdit: ModalFeeCodeComponent
  @ViewChild(ModalFeeCodeLvl1Component, { static: false }) modalCodeLvl1: ModalFeeCodeLvl1Component
  @ViewChild(ModalFeeCodeLvl2Component, { static: false }) modalCodeLvl2: ModalFeeCodeLvl2Component
  
  // New FeeCodes
  tab = 1; // 1: Old, 2: New
  subTab = 1; // 1: Lvl 1, 2: Lvl 2, 3: Lvl 3
  listFeeCode: FeeCode[];
  _feeCodeStatusList = [
    { id: -1, name: 'Tất cả' },
    { id: 0, name: 'Khởi tạo' },
    { id: 1, name: 'Chuyển duyệt' },
    { id: 2, name: 'Duyệt' },
    { id: 3, name: 'Khóa' }
  ];
  _feeCodeStatus = -1;

  _selectedFCLvl1: number;
  _selectedFCLvl2: number;
  _listFCLvl1: any[] = [];
  _listFCLvl2: any[] = [];

  // Column Filters
  filterFeeCode = '';
  filterFeeName = '';
  filterFeeNameEn = '';
  filterGroupFee = '';
  filterRevenueGroup = '';
  filterPaymentGroup = '';

  constructor(private feeService: FeeService, private notificationService: NotificationService,private gFeeService:GroupFeeService,
    private authService:AuthService, private _export:ExportService, private feeCodeService: FeeCodeService) {
    let user = this.authService.getLoggedInUser();
    // this._branchId = Number.parseInt(user.branchId);
    this._accept = this.authService.hasPermission('FEE_ACCEPT');
  }

  ngOnInit(): void {
    this.loadGFee();
    this.loadData();
    this.loadFCLvl1();
  }

  loadFCLvl1() {
    console.log('Loading Level 1 FeeCodes (Status: 2)...');
    this.feeCodeService.getAll(null, 1, 2).subscribe(res => {
      console.log('Level 1 FeeCodes loaded:', res.data);
      this._listFCLvl1 = res.data || [];
    });
  }

  onFCLvl1Change(item: any) {
    const id = item?.id || item; // Handle both object and primitive ID
    this._selectedFCLvl1 = typeof id === 'object' ? null : id;
    this._selectedFCLvl2 = null;
    this._listFCLvl2 = [];
    
    if (this._selectedFCLvl1) {
      console.log('Fetching Level 2 for Parent:', this._selectedFCLvl1);
      this.feeCodeService.getAll(this._selectedFCLvl1, 2, 2).subscribe(res => {
        this._listFCLvl2 = res.data || [];
        console.log('Level 2 loaded:', this._listFCLvl2);
      });
    }
    this.timKiem();
  }

  onFCLvl2Change(item: any) {
    const id = item?.id || item;
    this._selectedFCLvl2 = typeof id === 'object' ? null : id;
    this.timKiem();
  }

  setTab(tab: number) {
    this.tab = tab;
    this.pageIndex = 1;
    this.keyword = '';
    this._selectedFCLvl1 = null;
    this._selectedFCLvl2 = null;
    this._listFCLvl2 = [];
    
    if (tab == 2 && (!this._listFCLvl1 || this._listFCLvl1.length == 0)) {
      this.loadFCLvl1();
    }
    
    this.loadData();
  }

  setSubTab(sub: number) {
    this.subTab = sub;
    this.pageIndex = 1;
    this.keyword = '';
    this._selectedFCLvl1 = null;
    this._selectedFCLvl2 = null;
    this._listFCLvl2 = [];
    
    // Clear filters
    this.filterFeeCode = '';
    this.filterFeeName = '';
    this.filterFeeNameEn = '';
    this._feeCodeStatus = -1;

    // Reload Level 1 if needed
    if (!this._listFCLvl1 || this._listFCLvl1.length === 0) {
      this.loadFCLvl1();
    }
    
    this.loadData();
  }

  loadGFee() {
    this.gFeeService.getAll().subscribe((res: ResponseValue<GroupFee[]>) => {
      this.listGFees = res.data;
    });
  }

  changedGFee(item:GroupFee){
    // this._gFeeId=item.id;
    this.loadData();
  }
  exportExcel(){
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('keyword', this.keyword)
      .set('groupFeeId',this._gFeeId?.toString())
      this.busy = this.feeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Fee>>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res.data?.items;
          this._export.exportExcel(listData,'danh-muc-phi')
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  loadData(): void {
    if (this.tab == 1) {
      const params = new HttpParams()
        .set('pageIndex', this.pageIndex.toString())
        .set('pageSize', this.pageSize.toString())
        .set('keyword', this.keyword)
        .set('groupFeeId', this._gFeeId?.toString() || '')
        .set('feeCode', this.filterFeeCode)
        .set('feeName', this.filterFeeName)
        .set('groupCode', this.filterGroupFee)
      this.busy = this.feeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Fee>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listFee = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
    } else {
      const params = new HttpParams()
        .set('pageIndex', this.pageIndex.toString())
        .set('pageSize', this.pageSize.toString())
        .set('keyword', this.keyword)
        .set('status', this._feeCodeStatus.toString())
        .set('parentId', (this._selectedFCLvl2 || this._selectedFCLvl1 || '').toString())
        .set('level', (this.keyword || this.filterFeeCode || this.filterFeeName || this.filterFeeNameEn ? '' : this.subTab.toString()))
        .set('feeCode', this.filterFeeCode)
        .set('feeName', this.filterFeeName)
        .set('feeNameEnglish', this.filterFeeNameEn)
      this.busy = this.feeCodeService.getPaging(params).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.listFeeCode = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
    }
  }

  clickRow(item: any): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add() {
    if (this.tab == 1) {
      this.viewModal = true;
      setTimeout(() => {
        this.modalAddEdit.add();
      }, 50);
    } else {
      this.modalType = this.subTab;
      this.viewModal = true;
      setTimeout(() => {
        if (this.modalType == 1) this.modalCodeLvl1.add();
        else if (this.modalType == 2) this.modalCodeLvl2.add();
        else this.modalCodeAddEdit.add(3);
      }, 50);
    }
  }

  edit(item: any = null, flag: boolean = true): void {
    if (this.tab == 1) {
      let id = item?.id;
      if (!id) {
        const index = this.listFee.findIndex(x => x.checked);
        id = this.listFee[index]?.id;
      }
      this.viewModal = true;
      setTimeout(() => {
        this.modalAddEdit.edit(id?.toString(), flag);
      }, 50);
    } else {
      let id = item?.id;
      let lvl = item?.level || this.subTab;
      if (!id) {
        const index = this.listFeeCode.findIndex(x => x.checked);
        id = this.listFeeCode[index]?.id;
        lvl = this.listFeeCode[index]?.level;
      }
      this.modalType = lvl;
      this.viewModal = true;
      setTimeout(() => {
        if (this.modalType == 1) this.modalCodeLvl1.edit(id?.toString(), flag);
        else if (this.modalType == 2) this.modalCodeLvl2.edit(id?.toString(), flag);
        else this.modalCodeAddEdit.edit(id?.toString(), flag);
      }, 50);
    }
  }

  deleteConfirm(): void {
    let listItems: any[] = this.tab == 1 ? this.listFee : this.listFeeCode;
    let listChecks = listItems.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    const service = this.tab == 1 ? this.feeService : this.feeCodeService;
    service.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    let listItems: any[] = this.tab == 1 ? this.listFee : this.listFeeCode;
    listItems.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    let listItems: any[] = this.tab == 1 ? this.listFee : this.listFeeCode;
    if (listItems)
      return listItems.every(_ => _.checked);
  }

  icheck() {
    let listItems: any[] = this.tab == 1 ? this.listFee : this.listFeeCode;
    if (!listItems) return;
    let checks = listItems.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  accept(item:Fee){
    this.feeService.accept(item.id.toString()).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      }
    }, () => {
      this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
    });
  }

  changeStatus(item: FeeCode, status: number) {
    this.feeCodeService.changeStatus(item.id, status).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.loadData();
      } else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      }
    });
  }

}
