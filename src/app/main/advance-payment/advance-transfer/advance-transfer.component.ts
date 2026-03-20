import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Advance, Pagination, Employee, ResponseValue, Branch } from '@app/shared/models';
import { AuthService, EmployeeService, NotificationService, AdvanceService, UtilityService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalPhieuChiComponent } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.component';
import { ModalAdvanceComponent } from '@app/shared/components/advance-payment/modal-advance/modal-advance.component';
import * as signalR from '@aspnet/signalr';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { ModalPhieuThuComponent } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.component';
import { DatePipe } from '@angular/common';
import { ExportService } from '@app/shared/services/export-excel.service';
import { ModalAdvanceTransferComponent } from '@app/shared/components/advance-payment/modal-advance-transfer/modal-advance-transfer.component';

@Component({
    selector: 'app-advance-transfer',
    templateUrl: './advance-transfer.component.html',
    styleUrls: ['./advance-transfer.component.css']
})
export class AdvanceTransferComponent implements OnInit {
    pageIndex = 1;
    pageSize = 9999;
    totalRows = 0;
    totalAmount = 0;
    flagEdit = false;
    flagDelete = false;
    flagView = false;
    flagSave = false;
    keyword = '';
    listAdvance: Advance[];
    listFilter: Advance[];
    listEmployee: Employee[];
    employeeId?: number;
    _acc: boolean = false;
    _accept: boolean = false;
    _auth: number = 5;
    _employeeId: number;
    _branchId: number;
    _levelPermissionAdvance: number;
    _hasPermissionAdvance: boolean = false;
    _listAdvanceGroupId: string[];
    _viewAll = 2;
    _functionId = SystemContstants.ADVANCETRANSFER;
    busy: Subscription;
    viewModal = false;
    viewAccounts = false;
    listStatus = UtilityService.listTrangThaiDuyets();
    listLables = UtilityService.listLableTrangThaiDuyets();
    ngayBatDau: Date = this._utilityService.ngayBanDau;
    ngayKetThuc: Date = this._utilityService.ngayKetThuc;
    dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    flagAccounts: boolean = false;
    viewRepaymentHistory: boolean = false;
    _hubConnection: signalR.HubConnection;
    listBranch: Branch[];
    _isAdmin = false;

    nguoiSearch?: string = '';
    soSearch?: string = '';
    ngaySearch?: string = '';
    phapnhanSearch?: string = '';
    lydoSearch?: string = '';
    chungtuSearch?: string = '';
    tienSearch?: string = '';

    listStep: any[] = [{ id: 1, text: 'Đã duyệt' }, { id: 0, text: 'Chưa duyệt' }, { id: 2, text: 'Tất cả' }];
    _step = 2;
    @ViewChild(ModalAdvanceTransferComponent, { static: false }) modalAddEdit: ModalAdvanceTransferComponent
    @ViewChild(ModalPhieuChiComponent, { static: false }) modalPhieuChi: ModalPhieuChiComponent
    @ViewChild(ModalPhieuThuComponent, { static: false }) modalPhieuThu: ModalPhieuThuComponent
    constructor(private advanceService: AdvanceService, private notificationService: NotificationService,
        public datepipe: DatePipe, private _utilityService: UtilityService,
        private employeeService: EmployeeService,
        private authService: AuthService,
        private exportService: ExportService,
        private branchService: BranchService
    ) {
        let user = this.authService.getLoggedInUser();
        this._auth = Number.parseInt(user.authorisationLevel);
        this._employeeId = Number.parseInt(user.employeeId);
        this._acc = this.authService.hasPermission('ADVANCE_ACCOUNT');
        this._accept = this.authService.hasPermission('ADVANCE_ACCEPT');
        this._branchId = Number.parseInt(user.branchId);
        this._levelPermissionAdvance = Number.parseInt(user.advanceConfirmLevel);
        this._listAdvanceGroupId = user.listAdvanceGroupId?.split(',');
        this.employeeId = this._employeeId;
        this._isAdmin = user.isAdmin;

        //console.log(this._listAdvanceGroupId);
        //signalR
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}/signalr`)
            .build();

        this._hubConnection
            .start()
            .then(() => console.log('Connection started!'))
            .catch(err => console.log('Error while establishing connection :('));
        this._hubConnection.on('sendToAll', (receivedMessage: string) => {
            this.loadData();
        });
    }

    ngOnInit(): void {
        let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
        let i = list?.findIndex(x => x.id == this._functionId)
        if (i != -1) {
            this._viewAll = list[i].value;
        }
        if (this._auth <= this._viewAll) {
            this._employeeId = null;
        }

        this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
        this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
        this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
        this.loadEmployee();
        this.loadChiNhanh();
        this.loadData();
    }

    selectedDate(event) {
        this.ngayBatDau = new Date(event.start);
        this.ngayKetThuc = new Date(event.end);
        this.timKiem();
    }

    export() {
        let printList = this.listFilter.map(({ id, status, branchId, invoiceBranchId, employeeId, advanceGroupId,
            type, isTransfer, relatedDocuments, styleStep, ...item }) => item);
        this.exportService.exportExcel(printList, 'tam-ung-chuyen-khoan');
    }

    loadEmployee() {
        const params = new HttpParams()
            .set('branchId', this._branchId?.toString());
        this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
            this.listEmployee = res.data;
        });
    }

    changedEmployee(event: Employee) {
        this._employeeId = event?.id;
        this.timKiem();
    }

    loadChiNhanh() {
        this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
            this.listBranch = res.data;
        });
    }

    changedChiNhanh() {
        if (this._auth <= this._viewAll) {
            this._employeeId = null;
        }
        this.loadEmployee();
        this.timKiem();
    }

    loadData(): void {
        let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
        let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
        const params = new HttpParams()
            .set('pageIndex', this.pageIndex.toString())
            .set('pageSize', this.pageSize.toString())
            .set('keyword', this.keyword)
            .set('fromDate', tuNgay)
            .set('toDate', denNgay)
            .set('employeeId', this._employeeId?.toString())
            .set('step', this._step?.toString())
            .set('branchId', this._branchId?.toString())
            .set('isTransfer', 'true');
        this.busy = this.advanceService.getPaging(params).subscribe((res: ResponseValue<Pagination<Advance>>) => {
            if (res.code == '200' || res.code == '201') {
                this.listAdvance = res.data?.items;
                this.listFilter = this.listAdvance;
                this.calculator();
                this.totalAmount = res.data?.totalAmount;
                this.listAdvance.forEach(x => {
                    x.styleStep = x.acceptStep.toString();
                    if (!x.status)
                        x.styleStep = "Entity";
                    if (x.isComplete && x.amount > 0)
                        x.styleStep = 'Completed';
                    if (x.isComplete && x.amount < 0)
                        x.styleStep = 'Completed2';
                    if (x.isPayment)
                        x.styleStep = 'Paymented';
                    if (this._listAdvanceGroupId.findIndex(_ => _ == x.advanceGroupId.toString()) != -1)
                        x.has_accept = true;
                });
            }
            else {
                this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
            }
        });
    }

    filter() {
        this.listFilter = Object.assign([], this.listAdvance);
        if (this.nguoiSearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return data.employeeName.toString().toLowerCase().includes(this.nguoiSearch.trim().toLocaleLowerCase());
            });
        if (this.soSearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return data.refNo.toLowerCase().includes(this.soSearch.trim().toLocaleLowerCase());
            });
        if (this.phapnhanSearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return data.invoiceBranchCode?.toLowerCase().includes(this.phapnhanSearch.trim().toLocaleLowerCase());
            });
        if (this.tienSearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return data.amount?.toString().toLowerCase().includes(this.tienSearch.trim().toLocaleLowerCase());
            });
        if (this.lydoSearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return data.reason?.toLowerCase().includes(this.lydoSearch.trim().toLocaleLowerCase());
            });
        if (this.chungtuSearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return data.relatedDocuments?.toLowerCase().includes(this.chungtuSearch.trim().toLocaleLowerCase());
            });
        if (this.ngaySearch?.length > 0)
            this.listFilter = this.listFilter.filter((data) => {
                return this.datepipe.transform(data.refDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
            });
        this.calculator();
    }
    calculator() {
        this.totalAmount = 0;
        this.totalRows = this.listFilter?.length;
        this.listFilter.forEach(it => {
            this.totalAmount += it.amount;
        })
    }

    clickRow(item: Advance): void {
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

    add(): void {
        this.viewModal = true;
        setTimeout(() => {
            this.modalAddEdit.add();
        }, 50);
    }

    edit(flag: boolean): void {
        const index = this.listAdvance.findIndex(x => x.checked);
        this.viewModal = true;
        setTimeout(() => {
            this.modalAddEdit.edit(this.listAdvance[index].id.toString(), flag);
        }, 50);
    }

    deleteConfirm(): void {
        let listChecks = this.listAdvance.filter(x => x.checked);
        let checks: number[] = [];
        for (let items of listChecks) {
            checks.push(items.id)
        }
        this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
    }

    delete(listIds: string): void {
        this.advanceService.delete(listIds).subscribe((res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
                this.loadData();
            }
            else {
                this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
            }
        });
    }

    checkAll(ev) {
        this.listAdvance.forEach(x => x.checked = ev.target.checked)
        this.icheck();
    }

    isAllChecked() {
        if (this.listAdvance)
            return this.listAdvance.every(_ => _.checked);
    }

    icheck() {
        let checks = this.listAdvance.filter(x => x.checked);
        if (checks.length == 1) {
            this.flagView = true;
            if (checks[0].acceptStep == -1 || checks[0].acceptStep == 0) {
                this.flagDelete = checks[0].employeeId == this.employeeId;
                this.flagEdit = checks[0].employeeId == this.employeeId;
            }
        }
        // else if (checks.length > 1) {
        //   this.flagDelete = false;
        //   this.flagEdit = false;
        //   this.flagAccounts=false;
        // }
        else {
            this.flagDelete = false;
            this.flagEdit = false;
            this.flagAccounts = false;
        }
    }

    saveSuccess(): void {
        this.loadData();
    }

    showModal(item: Advance) {
        this.viewModal = true;
        setTimeout(() => {
            this.modalAddEdit.edit(item.id.toString(), true);
        }, 50);
    }

    closeModal(): void {
        this.viewModal = false;
    }

    _entity: Advance;
    viewPhieuchi = false;
    showPhieuChi(entity: Advance) {
        this._entity = entity;
        let item: any = {};
        item.groupType = 3;
        item.supplierId = entity.supplierId;
        item.amount = entity.amount;
        item.refNo = entity.refNo;
        item.notes = entity.reason;
        item.accountid = entity.id;
        item.advanceId = entity.id;
        item.typeAccount = 0;
        item.isTransfer = true;
        this.viewPhieuchi = true;
        setTimeout(() => {
            this.modalPhieuChi.add(item);
        }, 50);
    }

    showPhieuThu(entity: Advance) {
        this._entity = entity;
        let item: any = {};
        item.groupType = 1;
        item.employeeId = entity.employeeId;
        item.amount = -entity.amount;
        item.refNo = entity.refNo;
        item.notes = entity.reason;
        item.accountid = entity.id;
        this.viewAccounts = true;
        setTimeout(() => {
            this.modalPhieuThu.add(item);
        }, 50);
    }

    saveSuccessAccounts(event: any): void {
        if (event > 0) {
            let item: Advance = {
                id: this._entity.id,
                feedback: 'Completed',
                status: true
            };
            this.advanceService.accept(item).subscribe((res: ResponseValue<any>) => {
                if (res.code == '200' || res.code == '201') {
                    this.loadData();
                    this.flagAccounts = false;
                }
            });
        }
    }

    closeAccounts(): void {
        this.viewAccounts = false;
    }

    accept(entity: Advance, b: boolean) {
        if (!this.flagSave) {
            this.flagSave = true;
            let item: Advance = {
                id: entity.id,
                feedback: "",
                status: b,
            };
            let _ok = b;
            if (!b) {
                let retVal = prompt("Lý do từ chối", "");
                if (retVal) {
                    _ok = true;
                }
                item.feedback = retVal ?? "";
            }
            if (_ok) {
                this.advanceService.accept(item).subscribe(
                    (res: ResponseValue<any>) => {
                        if (res.code == "200" || res.code == "201") {
                            this.loadData();
                            this.flagSave = false;
                        } else {
                            this.notificationService.printErrorMessage(
                                MessageContstants.UPDATED_ERR_MSG
                            );
                            this.flagSave = false;
                        }
                    },
                    () => {
                        this.notificationService.printErrorMessage(
                            MessageContstants.UPDATED_ERR_MSG
                        );
                        this.flagSave = false;
                    }
                );
            }
        }

    }
}
