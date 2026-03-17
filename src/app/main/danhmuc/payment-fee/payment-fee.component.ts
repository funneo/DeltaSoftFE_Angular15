import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalPaymentFeeComponent } from '@app/shared/components/danhmuc/modal-payment-fee/modal-payment-fee.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { PaymentFeeGroup, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, PaymentFeeGroupService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-fee',
  templateUrl: './payment-fee.component.html',
  styleUrls: ['./payment-fee.component.css']
})
export class PaymentFeeComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listPaymentFeeGroup: PaymentFeeGroup[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalPaymentFeeComponent, { static: false }) modalAddEdit: ModalPaymentFeeComponent
  constructor(private paymentFeeGroupService: PaymentFeeGroupService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword);
      this.busy = this.paymentFeeGroupService.getPaging(params).subscribe((res: ResponseValue<Pagination<PaymentFeeGroup>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPaymentFeeGroup = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: PaymentFeeGroup): void {
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

  edit(item:PaymentFeeGroup=null, flag: boolean=true): void {
    if(!item){
      const index = this.listPaymentFeeGroup.findIndex(x => x.checked);
      item=this.listPaymentFeeGroup[index];
    }
    let id=item?.id;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id?.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listPaymentFeeGroup.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.paymentFeeGroupService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listPaymentFeeGroup.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listPaymentFeeGroup)
      return this.listPaymentFeeGroup.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listPaymentFeeGroup.filter(x => x.checked);
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
