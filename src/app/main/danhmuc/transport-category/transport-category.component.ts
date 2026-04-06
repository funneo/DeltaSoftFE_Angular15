import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTransportCategoryComponent } from '@app/shared/components/danhmuc/modal-transport-category/modal-transport-category.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, ResponseValue } from '@app/shared/models';
import { TransportCategory } from '@app/shared/models/danhmuc/transport-category.model';
import { AuthService, BranchService, NotificationService } from '@app/shared/services';
import { TransportCategoryService } from '@app/shared/services/danhmuc/transport-category.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transport-category',
  templateUrl: './transport-category.component.html',
  styleUrls: ['./transport-category.component.css']
})
export class TransportCategoryComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listData: TransportCategory[];
  listFilter: TransportCategory[];
  listType:any = [];
  busy: Subscription;
  viewModal = false;
  public flagLinkEdit:boolean = false;
  filterColumns: { [key: string]: string } = {};
  filterColumns1: { [key: string]: string } = {};
  sortKey: string = "";
  sortOrder: "asc" | "desc" = "asc";
  listBranch: Branch[];
  _branchId?:number;

  @ViewChild(ModalTransportCategoryComponent, { static: false }) modalAddEdit: ModalTransportCategoryComponent
  constructor(private service: TransportCategoryService, private notificationService: NotificationService, private authService:AuthService
    , private branchService:BranchService
  ) { 
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {

    this.service.getBranch().subscribe(data => {
      this.listType=data.list;
    });
    this.loadBranch();
    this.loadData();
  }
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch(event: Branch) {
    this._branchId = event?.id;
    this.loadData();
  }
  loadData(): void {
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('branchid', this._branchId?.toString());
      this.busy = this.service.getAll(params).subscribe((res: ResponseValue<TransportCategory[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listData = res.data;
          this.filterData();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  filterData(): void {
    this.listFilter = this.listData.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue =String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  }

  sortData(key: string): void {
    if (this.sortKey === key) {
      // Đảo chiều sắp xếp nếu cùng một cột được nhấp
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      // Sắp xếp theo cột mới
      this.sortOrder = "asc";
    }
    this.sortKey = key;
    this.listFilter.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue > bValue) {
        return this.sortOrder === "asc" ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sortOrder === "asc" ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  clickRow(item: TransportCategory): void {
    item.checked = !item.checked;
    this.listFilter.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listFilter.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listFilter[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listFilter.filter(x => x.checked);
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
    let checks = this.listFilter.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
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
