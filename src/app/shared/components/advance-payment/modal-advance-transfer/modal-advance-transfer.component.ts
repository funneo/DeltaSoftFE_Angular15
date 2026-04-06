import { HttpParams } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Advance, AdvanceGroup, Bank, Branch, Customer, Employee, OtherCategories, ResponseValue, Supplier } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AdvanceGroupService, AdvanceService, AuthService, BankService, BranchService, CustomerService, EmployeeService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ModalShipmentViewSearchComponent } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.component';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { SupplierService } from '@app/shared/services/supplier.service';

@Component({
  selector: 'modal-advance-transfer',
  templateUrl: './modal-advance-transfer.component.html',
  styleUrls: ['./modal-advance-transfer.component.css']
})
export class ModalAdvanceTransferComponent implements OnInit {
  entity: Advance;
  flagXem: boolean = false;
  flagSave: boolean = false;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  listGroup: AdvanceGroup[];
  groupId: number;
  // _viewAll=2;
  _functionId = SystemContstants.ADVANCE;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  _levelPermissionAdvance: number;
  _hasPermissionAdvance: boolean = false;
  _bangchu = '';
  listAdvanceGroupId: string[];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listSupplier: Supplier[] = [];
  listCustomer: Customer[] = [];
  listBank: Bank[] = [];
  listCurrencys = UtilityService.listCurrencys();
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private advanceService: AdvanceService, private customerService: CustomerService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService, private suppliertSerive: SupplierService,
    private bankService: BankService,
    private _utilityService: UtilityService, private advanceGroupService: AdvanceGroupService, private otherCategoriesService: OtherCategoriesService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('ADVANCE_ACCOUNT');
    this._accept = this.authService.hasPermission('ADVANCE_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);
    this._levelPermissionAdvance = Number.parseInt(user.advanceConfirmLevel);
    this.listAdvanceGroupId = user.listAdvanceGroupId?.split(',');

    // let list: any[] =UtilityService.getLocalParams(SystemContstants.APPSETTING);
    // let i=list?.findIndex(x=>x.id==this._functionId);
    // if(i!=-1){
    //   this._viewAll=list[i].value;
    // }
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadOtherCategory();
    this.loadCustomer();
    this.loadSupplier();
    this.loadBank();
  }
  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid', this._branchId.toString());
    this.suppliertSerive.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
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
  loadBank(): void {
    this.bankService.getAll().subscribe((res: ResponseValue<Bank[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listBank = res.data || [];
      }
    });
  }
  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  loadCustomer(): void {
    const params = new HttpParams()
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data
      }
    });
  }
  viewSearchJobId = false;
  @ViewChild(ModalShipmentViewSearchComponent, { static: false }) modalListShipment: ModalShipmentViewSearchComponent;
  getJobId() {
    this.viewSearchJobId = true;
    setTimeout(() => {
      this.modalListShipment.view(
        null,
        this._branchId, 1
      );
    }, 50);
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadAdvanceGroup() {
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listGroup = res.data?.filter(x => x.type == 2);
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'CURRENCY');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listCurrencys = [...res.data.filter(x => x.type === 'CURRENCY')];
    });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  changedSoTien(event): void {
    this._bangchu = this._utilityService.ReadNumber(event);
  }

  viewAttachFiles = false;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'ADVANCETRANSFER',
      functionName: 'ADVANCETRANSFER',
      refNo: this.entity.refNo,
      jobId: ''
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  add() {
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listGroup = res.data?.filter(x => x.type == 2);
      if (this.listGroup?.length > 0)
        this.groupId = this.listGroup[0].id;
      else this.groupId = null;
      this.entity = {
        status: true,
        isTransfer: true,
        branchId: this._branchId,
        invoiceBranchId: this._branchId,
        employeeId: this._employeeId,
        advanceGroupId: this.groupId,
        currency: 'VND',
        refDate: moment(new Date()).format('DD/MM/YYYY')
      };
      this.loadEmployee();
      this.flagXem = false;
      this.flagSave = false;
      this.modalAddEdit.show();
    });
  }
  supplierChanged(event: Supplier) {
    this.entity.accountNumber = event?.accountNumber;
    this.entity.bankId = event?.bankId;
  }

  edit(id: string, flag: boolean) {
    this.advanceService.getDetail(id).subscribe((res: ResponseValue<Advance>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this.entity.refDate = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this._branchId = this.entity.branchId;
        this.flagXem = flag;
        this.flagSave = false;
        this.loadAdvanceGroup();
        this.loadEmployee();
        //Nếu chuyển duyệt thi không cho sửa nữa
        if (this.entity.status) this.flagXem = true;
        //Xet quyen duyet
        if (this._accept && this.flagXem && this.entity.status && this._levelPermissionAdvance > 0 && this._levelPermissionAdvance == (this.entity.acceptStep || 0) + 1) {
          let index = this.listAdvanceGroupId.findIndex(x => x == this.entity.advanceGroupId.toString());
          if (index != -1) this._hasPermissionAdvance = true;
        }
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
      if (this.entity.refDate)
        this.entity.refDate = moment(this.entity.refDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this.entity.id == undefined) {
        this.advanceService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            if (res.message == 'OVER')
              this._notificationService.printErrorMessage('Tạm ứng vượt hạn mức cho phép!');
            else
              this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.entity.refDate = moment(this.entity.refDate, FormatContstants.CLIENTDATE).format(
              FormatContstants.DATEVN
            );
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.advanceService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            if (res.message == 'OVER')
              this._notificationService.printErrorMessage('Tạm ứng vượt hạn mức cho phép!');
            else
              this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.entity.refDate = moment(this.entity.refDate, FormatContstants.CLIENTDATE).format(
              FormatContstants.DATEVN
            );
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  changedAccept(event: boolean) {
    if (!this.flagSave) {
      let item: Advance = {
        id: this.entity.id,
        feedback: this.entity.feedback,
        status: event,
      };
      this.flagSave = true;
      this.advanceService.accept(item).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.modalAddEdit.hide();
            this.SaveSuccess.emit(res.data);
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG
            );
            this.flagSave = false;
          }
        },
        () => {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG
          );
          this.flagSave = false;
        }
      );
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
  saveSuccessFile(event: any): void {
    console.log(event);
  }

  saveSuccessJobId(event: any) {
    this.entity.shipmentId = event.id;
    this.entity.jobId = event.jobId;
    this.entity.customerId = event.customerId;
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
  closeSearchJobIdModal() {
    this.viewSearchJobId = false;
  }
}
