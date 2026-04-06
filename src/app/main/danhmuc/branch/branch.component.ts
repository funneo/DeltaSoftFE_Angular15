import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalBranchComponent } from '@app/shared/components/danhmuc/modal-branch/modal-branch.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Pagination, ResponseValue } from '@app/shared/models';
import { NotificationService, BranchService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {

  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listBranchs: Branch[];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalBranchComponent,{ static: false }) modalAddEdit: ModalBranchComponent
  constructor(private branchService: BranchService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      this.busy = this.branchService.getPaging(params).subscribe((res: ResponseValue<Pagination<Branch>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listBranchs = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: Branch): void {
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

  edit(flag: boolean,item:Branch=null): void {
    if(!item){
      const index = this.listBranchs.findIndex(x => x.checked);
      if(index!=-1)
      item=this.listBranchs[index];
    }
    let id=item?.id;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(id.toString(), flag);
    }, 50);
  }


  deleteConfirm(): void {
    let listChecks = this.listBranchs.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.branchService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listBranchs.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listBranchs)
      return this.listBranchs.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listBranchs.filter(x => x.checked);
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
