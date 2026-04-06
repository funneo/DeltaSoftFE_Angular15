import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalBankComponent } from '@app/shared/components/danhmuc/modal-bank/modal-bank.component';
import { MessageContstants } from '@app/shared/constants';
import { Bank, ResponseValue } from '@app/shared/models';
import { BankService, NotificationService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-banks',
    templateUrl: './banks.component.html',
    styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {
    pageIndex = 1;
    pageSize = 20;
    flagEdit = false;
    flagDelete = false;
    keyword = '';

    allBanks: Bank[] = [];       // toàn bộ dữ liệu từ API
    filteredBanks: Bank[] = [];  // sau khi filter theo keyword
    listBanks: Bank[] = [];      // trang hiện tại để hiển thị

    busy: Subscription;
    viewModal = false;

    @ViewChild(ModalBankComponent, { static: false }) modalAddEdit: ModalBankComponent;

    constructor(
        private bankService: BankService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.busy = this.bankService.getAll().subscribe((res: ResponseValue<Bank[]>) => {
            if (res.code == '200' || res.code == '201') {
                this.allBanks = res.data || [];
                this.applyFilter();
            } else if (res.code == '204') {
                this.allBanks = [];
                this.filteredBanks = [];
                this.listBanks = [];
            } else {
                this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
            }
        });
    }

    applyFilter(): void {
        const kw = this.keyword.trim().toLowerCase();
        this.filteredBanks = kw
            ? this.allBanks.filter(b =>
                (b.fullName || '').toLowerCase().includes(kw) ||
                (b.shortName || '').toLowerCase().includes(kw) ||
                (b.stockCode || '').toLowerCase().includes(kw) ||
                (b.bankGroup || '').toLowerCase().includes(kw)
            )
            : [...this.allBanks];
        this.pageIndex = 1;
        this.updatePage();
    }

    updatePage(): void {
        const start = (this.pageIndex - 1) * this.pageSize;
        this.listBanks = this.filteredBanks.slice(start, start + this.pageSize);
        this.resetCheck();
    }

    get totalRows(): number {
        return this.filteredBanks.length;
    }

    clickRow(item: Bank): void {
        item.checked = !item.checked;
        this.listBanks.forEach(it => { if (it !== item) it.checked = false; });
        this.icheck();
    }

    timKiem(): void {
        this.applyFilter();
    }

    pageChanged(event: PageChangedEvent): void {
        this.pageIndex = event.page;
        this.updatePage();
    }

    add(): void {
        this.viewModal = true;
        setTimeout(() => { this.modalAddEdit.add(); }, 50);
    }

    edit(flag: boolean): void {
        const item = this.listBanks.find(x => x.checked);
        this.viewModal = true;
        setTimeout(() => { this.modalAddEdit.edit(item.bankId.toString(), flag); }, 50);
    }

    deleteConfirm(): void {
        const checks: number[] = this.listBanks.filter(x => x.checked).map(i => i.bankId);
        this.notificationService.printConfirmationDialog(
            MessageContstants.CONFIRM_DELETE_MSG,
            () => this.delete(checks.join(','))
        );
    }

    delete(listIds: string): void {
        this.bankService.delete(listIds).subscribe((res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
                this.loadData();
            } else {
                this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code);
            }
        });
    }

    checkAll(ev): void {
        this.listBanks.forEach(x => x.checked = ev.target.checked);
        this.icheck();
    }

    isAllChecked() {
        if (this.listBanks && this.listBanks.length > 0)
            return this.listBanks.every(_ => _.checked);
        return false;
    }

    icheck() {
        const checks = this.listBanks.filter(x => x.checked);
        if (checks.length === 1) { this.flagDelete = true; this.flagEdit = true; }
        else if (checks.length > 1) { this.flagDelete = true; this.flagEdit = false; }
        else { this.flagDelete = false; this.flagEdit = false; }
    }

    resetCheck(): void {
        this.flagEdit = false;
        this.flagDelete = false;
    }

    saveSuccess(): void {
        this.loadData();
    }

    closeModal(): void {
        this.viewModal = false;
    }
}

