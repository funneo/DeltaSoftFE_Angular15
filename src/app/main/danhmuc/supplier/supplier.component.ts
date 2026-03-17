import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSupplierComponent } from '@app/shared/components/danhmuc/modal-supplier/modal-supplier.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, ResponseValue, Supplier } from '@app/shared/models';
import { NotificationService } from '@app/shared/services';
import { DistrictService } from '@app/shared/services/district.service';
import { ExportService } from '@app/shared/services/export-excel.service';
import { ProvinceService } from '@app/shared/services/province.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listSupplier: Supplier[];
  busy: Subscription;
  viewModal = false;
  @ViewChild(ModalSupplierComponent, { static: false }) modalAddEdit: ModalSupplierComponent

  constructor(
    private notificationService: NotificationService
    , private supplierService: SupplierService, private _export: ExportService
  ) { }

  ngOnInit(): void {

    this.loadData();
  }
  exportExcel() {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', '9999')
      .set('keyword', this.keyword)
    this.busy = this.supplierService.getPaging(params).subscribe((res: ResponseValue<Pagination<Supplier>>) => {
      if (res.code == '200' || res.code == '201') {
        let listData = res.data?.items;
        this._export.exportExcel(listData, 'danh-muc-nha-cung-cap')
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
    this.busy = this.supplierService.getPaging(params).subscribe((res: ResponseValue<Pagination<Supplier>>) => {
      console.log(res);
      if (res.code == '200' || res.code == '201') {
        this.listSupplier = res.data?.items
        this.totalRows = res.data?.totalRows;
      }
      else {
        if (res.code == '204') {
          this.listSupplier = [];
          this.totalRows = 0;
        }
        else
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  clickRow(item: Supplier): void {
    item.checked = !item.checked;
    this.listSupplier.forEach(it => {
      if (it != item) it.checked = false;
    })
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listSupplier.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listSupplier[index].supplierCode.toString(), flag);
    }, 50);
  }

  viewByCode(item: Supplier, event: Event): void {
    event.stopPropagation();
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.supplierCode.toString(), true);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listSupplier.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.supplierService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listSupplier.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listSupplier)
      return this.listSupplier.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listSupplier.filter(x => x.checked);
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
}
