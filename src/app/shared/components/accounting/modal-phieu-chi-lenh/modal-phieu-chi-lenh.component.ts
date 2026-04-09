import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { AccountList, AccountingDetail, Accounts, AcountDispatchOrderFees, Branch, Customer, Employee, OtherCategories, ResponseValue, Supplier } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import * as moment from 'moment';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { MessageContstants } from '@app/shared/constants';
import { NgForm } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { SupplierService } from '@app/shared/services/supplier.service';
import { AccountListService, AccountsService, AuthService, BranchService, CustomerService, EmployeeService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AccountsPaymentDetail } from '@app/shared/models/accounts-payment-detail.model';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { DispatchOrderFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-fee';

@Component({
    selector: 'modal-phieu-chi-lenh',
    templateUrl: './modal-phieu-chi-lenh.component.html',
    styleUrls: ['./modal-phieu-chi-lenh.component.css']
})
export class ModalPhieuChiLenhComponent implements OnInit {
    entity: Accounts;
    flagXem: boolean = false;
    flagSave: boolean = false;
    flagNew: boolean = false;
    busy: Subscription;
    listBranch: Branch[];
    maskNumber = UtilityService.maskNumber;
    listDispatchOrderFees: DispatchOrderFee[] = [];
    listEmployee: Employee[];
    _branchId: number;
    _employeeId: number;
    listAccountList: AccountList[];
    _ngayLap: string = moment(new Date()).format('DD/MM/YYYY');
    _ngayChungtu?: string = '';
    _type?: number;
    dateTimeOptions = this._utilityService.dateTimeOptionDays(
        new Date(),
        false
    );
    listCurrencys = UtilityService.listCurrencys();

    flagLink: boolean = false;
    selectedItem = false;
    listDinhKhoan: AccountingDetail[] = [];
    listTaiKhoan: OtherCategories[];
    listSupplier: Supplier[];

    @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
    @Output() CloseModal: EventEmitter<any> = new EventEmitter;
    @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

    constructor(private _notificationService: NotificationService, private accountsService: AccountsService,
        private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService, private accountListService: AccountListService,
        private _utilityService: UtilityService, private otherCategoriesService: OtherCategoriesService,
        private dispatchOrderService: DispatchordersService) {
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

    changedEmployee(event: any) {
        if (event) {
            this.loadDispatchOrderFees(event.id);
        } else {
            this.listDispatchOrderFees = [];
            this.entity.amount = 0;
        }
    }

    loadDispatchOrderFees(employeeId: number) {
        this.accountsService.getDriverPayments(employeeId).subscribe((res: ResponseValue<DispatchOrderFee[]>) => {
            if (res.code == '200' || res.code == '201') {
                this.listDispatchOrderFees = res.data;
                if (this.listDispatchOrderFees) {
                    let total = 0;
                    this.listDispatchOrderFees.forEach(x => {
                        x.checked = true;
                        total += x.totalCost ? x.totalCost : 0;
                    });
                    this.entity.amount = total;
                    this.selectedItem = this.listDispatchOrderFees.length > 0;
                }
            }
        });
    }

    changedFund(event: AccountList) {
        this.entity.currency = event.currency;
        this._type = event.type;
        if (this._type < 1) this._ngayChungtu = '';
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
            refDate: moment(new Date()).format('DD/MM/YYYY'),
            accountPayments: [],
            dispatchOrderFees: [],
            accountType: 2, //Là phiếu chi từ lệnh
            groupType: 1 // Always 1 for Employee
        };

        this.loadQuy();
        this.loadEmployee();
        this.inputTen(1);
        this.flagXem = false;
        this.flagSave = false;
        this.flagNew = true;
        this.listDispatchOrderFees = [];
        this.modalAddEdit.show();
    }

    edit(id: string, flag: boolean) {
        this.accountsService.getDetail(id).subscribe((res: ResponseValue<Accounts>) => {
            if (res.code == '200' || res.code == '201') {
                this.entity = res.data;
                this._branchId = this.entity.branchId;
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
                this.listDispatchOrderFees = [];
                if (this.entity.dispatchOrderFees && this.entity.dispatchOrderFees.length > 0) {
                    this.listDispatchOrderFees = this.entity.dispatchOrderFees.map(it => {
                        return {
                            feeId: it.feeId,
                            feeCode: it.feeCode,
                            contents: it.contents,
                            type: it.type,
                            amount: it.amount,
                            vat: it.vat,
                            totalCost: it.totalCost
                        }
                    });
                }

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

    checkAllDispatchOrder(ev) {
        this.selectedItem = false;
        let total = 0;
        this.listDispatchOrderFees.forEach(it => {
            it.checked = ev.target.checked;
            if (it.checked) {
                total += it.totalCost ? it.totalCost : 0;
                this.selectedItem = true;
            }
        });
        this.entity.amount = total;
    }

    isAllDispatchOrderChecked() {
        if (this.listDispatchOrderFees && this.listDispatchOrderFees.length > 0)
            return this.listDispatchOrderFees.every(x => x.checked);
        return false;
    }

    calculatorDispatchOrder(item: DispatchOrderFee) {
        this.selectedItem = false;
        let total = 0;
        this.listDispatchOrderFees.forEach(it => {
            if (it.checked) {
                total += it.totalCost ? it.totalCost : 0;
                this.selectedItem = true;
            }
        })
        this.entity.amount = total;
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
            this.entity.accountingDetails = [];

            this.entity.typeAccount = 2; //Phiếu chi lệnh
            this.listDispatchOrderFees.forEach(it => {
                //if (it.checked) {
                let nItem: AcountDispatchOrderFees = {
                    feeId: it.feeId,
                    feeCode: it.feeCode,
                    contents: it.contents,
                    type: it.type,
                    amount: it.cost,
                    vat: it.vat,
                    amountAfterVat: it.totalCost
                }
                this.entity.dispatchOrderFees.push(nItem);
                //}
            })

            if (this.entity.id == undefined) {
                this.accountsService.createForDriver(this.entity).subscribe((res: ResponseValue<any>) => {
                    if (res.code == '200' || res.code == '201') {
                        this.entity.id = res.data;
                        // Fetch the full entity to get the auto-generated refNo
                        this.accountsService.getDetail(res.data.toString()).subscribe((detailRes: ResponseValue<Accounts>) => {
                            if (detailRes.code == '200' || detailRes.code == '201') {
                                this.entity.refNo = detailRes.data.refNo;
                                this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
                                this.SaveSuccess.emit(res.data);
                            }
                        });
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
}
