import { ModalAdditionalInvoiceInformationComponent } from './../../../shared/components/advance-payment/modal-additional-invoice-information/modal-additional-invoice-information.component';
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalAdditionalInvoiceInformationModule } from '@app/shared/components/advance-payment/modal-additional-invoice-information/modal-additional-invoice-information.module';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Profile, ResponseValue } from '@app/shared/models';
import { AdditionalInvoiceInformation } from '@app/shared/models/advance-payments/additional-invoice-information.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { AdditionalInvoiceInformationService } from '@app/shared/services/advance-payment/additional-invoice-information.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { ExportService } from '@app/shared/services/export-excel.service';

import { ModalPaymentDetailComponent } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.component';
import { Payments } from '@app/shared/models';
import { PaymentsService } from '@app/shared/services';

@Component({
  selector: 'app-additional-invoice-information',
  templateUrl: './additional-invoice-information.component.html',
  styleUrls: ['./additional-invoice-information.component.css']
})
export class AdditionalInvoiceInformationComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  totalAmount = 0;
  flagEdit = false;
  flagDelete = false;
  flagView = false;
  flagSave = false;
  keyword = '';
  listData: AdditionalInvoiceInformation[];
  listFilter: AdditionalInvoiceInformation[];
  listShow: AdditionalInvoiceInformation[];
  listBranch: Branch[] = [];
  userLoged?: Profile;
  _accept: boolean = false;
  _branchId: number;
  tongtien: number = 0;
  busy: Subscription;
  viewModal = false;
  ngayBatDau: Date = this._utilityService.ngayBanDau;
  ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  _isAdmin = false;
  nguoiSearch?: string = '';
  soSearch?: string = '';
  ngaySearch?: string = '';
  sohoadonSearch?: string = '';
  ngayhoadonSearch?: string = '';
  webSearch?: string = '';
  ghichuSearch?: string = '';
  noidungSearch?: string = '';
  mstSearch?: string = '';
  codeSearch?: string = '';
  public soPhieuThanhToanSearch?: string = '';

  @ViewChild(ModalAdditionalInvoiceInformationComponent, { static: false }) modalAddEdit: ModalAdditionalInvoiceInformationComponent
  @ViewChild(ModalPaymentDetailComponent, { static: false }) modalPaymentDetail: ModalPaymentDetailComponent;

  constructor(private service: AdditionalInvoiceInformationService, private notificationService: NotificationService, private branchService: BranchService,
    public datepipe: DatePipe, private router: Router, private _utilityService: UtilityService, private authService: AuthService,
    private paymentsService: PaymentsService, private exportService: ExportService) {
    this.userLoged = this.authService.getLoggedInUser();

    this._accept = this.authService.hasPermission('F001_ACCEPT');
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._isAdmin = this.userLoged.isAdmin;
  }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadBranch();
    this.loadData();
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadBranch() {
    const params = new HttpParams()
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }


  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('pageIndex', "1")
      .set('pageSize', "9999");
    this.busy = this.service.getPaging(params).subscribe((res: ResponseValue<AdditionalInvoiceInformation[]>) => {
      if (res.code == '200' || res.code == '201' || res.code == '204') {
        this.listData = res.data;
        this.filter();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  loadDataPaging() {
    if (this.listFilter) {
      this.listShow = this.listFilter.slice((this.pageIndex - 1) * this.pageSize, this.pageIndex * this.pageSize);
    }
  }

  filter() {
    this.listFilter = Object.assign([], this.listData);
    if (this.nguoiSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.createdByName.toString().toLowerCase().includes(this.nguoiSearch.trim().toLocaleLowerCase());
      });
    if (this.soSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.refNo.toLowerCase().includes(this.soSearch.trim().toLocaleLowerCase());
      });
    if (this.soPhieuThanhToanSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.detailRefNos?.toLowerCase().includes(this.soPhieuThanhToanSearch.trim().toLocaleLowerCase());
      });
    if (this.noidungSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.contents?.toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
      });
    // if(this.tienSearch?.length>0)
    // this.listFilter=this.listFilter.filter((data)=>{
    //   return data.debitBalance?.toString().toLowerCase().includes(this.tienSearch.trim().toLocaleLowerCase());
    // });
    if (this.ghichuSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.note?.toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
      });

    if (this.ngaySearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });

    if (this.sohoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceNo?.toLowerCase().includes(this.sohoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.ngayhoadonSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.invoiceDate?.toLowerCase().includes(this.ngayhoadonSearch.trim().toLocaleLowerCase());
      });
    if (this.mstSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.taxNumber?.toLowerCase().includes(this.mstSearch.trim().toLocaleLowerCase());
      });
    if (this.webSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.web?.toLowerCase().includes(this.webSearch.trim().toLocaleLowerCase());
      });
    if (this.codeSearch?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {
        return data.code?.toLowerCase().includes(this.codeSearch.trim().toLocaleLowerCase());
      });

    this.totalRows = this.listFilter.length;
    this.pageIndex = 1;
    this.loadDataPaging();
  }

  clickRow(item: AdditionalInvoiceInformation): void {
    this.listData.forEach(it => {
      if (it != item) it.checked = false;
    })
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadDataPaging();
  }

  exportExcel() {
    const exportData = this.listFilter.map(item => ({
      'Người lập phiếu': item.createdByName,
      'Số phiếu': item.refNo,
      'Số phiếu thanh toán': item.detailRefNos,
      'Ngày lập': this.datepipe.transform(item.createdDate, 'dd/MM/yyyy'),
      'Nội dung': item.contents,
      'Số hóa đơn': item.invoiceNo,
      'Ngày hóa đơn': item.invoiceDate,
      'MST': item.taxNumber,
      'Web': item.web,
      'Code': item.code,
      'Ghi chú': item.note,
      'Trạng thái': item.status == -1 ? 'Từ chối' : (item.status == 0 ? 'Khởi tạo' : (item.status == 1 ? 'Chuyển duyệt' : 'Duyệt'))
    }));
    this.exportService.exportExcel(exportData, 'Thong_tin_hoa_don_bo_sung');
  }

  edit(flag: boolean): void {
    const index = this.listData.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listData[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }


  icheck() {
    let checks = this.listData.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagView = true;
      if (checks[0].status < 1) {
        this.flagDelete = checks[0].createdBy == this.userLoged.id;
        this.flagEdit = checks[0].createdBy == this.userLoged.id;
      } else {
        this.flagDelete = false;
        this.flagEdit = false;
      }
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  showModal(item: AdditionalInvoiceInformation) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true);
    }, 50);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  getPaymentLinks(item: AdditionalInvoiceInformation): { refNo: string }[] {
    if (!item.detailRefNos) return [];

    const refNos = item.detailRefNos.split(',').map(s => s.trim());

    return refNos.map((refNo) => ({
      refNo: refNo
    }));
  }

  openPaymentModal(refNo: string) {
    if (refNo) {
      this.paymentsService.getByRefNo(refNo).subscribe((res: ResponseValue<Payments>) => {
        if (res.code == '200' || res.code == '201') {
          const paymentId = res.data.id;
          if (paymentId > 0) {
            setTimeout(() => {
              this.modalPaymentDetail.edit(paymentId, true);
            }, 50);
          }
        } else {
          this.notificationService.printErrorMessage("Không tìm thấy thông tin phiếu chi!");
        }
      });
    }
  }

  closeModalPayment() {
    this.loadData();
  }

}
