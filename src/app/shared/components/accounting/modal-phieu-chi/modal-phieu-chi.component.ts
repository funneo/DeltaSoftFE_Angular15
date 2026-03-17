import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Accounts, Branch, User, Customer, Employee, ResponseValue, AdvanceGroup, PermissionAdvance, AccountList, OtherCategories, AccountingDetail, Supplier, PrintForm } from '@app/shared/models';
import { NotificationService, AccountsService, BranchService, CustomerService, AuthService, UtilityService, EmployeeService, AdvanceGroupService, PermissionAdvanceService, AccountListService, OtherCategoriesService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { map } from 'rxjs/operators';
import { SupplierService } from '@app/shared/services/supplier.service';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';

@Component({
  selector: 'modal-phieu-chi',
  templateUrl: './modal-phieu-chi.component.html',
  styleUrls: ['./modal-phieu-chi.component.css']
})
export class ModalPhieuChiComponent implements OnInit {
  entity: Accounts;
  flagXem: boolean = false;
  flagSave: boolean = false;
  flagNew: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  _branchId: number;
  _employeeId: number;
  listAccountList: AccountList[];
  _ngayLap: string = moment(new Date()).format('DD/MM/YYYY');
  _ngayChungtu?: string = '';
  _type?: number = 0;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listCurrencys = UtilityService.listCurrencys();
  listTypes: any[] = [
    { id: 1, text: 'Nhân viên công ty' },
    { id: 2, text: 'Khách hàng' },
    { id: 3, text: 'Nhà cung cấp' },
    { id: 0, text: 'Đối tượng khác' }
  ];
  groupType: number;
  listCustomers: Customer[];
  flagLink: boolean = false;

  listDinhKhoan: AccountingDetail[] = [];
  listTaiKhoan: OtherCategories[];
  listSupplier: Supplier[];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private accountsService: AccountsService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService, private accountListService: AccountListService,
    private _utilityService: UtilityService, private customerService: CustomerService, private otherCategoriesService: OtherCategoriesService,
    private suppliertSerive: SupplierService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadOtherCategory();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadCustomer() {
    const params = new HttpParams()
      .set('keyword', '')
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomers = res.data;
    });
  }

  changedGroupType(event: any) {
    this.loadDonVi(event.id);
    this.groupType = event.id;

  }

  changedFund(event: AccountList) {
    this.entity.currency = event.currency;
    this._type = event.type;
    if (this._type < 1) this._ngayChungtu = '';
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this._branchId.toString());
    this.busy = this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data
      }
      else {
        if (res.code == "204") {
          this.listSupplier = [];
        } else {
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }


  loadDonVi(n: number) {
    switch (n) {
      case 1:
        // this.loadEmployee();
        break;
      case 2:
        this.loadCustomer();
        break;
      case 3:
        this.loadSupplier();
        break;
      default:
        break;
    }
  }

  loadQuy() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.accountListService.getAll(params).subscribe((res: ResponseValue<AccountList[]>) => {
      this.listAccountList = res.data;
      let index = this.listAccountList?.findIndex(it => it.id === this.entity.accountListId);
      this._type = this.listAccountList[index]?.type;
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'ACCOUNTING');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listTaiKhoan = res.data;
    });
  }

  selectedDate(event) {
    this._ngayChungtu = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this._ngayChungtu == null)
      this._ngayChungtu = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(item: any = null) {
    this.entity = {
      status: true,
      branchId: this._branchId,
      accountBranchId: this._branchId,
      treasurerId: this._employeeId,
      isTransfer: false,
      type: 1,
      currency: 'VND',
      refDate: moment(new Date()).format('DD/MM/YYYY')
    };
    if (item != undefined && item != null) {
      debugger;
      this.groupType = item?.groupType;
      this.loadDonVi(item?.groupType);
      this.flagLink = true;
      this.entity.groupType = item?.groupType;
      this.entity.employeeId = item?.employeeId;
      this.entity.customerId = item?.customerId;
      this.entity.supplierId = item?.supplierId;
      this.entity.amount = item?.amount;
      this.entity.documentNo = item?.refNo;
      this.entity.contents = item?.notes;
      this.entity.paymentDetailId = item?.accountid;
      this.entity.advanceId = item?.advanceId;
      this.entity.typeAccount = item?.typeAccount;

    }
    this.loadQuy();
    this.loadEmployee();
    this.inputTen(1);
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.accountsService.getDetail(id).subscribe((res: ResponseValue<Accounts>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagLink = true;
        this.groupType = this.entity.groupType;
        this._branchId = this.entity.branchId;
        this.loadDonVi(this.groupType);
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._ngayLap = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.effectiveDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.effectiveDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._ngayChungtu = moment(this.entity.effectiveDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.flagXem = flag;
        this.flagSave = false;
        this.flagLink = true;
        this.loadQuy();
        this.loadEmployee();
        this.listDinhKhoan = this.entity.accountingDetails ?? [];
        if (this.listDinhKhoan && this.listDinhKhoan.length != 0) {
          this.listDinhKhoan.every(_ => _.tempId = _.id);
        }
        if (!this.flagXem)
          this.inputTen(1);
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this._ngayLap)
        this.entity.refDate = moment(this._ngayLap, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this._ngayChungtu)
        this.entity.effectiveDate = moment(this._ngayChungtu, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      this.entity.accountingDetails = this.listDinhKhoan.filter(
        (x) => x.debitAccount != null || x.creditAccount != null || x.debitAccount != '' || x.creditAccount != ''
      );
      if (this.entity.id == undefined) {
        this.accountsService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.entity.id = res.data;
            this.SaveSuccess.emit(res.data);
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code + res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.accountsService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code + res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }


  flagDinhKhoan: boolean = true;

  setDinhKhoan() {
    if (this.listDinhKhoan.length == 0) {
      this.flagDinhKhoan = true;
      return;
    }
    let tongTienNo: number = 0;
    let tongTienCo: number = 0;
    this.listDinhKhoan.forEach(x => {
      tongTienNo += x.debitAmount ?? 0;
      tongTienCo += x.creditAmount ?? 0;
    });
    if (tongTienCo != tongTienNo || this.entity.amount != tongTienNo) {
      this.flagDinhKhoan = false;
    }
    else this.flagDinhKhoan = true;
  }

  inputTen(i: number) {
    if (this.listDinhKhoan?.length == 0) {
      let item: AccountingDetail = {
        tempId: 1,
        debitAccount: null,
        debitAmount: 0,
        dbitDescription: '',
        creditAccount: null,
        creditAmount: 0,
        creditDescription: ''
      };
      this.listDinhKhoan.push(item);
    } else {
      let arrayId = this.listDinhKhoan.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });
      let item = this.listDinhKhoan.find((x) => x.tempId == maxId);
      if (item && (item.debitAccount != null || item.creditAccount != null)) {
        let item: AccountingDetail = {
          tempId: maxId + 1,
          debitAccount: null,
          debitAmount: 0,
          dbitDescription: '',
          creditAccount: null,
          creditAmount: 0,
          creditDescription: ''
        };
        this.listDinhKhoan.push(item);
      }
    }
  }

  viewAttachFiles = false;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'PHIEUCHI',
      functionName: 'CHI',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }

  removeItem(i: number) {
    this.listDinhKhoan.splice(i, 1);
    this.setDinhKhoan();
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  showPrint() {
    // console.log(this.entity);
    setTimeout(() => {
      this.accountsService.getDetail(this.entity.id.toString()).subscribe((res: ResponseValue<Accounts>) => {
        if (res.code == '200' || res.code == '201') {
          this.print(res.data)
        }
      });
    }, 50);
  }

  print(entity: Accounts) {
    let _entity: any = {};
    if (entity.tenDonVi == entity.represent)
      entity.tenDonVi = '';
    _entity.TongTien = entity.amount;
    // _entity.NgayThuChi = entity.refDate;

    _entity.NgayThuChi = moment(entity.refDate, FormatContstants.DATETIMEEN).format(
      FormatContstants.DATEVN
    );
    _entity.SoPhieu = entity.refNo;
    _entity.ChungTuSo = entity.documentNo ?? '';
    _entity.TenKhachHang = entity.tenDonVi ?? '';
    _entity.NoiDung = entity.contents ?? '';
    _entity.TienTe = entity.currency ?? '';
    _entity.TenCongTy = entity.ctyName ?? '';
    _entity.DiaChiCongTy = entity.ctyAdd ?? '';
    _entity.DaiDien = entity.represent ?? '';
    _entity.TenQuy = entity.tenQuy ?? '';
    _entity.ThuQuy = entity.tenThuQuy ?? '';
    _entity.LapPhieu = entity.tenThuQuy ?? ''

    let printContents;
    let noiDung: string = "";
    //     noiDung = `<table border="0" cellpadding="1" cellspacing="1" style="margin-left:10px; width:99%">  <tbody>   <tr>    <td style="width:400px"><span style="font-size:16px"><strong>{Ten_Cong_Ty}</strong></span></td>    <td style="text-align:center; width:200px"><strong>Mẫu số 01-TT</strong></td>   </tr>   <tr>    <td style="width:400px"><span style="font-size:12px">{Dia_Chi_Cong_Ty}</span></td>    <td style="text-align:center; width:200px"><span style="font-size:11px">Ban h&agrave;nh theo QĐ số 15/2006/QĐ-BTC ng&agrave;y 20/03/2006 của Bộ trưởng BTC</span></td>   </tr>   <tr>    <td style="width:400px">&nbsp;</td>    <td style="text-align:center; width:200px">&nbsp;</td>   </tr>  </tbody> </table>  <table border="0" cellpadding="1" cellspacing="1" style="margin-left:10px; width:99%">  <tbody>   <tr>    <td>&nbsp;</td>    <td style="text-align:right; width:120px"><span style="font-size:12px">Số phiếu:</span></td>    <td style="text-align:right; width:150px"><span style="font-size:12px"><strong>{So_Phieu}&nbsp;</strong></span></td>   </tr>   <tr>    <td>&nbsp;</td>    <td style="text-align:right"><span style="font-size:12px">Ng&agrave;y:&nbsp;</span></td>    <td style="text-align:right"><span style="font-size:12px"><strong>{Ngay_Thu_Chi}&nbsp;</strong></span></td>   </tr>  </tbody> </table>  <p style="text-align:center"><span style="font-size:24px"><strong>PHIẾU CHI</strong></span></p>  <table border="0" cellpadding="1" cellspacing="1" style="height:80px; margin-left:10px; width:98%">  <tbody>   <tr>    <td colspan="3" style="width:500px">Đơn vị:&nbsp;<strong>{Ten_Khach_Hang}</strong><strong>&nbsp;</strong></td>   </tr>   <tr>    <td colspan="3" style="width:450px">Đại diện: {Dai_Dien}</td>   </tr>   <tr>    <td colspan="3" style="width:450px">L&yacute; do: {Noi_Dung}</td>   </tr>   <tr>    <td colspan="3" style="width:450px">Số tiền:&nbsp; &nbsp; &nbsp;<strong> {Tong_Tien} {Tien_Te}</strong></td>   </tr>   <tr>    <td colspan="3" style="width:450px">Bằng chữ:&nbsp; <em>{Bang_Chu}</em></td>   </tr>   <tr>    <td colspan="2" style="width:300px">Chứng từ k&egrave;m theo: {Chung_Tu_So}</td>    <td style="width:300px">Quỹ: {Ten_Quy}</td>   </tr>  </tbody> </table>  <table border="0" cellpadding="1" cellspacing="1" style="height:80px; margin-left:10px; width:98%">  <tbody>   <tr>    <td colspan="4" style="text-align:center; width:50%">&nbsp;</td>    <td style="text-align:center">&nbsp;</td>   </tr>   <tr>    <td colspan="2" style="text-align:center; width:50%">&nbsp;</td>    <td colspan="3" rowspan="1" style="text-align:right; width:50%"><em>Ng&agrave;y {Hien_Tai_Ngay} Th&aacute;ng {Hien_Tai_Thang} Năm {Hien_Tai_Nam}</em></td>   </tr>   <tr>    <td style="text-align:center; width:120px">    <p>Người nhận tiền&nbsp;</p>    </td>    <td style="text-align:center; width:120px">Kế to&aacute;n&nbsp;</td>    <td style="text-align:center; width:120px">&nbsp; Thủ quỹ&nbsp;</td>    <td colspan="2" style="text-align:center;
    // width:120px">&nbsp; Lập phiếu</td>   </tr>   <tr>    <td colspan="5" style="width:120px">&nbsp;</td>   </tr>   <tr>    <td colspan="5" style="width:120px">&nbsp;</td>   </tr>   <tr>    <td style="text-align:center; width:120px">{Dai_Dien}</td>    <td style="text-align:center; width:120px">&nbsp;</td>    <td style="text-align:center; width:120px">{Thu_Quy}</td>    <td colspan="2" style="text-align:center; width:120px">{Lap_Phieu}</td>   </tr>  </tbody> </table>`

    let list = localStorage.getItem(SystemContstants.LISTMAUIN);
    if (list != null) {
      let listMauIn: PrintForm[] = JSON.parse(list);
      let index = listMauIn.findIndex(x => x.type == 2);
      if (index != -1)
        noiDung = listMauIn[index].content;
    }
    printContents = this._utilityService.PrintPhieuThu(noiDung, _entity);

    printContents = '<div class="kho-giay page-a4">' + printContents + '</div>';
    var newWin = window.frames["printf"];
    newWin.document.write(`
      <html>
        <head>
          <title>Phiếu thu</title>
          <link rel="stylesheet" type="text/css" href="../../../assets/css/print.css" />
        </head>
        <body onload="window.print(); window.close()">${printContents}</body>
      </html>`
    );
    newWin.document.close();
  }

}
