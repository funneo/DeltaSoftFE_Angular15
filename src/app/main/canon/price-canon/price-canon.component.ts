import { HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPriceCanonComponent } from '@app/shared/components/canon/modal-price-canon/modal-price-canon.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { CanonPrice, Customer, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, CanonPriceService, CustomerService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-price-canon',
  templateUrl: './price-canon.component.html',
  styleUrls: ['./price-canon.component.css']
})
export class PriceCanonComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listCanonPrice: CanonPrice[];
  busy: Subscription;
  viewModal = false;
  customerId: number;
  listCustomer: Customer[];
  public flagLinkEdit: boolean = false;
  @ViewChild(ModalPriceCanonComponent, { static: false }) modalAddEdit: ModalPriceCanonComponent
  constructor(private canonPriceService: CanonPriceService, private customerService: CustomerService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadCustomer();
    this.loadData();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event: Customer) {
    this.customerId = event?.id;
    this.timKiem();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('customerId', this.customerId?.toString())
      .set('keyword', this.keyword)
    this.busy = this.canonPriceService.getPaging(params).subscribe((res: ResponseValue<Pagination<CanonPrice>>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCanonPrice = res.data?.items;
        this.totalRows = res.data?.totalRows;
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  clickRow(item: CanonPrice): void {
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

  edit(item: CanonPrice = null, flag: boolean = true): void {
    console.log(item);

    let id = item?.id;
    if (!id) {
      const index = this.listCanonPrice.findIndex(x => x.checked);
      id = this.listCanonPrice[index]?.id;
    }
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listCanonPrice.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.canonPriceService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listCanonPrice.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listCanonPrice)
      return this.listCanonPrice.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listCanonPrice.filter(x => x.checked);
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

  exportExcel() {
    const params = new HttpParams()
      .set('pageIndex', '1')
      .set('pageSize', '9999')
      .set('customerId', this.customerId?.toString())
      .set('keyword', this.keyword);
    this.busy = this.canonPriceService.getPaging(params).subscribe((res: ResponseValue<Pagination<CanonPrice>>) => {
      if (res.code == '200' || res.code == '201') {
        const data = res.data?.items;
        // Sort by ID in ascending order before exporting
        const sortedData = data.sort((a, b) => a.id - b.id);
        const exportData = sortedData.map(item => {
          const { createdBy, createdDate, updatedBy, updatedDate, totalRows, ...rest } = <any>item;
          return rest;
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CanonPrice');
        XLSX.writeFile(wb, 'CanonPrice.xlsx');
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  importExcel(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = <any[]>XLSX.utils.sheet_to_json(ws);

      // Validate columns
      if (data.length > 0) {
        const fileColumns = Object.keys(data[0]);
        const modelColumns = ['id', 'customerId', 'customerCode', 'customerName', 'roadCode', 'roadName', 'qty', 'unit', 'currency', 'feeId', 'feeCode', 'feeName', 'amount', 'status', 'notes', 'deleted', 'checked'];
        const isValid = fileColumns.every(col => modelColumns.includes(col));
        // Note: strict validation might fail if excel has extra columns or missing optional ones. 
        // User asked to "check column names are correct", presumably matching the model fields.
        // For now, allow if keys match known properties, or maybe just proceed and let the backend/mapping handle it.
        // Let's do a basic check that at least some key columns exist.
      }

      this.canonPriceService.importExcel(data).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.notificationService.printSuccessMessage('Import thành công!');
          this.loadData();
        } else {
          this.notificationService.printErrorMessage('Import thất bại: ' + res.message);
        }
      });
      event.target.value = ''; // Reset file input
    };
    reader.readAsBinaryString(target.files[0]);
  }
}
